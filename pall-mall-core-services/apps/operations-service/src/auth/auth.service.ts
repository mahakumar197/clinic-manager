import {
  Injectable,
  BadRequestException,
  ConflictException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { OtpService } from './services/otp.service';
import { OAuth2Client } from 'google-auth-library';
import {
  TokenService,
  TokenPayload,
  TokenPair,
} from './services/token.service';
import { AuthAttemptService } from './services/auth-attempt.service';
import { UserProfileService } from '../user-profile/user-profile.service';
import * as bcrypt from 'bcrypt';
import { PlatformType } from './entities/force-update.entity';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  SignupDto,
  UserListDto,
  LoginDto,
  PatientPasswordDto,
  ResetPasswordMobileDto,
  SyncUserDto,
  UserAppointmentsQueryDto,
} from './dto/auth.dtos';

import {
  AUTH_MESSAGES,
  API_ENDPOINTS,
  PatientPhaseId,
} from '@pallmall/common-utils';
import { NotificationClientService } from './services/notifications-client.service';
import {
  UserRole,
  ApiError,
  ApiResponse,
  ApiResponseBuilder,
  HttpStatus,
} from '@pallmall/shared-types';
import { JwtService } from '@nestjs/jwt';
import { JwtTimeSpan, parseJwtTimeSpan } from '../common/types/jwt.types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForceUpdate } from './entities/force-update.entity';
import {
  SocialProvider,
  AUTH_PROVIDER_MAP,
} from '../common/providers/authProvider';
import { ResetToken } from './entities/reset-token.entity';
import { logger } from '@pallmall/logger';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private client: OAuth2Client;
  constructor(
    private usersService: UsersService,
    private otpService: OtpService,
    private tokenService: TokenService,
    private authAttemptService: AuthAttemptService,
    private notificationsClient: NotificationClientService,
    private jwtService: JwtService,
    private httpService: HttpService,
    private configService: ConfigService,
    private userProfileService: UserProfileService,

    @InjectRepository(ForceUpdate)
    private readonly forceUpdateRepo: Repository<ForceUpdate>,
    @InjectRepository(ResetToken)
    private readonly passwordResetTokenRepository: Repository<ResetToken>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    this.client = new OAuth2Client(this.configService.get('GOOGLE_CLIENT_ID'));
  }

  /**
   * Validate user credentials (used by LocalStrategy)
   */
  async validateUser(email: string, password: string): Promise<any> {
    this.logger.debug('validateUser --->');
    const user = await this.usersService.findOneByEmail(email);

    if (
      user &&
      user.passwordHash &&
      (await bcrypt.compare(password, user.passwordHash))
    ) {
      const { passwordHash, ...result } = user;
      return result;
    }

    return null;
  }

  /**
   * Register new user with email and password
   */
  async register(
    signupDto: SignupDto,
    ipAddress: string,
  ): Promise<{ user: User; accessToken: string; refreshToken?: string }> {
    this.logger.log('register --->');
    const { email, password, name, phoneNumber, dob, role } = signupDto;
    const dobValue = dob ? new Date(dob) : null;

    // Check if user already exists
    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // // Validate password requirement based on role
    // if (role !== UserRole.PATIENT && !password) {
    //   throw new BadRequestException(
    //     'Password is required for non-patient roles',
    //   );
    // }

    // Hash password only if provided (patients may not have passwords)
    let hashedPassword: string | null = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }
    let isEmailVerified: boolean = false;
    if (role === UserRole.PATIENT) {
      isEmailVerified = true;
    }
    let userCreationData: Partial<User> = {
      email,
      passwordHash: hashedPassword,
      userName: name,
      phoneNumber: phoneNumber,
      dob: dobValue,
      role,
      isEmailVerified,
      authProvider: 'EMAIL',
    };
    // Create user
    if (role == UserRole.PATIENT) {
      userCreationData.patient_phase_id = PatientPhaseId.Guest;
    }
    const user = await this.usersService.create(userCreationData);

    // Create user profile if role is patient
    if (role === UserRole.PATIENT) {
      try {
        await this.userProfileService.createOrUpdateProfile(user.id, {
          fullName: name,
          phone: phoneNumber,
          dateOfBirth: dob,
        });
      } catch (profileError) {
        this.logger.error(
          `Failed to create user profile for patient ${user.id}: ${profileError.message}`,
        );
      }
    }

    // Generate tokens
    const tokens = await this.tokenService.generateTokens(
      user,
      undefined,
      ipAddress,
      undefined,
      true,
    );

    // Log successful registration
    await this.authAttemptService.logAttempt(
      email,
      ipAddress,
      '',
      true,
      undefined,
      user.id,
    );
    const { passwordHash, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword as User,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken, // safe since generateTokens always returns it
    };
  }

  /**
   * Login with email and password
   */
  async login(
    loginDto: LoginDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ user: User; accessToken: string; refreshToken?: string }> {
    this.logger.log('login --->');
    const { email, password, rememberMe = false, fcmToken } = loginDto;

    // Check if account is locked
    const isLocked = await this.authAttemptService.isAccountLocked(email);
    if (isLocked) {
      await this.authAttemptService.logAttempt(
        email,
        ipAddress,
        userAgent,
        false,
        'Account locked',
      );
      throw new ConflictException(
        'Account is temporarily locked due to multiple failed login attempts',
      );
    }

    // Check IP rate limit
    // const ipBlocked = await this.authAttemptService.checkIpRateLimit(ipAddress);
    // if (ipBlocked) {
    //   throw new ConflictException(
    //     'Too many failed attempts from this IP address',
    //   );
    // }

    // Find user
    const user = await this.usersService.findOneByEmail(email);

    // FIX: Validate existence BEFORE validating role/device access
    if (!user || !user.passwordHash) {
      await this.authAttemptService.logAttempt(
        email,
        ipAddress,
        userAgent,
        false,
        'User not found',
      );
      throw new ConflictException('User not found');
    }

    // Role and device validations (safe now because we know 'user' exists)
    if (user.role === UserRole.PATIENT && loginDto.device === 'website') {
      throw new ConflictException('Permission denied for the user');
    }
    if (user.role !== UserRole.PATIENT && !loginDto.device) {
      throw new ConflictException('Permission denied for the user');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      const MAX_LOGIN_ATTEMPTS = 10000;
      const remainingAttempts =
        MAX_LOGIN_ATTEMPTS - (user.failedLoginAttempts + 1);
      await this.authAttemptService.logAttempt(
        email,
        ipAddress,
        userAgent,
        false,
        'Invalid password',
        user.id,
      );
      if (remainingAttempts <= 0) {
        throw new ConflictException(
          'Account locked due to multiple failed login attempts',
        );
      }
      throw new ConflictException(
        `Invalid credentials. ${remainingAttempts} login attempt(s) remaining`,
      );
    }

    // Check if account is active
    if (!user.isActive) {
      await this.authAttemptService.logAttempt(
        email,
        ipAddress,
        userAgent,
        false,
        'Account inactive',
        user.id,
      );
      throw new ConflictException('Account is inactive');
    }

    if (user.status === 'suspended') {
      const suspendedUntil = user.suspended_until
        ? new Date(user.suspended_until)
        : null;
      if (suspendedUntil == null || suspendedUntil > new Date()) {
        await this.authAttemptService.logAttempt(
          email,
          ipAddress,
          userAgent,
          false,
          'Account suspended',
          user.id,
        );
        throw new ConflictException('Account is suspended');
      }
    }

    // Generate tokens
    const tokens = await this.tokenService.generateTokens(
      user,
      undefined,
      ipAddress,
      userAgent,
      rememberMe,
    );

    // Reset failed attempts and log successful login
    await this.authAttemptService.resetFailedAttempts(user.id);
    await this.authAttemptService.logAttempt(
      email,
      ipAddress,
      userAgent,
      true,
      undefined,
      user.id,
    );

    if (fcmToken) {
      try {
        await this.usersService.update(user.id, { fcmToken } as any);
      } catch (e) {
        this.logger.warn(
          `Failed to save FCM token for user ${user.id}: ${e?.message ?? e}`,
        );
      }
    }

    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: {
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
        userName: userWithoutPassword.userName,
        phoneNumber: userWithoutPassword.phoneNumber,
        dob: userWithoutPassword.dob,
        role: userWithoutPassword.role,
        patient_phase_id: userWithoutPassword.patient_phase_id,
      } as User,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async patientPassword(patientPasswordDto: PatientPasswordDto) {
    this.logger.log('patientPassword --->');
    try {
      const { email, password } = patientPasswordDto;
      const user = await this.usersService.findOneByEmail(email);
      if (!user) {
        throw new ConflictException('Invalid credentials');
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      await this.usersService.update(user.id, {
        passwordHash: hashedPassword,
        isEmailVerified: true,
      });
      return { message: 'Password updated successfully' };
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  /**
   * Request password reset (generates and sends OTP)
   */
  async forgotPassword(
    email: string,
    ipAddress: string,
    signup: boolean | undefined,
  ) {
    this.logger.log('forgotPassword --->');
    const user = await this.usersService.findOneByEmail(email);
    // Validate user existence before generating OTP
    if (!user) {
      throw new BadRequestException('Email is not registered');
    }

    // Generate OTP
    const otp = await this.otpService.generateOtp(user.id, ipAddress);
    try {
      if (signup === false || signup === undefined) {
        await this.notificationsClient.sendPasswordResetOtpEmail(
          user.email,
          otp,
        );
      } else {
        await this.notificationsClient.sendVerifyOtpEmail(user.email, otp);
      }
    } catch (error) {
      this.logger.error('Failed to send OTP email:', error);
    }

    // TODO: Send OTP via Notification Service (email)
    // For now, we'll just log it (in production, this should be sent via email)
    // this.logger.debug(`OTP for ${email}: ${otp}`);

    return new ApiResponseBuilder().success(
      {},
      'If the email exists, an OTP has been sent',
      HttpStatus.CREATED,
    );
  }

  /**
   * Verify OTP code
   */
  async verifyOtp(
    email: string,
    otp: string,
  ): Promise<{ valid: boolean; message: string; resetToken: string }> {
    this.logger.log('verifyOtp --->');
    try {
      const user = await this.otpService.verifyOtp(email, otp);

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const resetTokenEntity = this.passwordResetTokenRepository.create({
        userId: user.id,
        expiresAt,
        used: false,
      });

      const savedToken =
        await this.passwordResetTokenRepository.save(resetTokenEntity);

      return {
        valid: true,
        message: 'OTP verified successfully',
        resetToken: savedToken.id,
      };
    } catch (error) {
      throw new BadRequestException(error?.message || 'Invalid or expired OTP');
    }
  }

  /**
   * Reset password with OTP
   */
  async resetPassword(
    email: string,
    resetToken: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    this.logger.log('resetPassword --->');
    const tokenEntity = await this.passwordResetTokenRepository.findOne({
      where: {
        id: resetToken,
        used: false,
      },
      relations: ['user'],
    });

    if (!tokenEntity) {
      throw new ConflictException('Invalid or used reset token');
    }

    if (new Date() > tokenEntity.expiresAt) {
      throw new ConflictException('Reset token has expired');
    }

    const user = await this.usersService.findOneByEmail(email);
    if (!user || user.id !== tokenEntity.userId) {
      throw new ConflictException('Token mismatch');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.usersService.update(user.id, {
      passwordHash: hashedPassword,
      tokenVersion: user.tokenVersion + 1,
    });

    await this.passwordResetTokenRepository.update(tokenEntity.id, {
      used: true,
    });

    // Revoke all refresh tokens
    await this.tokenService.revokeAllUserTokens(user.id);

    return { message: 'Password reset successfully' };
  }

  /**
   * Reset password (mobile) without OTP
   */
  async resetPasswordMobile(dto: ResetPasswordMobileDto, token: string) {
    this.logger.log('resetPasswordMobile --->');
    if (dto.oldPassword === dto.newPassword) {
      throw new BadRequestException(
        'Old password and new password cannot be same.',
      );
    }
    const actualToken = token.split(' ')[1];
    const userData = this.jwtService.verify(actualToken);
    const user = await this.usersService.findOneById(userData.userId);
    this.logger.log(`Reset password via mobile --->>> ${userData.email}`);
    if (!user) {
      throw new ConflictException('User not found');
    }
    if (!user.passwordHash) {
      throw new ConflictException(
        'User must have registered using social account. Please login using social account',
      );
    }
    const isPasswordValid = await bcrypt.compare(
      dto.oldPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new ConflictException('Invalid old password');
    }
    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
    await this.usersService.update(user.id, {
      passwordHash: hashedPassword,
      tokenVersion: user.tokenVersion + 1,
    });
    await this.tokenService.revokeAllUserTokens(user.id);
    return { message: 'Password reset successfully' };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    this.logger.log('refreshToken --->');
    return await this.tokenService.refreshAccessToken(refreshToken);
  }

  /**
   * Logout user (revoke refresh token)
   */
  async logout(refreshToken: string): Promise<{ message: string }> {
    this.logger.log('logout --->');
    try {
      const payload = await this.tokenService.validateRefreshToken(
        refreshToken as any,
      );
      await this.tokenService.revokeToken(refreshToken);
      await this.usersService.updateLastLogin(payload.userId);
      return { message: 'Logged out successfully' };
    } catch (err) {
      throw new ConflictException(err?.message || 'Invalid refresh token');
    }
  }

  /**
   * Handle social login (Google, Facebook, Apple)
   */
  async socialLogin(
    profile: any,
    provider: SocialProvider,
    ipAddress: string,
    userAgent: string,
    fcmToken?: string,
  ) {
    this.logger.log('socialLogin --->');
    const email = profile.email;

    if (!email) {
      throw new BadRequestException('Email not provided by social provider');
    }

    let isEmailVerified = true;

    if (provider !== 'google') {
      isEmailVerified =
        profile?.verified_email === true || profile?.email_verified === true;
    }

    if (!isEmailVerified) {
      throw new ConflictException('Email not verified by social provider');
    }

    const providerField: 'googleId' | 'facebookId' | 'appleId' =
      provider === 'google'
        ? 'googleId'
        : provider === 'facebook'
          ? 'facebookId'
          : 'appleId';

    const providerId = profile.id;
    if (!providerId) {
      throw new ConflictException('Invalid social provider profile');
    }

    let user = await this.usersService.findOneByEmail(email);

    if (userAgent === 'mobile' && user) {
      if (user.role !== UserRole.PATIENT) {
        throw new ForbiddenException('Permission denied');
      }
    }

    if (!user) {
      if (userAgent !== 'mobile') {
        throw new ConflictException('Access denied');
      }

      this.logger.log(`Creating new user from social signup: ${email}`);

      const fullName =
        [profile.firstName, profile.lastName].filter(Boolean).join(' ') ||
        'Unknown';

      user = await this.usersService.create({
        email,
        userName: fullName,
        role: UserRole.PATIENT,
        isEmailVerified: true,
        authProvider: AUTH_PROVIDER_MAP[provider],
        [providerField]: providerId,
        fcmToken,
        patient_phase_id: PatientPhaseId.Guest,
      });

      try {
        await this.userProfileService.createOrUpdateProfile(user.id, {
          fullName,
        });
      } catch (profileError) {
        this.logger.error(
          `Failed to create user profile for social signup ${user.id}: ${profileError.message}`,
        );
      }
    } else {
      if (user[providerField] && user[providerField] !== providerId) {
        throw new ConflictException(
          'This social account is linked to another user',
        );
      }

      if (!user[providerField]) {
        await this.usersService.update(user.id, {
          [providerField]: providerId,
          authProvider: AUTH_PROVIDER_MAP[provider],
          isEmailVerified: true,
        });
      }

      if (userAgent === 'mobile' && fcmToken) {
        await this.usersService.update(user.id, { fcmToken });
      }

      user = await this.usersService.findOneByEmail(email);
    }

    if (!user) {
      throw new ConflictException(
        'An error occurred while retrieving or creating the user account.',
      );
    }

    const tokens = await this.tokenService.generateTokens(
      user,
      undefined,
      ipAddress,
      userAgent,
      true,
    );

    await this.authAttemptService.logAttempt(
      email,
      ipAddress,
      userAgent,
      true,
      undefined,
      user.id,
    );

    const { passwordHash, ...safeUser } = user;

    return {
      user: safeUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async verifyIdToken(idToken: string) {
    this.logger.debug('verifyIdToken --->');
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.configService.get('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();

      if (!payload?.email) {
        throw new BadRequestException('Invalid Google token payload');
      }

      return {
        id: payload.sub,
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        picture: payload.picture,
        email_verified: payload.email_verified === true,
        provider: 'google',
      };
    } catch (e) {
      if (e?.message?.includes('Token used too late')) {
        throw new ConflictException('Google token expired. Please re-login.');
      }
      throw e;
    }
  }

  /**
   * Fetch user data for multiple user IDs
   */
  async getUserData(userIds: string[]) {
    this.logger.log('getUserData --->');
    if (!userIds || userIds.length === 0) {
      this.logger.error(
        `Error in getUserData: ${AUTH_MESSAGES.NO_USER_IDS_PROVIDED}`,
      );
      throw new BadRequestException(AUTH_MESSAGES.NO_USER_IDS_PROVIDED);
    }

    // Fetch users in bulk
    const users = await this.usersService.find(userIds);

    // If none found, throw error
    if (users.length === 0) {
      this.logger.error(`Error in getUserData: ${AUTH_MESSAGES.USER_DATA_NOT_FOUND}`);
      throw new BadRequestException(AUTH_MESSAGES.USER_DATA_NOT_FOUND);
    }

    return {
      success: true,
      message: AUTH_MESSAGES.USER_DATA_FETCHED,
      data: users,
    };
  }

  /**
   * Fetch user list based on role
   */
  async getUserList(userlistDto: UserListDto) {
    this.logger.log('getUserList --->');
    const { roleType, search, exclude } = userlistDto;
    const role = roleType || [];
    const searchQuery = search || '';
    const excludeQuery = exclude || [];

    const users = await this.usersService.findByRole(
      role,
      searchQuery,
      excludeQuery,
    );
    return users;
  }

  async getUserDataFromToken(accessToken: string) {
    this.logger.debug('getUserDataFromToken --->');
    const userData = await this.tokenService.getUserDataFromToken(accessToken);
    const user = await this.usersService.findOneById(userData.userId);
    const { passwordHash, ...userWithoutPassword } = user as User;
    return userWithoutPassword;
  }

  /**
   * Sync user from Zoho CRM
   */
  async syncUser(syncDto: SyncUserDto) {
    this.logger.log('syncUser --->');
    try {
      this.logger.log(
        `Syncing user from Zoho CRM: ${syncDto.email} (${syncDto.role})`,
      );
      const { name, email, role } = syncDto;

      let user = await this.usersService.findOneByEmail(email);

      this.logger.log(`User found from Zoho sync: ${email} (${role})`);

      if (!user) {
        this.logger.log(`Creating new user from Zoho sync: ${email} (${role})`);
        user = await this.usersService.create({
          email,
          userName: name,
          role: role as UserRole,
          isActive: true,
          passwordHash: null,
        });
      } else {
        // Update user if role or name has changed
        const updateData: Partial<User> = {};

        if (user.role !== role) {
          this.logger.log(
            `Updating role for user ${email}: ${user.role} -> ${role}`,
          );
          updateData.role = role as UserRole;
        }

        if (user.userName !== name) {
          this.logger.log(
            `Updating name for user ${email}: ${user.userName} -> ${name}`,
          );
          updateData.userName = name;
        }

        if (Object.keys(updateData).length > 0) {
          await this.usersService.update(user.id, updateData);
          user = await this.usersService.findOneByEmail(email);
          this.logger.log(`User updated successfully: ${email}`);
        }
      }

      return user;
    } catch (error) {
      this.logger.error(
        `Error syncing user ${syncDto.email}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getLatestVersions() {
    this.logger.log('getLatestVersions --->');
    const records = await this.forceUpdateRepo.find({
      where: [
        { platform: PlatformType.ANDROID },
        { platform: PlatformType.IOS },
      ],
      order: { updated_at: 'DESC' },
    });

    const android = records.find((r) => r.platform === PlatformType.ANDROID);
    const ios = records.find((r) => r.platform === PlatformType.IOS);

    return [
      {
        android: android?.current_version || null,
        ios: ios?.current_version || null,
      },
    ];
  }

  /**
   * Fetch appointments from Zoho integration service
   */
  private async fetchAppointmentsFromZoho(token: string): Promise<any[]> {
    this.logger.debug('fetchAppointmentsFromZoho --->');
    const integrationServiceUrl =
      this.configService.get<string>('BASE_INTEGRATION');
    const appointmentsUrl = `${integrationServiceUrl}${API_ENDPOINTS.ZOHO_SERVICE.APPOINTMENTS}`;

    this.logger.log(`Fetching appointments from: ${appointmentsUrl}`);

    const response = await firstValueFrom(
      this.httpService.get(appointmentsUrl, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      }),
    );

    const appointmentsData = response.data?.data || [];
    this.logger.log(`Fetched ${appointmentsData.length} appointments`);

    return appointmentsData;
  }

  /**
   * Extract unique user names from appointments
   */
  private extractUserNamesFromAppointments(appointments: any[]): Set<string> {
    this.logger.debug('extractUserNamesFromAppointments --->');
    const userNames = new Set<string>();

    appointments.forEach((appointment: any) => {
      if (appointment.consultation?.surgeon) {
        userNames.add(appointment.consultation.surgeon.trim());
      }
      if (appointment.consultation?.coordinator) {
        userNames.add(appointment.consultation.coordinator.trim());
      }
      if (appointment.surgery?.surgeon) {
        userNames.add(appointment.surgery.surgeon.trim());
      }
      if (appointment.surgery?.coordinator) {
        userNames.add(appointment.surgery.coordinator.trim());
      }
    });

    this.logger.log(`Extracted ${userNames.size} unique user names`);
    return userNames;
  }

  /**
   * Filter users by search query
   */
  private filterUsersBySearch(users: User[], search?: string): User[] {
    this.logger.debug('filterUsersBySearch --->');
    if (!search) {
      return users;
    }

    const searchLower = search.toLowerCase();
    return users.filter(
      (user: User) =>
        user.userName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower),
    );
  }

  /**
   * Format user data for response
   */
  private formatUserData(users: User[]): any[] {
    this.logger.debug('formatUserData --->');
    return users.map((user: User) => ({
      userId: user.id,
      name: user.userName,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      dob: user.dob,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.last_login,
    }));
  }

  /**
   * Get user list from appointments
   */
  async getUserAppointmentsList(token: string, dto: UserAppointmentsQueryDto) {
    this.logger.log('getUserAppointmentsList --->');
    const { search, page = 1, limit = 10 } = dto;

    try {
      const appointmentsData = await this.fetchAppointmentsFromZoho(token);

      const userNames = this.extractUserNamesFromAppointments(appointmentsData);

      if (userNames.size === 0) {
        return new ApiResponseBuilder().paginated(
          [],
          {
            page,
            limit,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
          AUTH_MESSAGES.NO_USERS_FOUND,
        );
      }

      const users = await this.usersService.findByNames(Array.from(userNames));

      const filteredUsers = this.filterUsersBySearch(users, search);

      const total = filteredUsers.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

      const formattedUsers = this.formatUserData(paginatedUsers);

      // Fetch existing threads from content-service
      try {
        const providerIds = formattedUsers.map((u) => u.userId);
        const contentServiceUrl =
          this.configService.get<string>('BASE_CONTENT');
        const searchThreadsUrl = `${contentServiceUrl}${API_ENDPOINTS.CONTENT_SERVICE.SEARCH_THREADS_BULK}`;

        const threadResponse = await firstValueFrom(
          this.httpService.post(
            searchThreadsUrl,
            { provider_ids: providerIds },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: token,
              },
            },
          ),
        );

        if (threadResponse.data?.success) {
          const threadMap = threadResponse.data.data;
          formattedUsers.forEach((user) => {
            user.threadId = threadMap[user.userId] || null;
          });
        }
      } catch (threadError) {
        this.logger.warn(`Failed to fetch thread IDs: ${threadError.message}`);
        // Fallback: set threadId to null for all users
        formattedUsers.forEach((user) => {
          user.threadId = null;
        });
      }

      return new ApiResponseBuilder().paginated(
        formattedUsers,
        {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        AUTH_MESSAGES.USER_DATA_FETCHED,
      );
    } catch (error) {
      this.logger.error(
        `Failed to fetch user appointments list: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
  /**
   * Update patient phase
   */
  async updatePatientPhase(userId: string) {
    this.logger.log('updatePatientPhase --->');
    try {
      const user = await this.usersService.findOneById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      if (user.patient_phase_id === 143) {
        this.logger.log(
          `Patient phase already at final stage for user ${userId}`,
        );
        return user;
      }
      user.patient_phase_id = (user.patient_phase_id ?? 0) + 1;
      await this.usersService.update(userId, user);
      return user;
    } catch (error) {
      this.logger.error(
        `Failed to update patient phase: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getUserByEmailorName(name: string) {
    this.logger.log('getUserByEmailorName --->');
    try {
      const user = await this.usersService.findByNameOrEmail(name);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      this.logger.error(
        `Failed to get user by name or email: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getUsersByEmails(emails: string[]) {
    this.logger.log('getUsersByEmails --->');
    try {
      const users = await this.usersService.findByEmails(emails);
      if (!users) {
        throw new Error('User not found');
      }
      return users;
    } catch (error) {
      this.logger.error(
        `Failed to get user by emails: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updatePatientPhaseWebhook(userId: string, phase: number) {
    this.logger.log('updatePatientPhaseWebhook --->');
    try {
      const user = await this.usersService.findOneById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      if (user.patient_phase_id > phase) {
        this.logger.log(
          `Patient is already in advance phase. Cannot track back to previous phase`,
        );
        return user;
      }
      if (user.patient_phase_id === 143) {
        this.logger.log(
          `Patient phase already at final stage for user ${userId}`,
        );
        return user;
      }
      user.patient_phase_id = phase;
      await this.usersService.update(userId, user);
      return user;
    } catch (error) {
      this.logger.error(
        `Failed to update patient phase: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}