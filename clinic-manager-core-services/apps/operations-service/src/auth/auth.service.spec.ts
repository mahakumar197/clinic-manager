import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { OtpService } from './services/otp.service';
import { TokenService } from './services/token.service';
import { AuthAttemptService } from './services/auth-attempt.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserProfileService } from '../user-profile/user-profile.service';
import { NotificationClientService } from './services/notifications-client.service';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForceUpdate } from './entities/force-update.entity';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@pallmall/shared-types';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let otpService: jest.Mocked<OtpService>;
  let tokenService: jest.Mocked<TokenService>;
  let authAttemptService: jest.Mocked<AuthAttemptService>;
  let userProfileService: jest.Mocked<UserProfileService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    passwordHash: '$2b$12$hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    role: 'patient',
    isActive: true,
    isEmailVerified: true,
    tokenVersion: 0,
    failedLoginAttempts: 0,
    lockedUntil: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: OtpService,
          useValue: {
            generateOtp: jest.fn(),
            verifyOtp: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generateTokens: jest.fn(),
            revokeAllUserTokens: jest.fn(),
          },
        },
        {
          provide: AuthAttemptService,
          useValue: {
            isAccountLocked: jest.fn(),
            checkIpRateLimit: jest.fn(),
            logAttempt: jest.fn(),
            resetFailedAttempts: jest.fn(),
          },
        },
        {
          provide: UserProfileService,
          useValue: {
            createOrUpdateProfile: jest.fn(),
          },
        },
        {
          provide: NotificationClientService,
          useValue: {
            sendPasswordResetOtpEmail: jest.fn(),
            sendVerifyOtpEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost'),
          },
        },
        {
          provide: getRepositoryToken(ForceUpdate),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    otpService = module.get(OtpService);
    tokenService = module.get(TokenService);
    authAttemptService = module.get(AuthAttemptService);
    userProfileService = module.get(UserProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const signupDto = {
      email: 'newuser@example.com',
      password: 'Password@123',
      name: 'New User',
      role: 'PATIENT' as UserRole,
    };

    it('should successfully register a new user', async () => {
      usersService.findOneByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser as any);
      tokenService.generateTokens.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const result = await service.register(signupDto, '127.0.0.1');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(usersService.create).toHaveBeenCalled();
      expect(userProfileService.createOrUpdateProfile).toHaveBeenCalled();
      expect(authAttemptService.logAttempt).toHaveBeenCalled();
    });

    it('should throw BadRequestException if user already exists', async () => {
      usersService.findOneByEmail.mockResolvedValue(mockUser as any);

      await expect(service.register(signupDto, '127.0.0.1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password@123',
    };

    it('should successfully login with valid credentials', async () => {
      authAttemptService.isAccountLocked.mockResolvedValue(false);
      authAttemptService.checkIpRateLimit.mockResolvedValue(false);
      usersService.findOneByEmail.mockResolvedValue(mockUser as any);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
      tokenService.generateTokens.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const result = await service.login(loginDto, '127.0.0.1', 'user-agent');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(authAttemptService.resetFailedAttempts).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if account is locked', async () => {
      authAttemptService.isAccountLocked.mockResolvedValue(true);

      await expect(
        service.login(loginDto, '127.0.0.1', 'user-agent'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      authAttemptService.isAccountLocked.mockResolvedValue(false);
      authAttemptService.checkIpRateLimit.mockResolvedValue(false);
      usersService.findOneByEmail.mockResolvedValue(mockUser as any);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      await expect(
        service.login(loginDto, '127.0.0.1', 'user-agent'),
      ).rejects.toThrow(UnauthorizedException);
      expect(authAttemptService.logAttempt).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        false,
        'Invalid password',
        expect.any(String),
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      authAttemptService.isAccountLocked.mockResolvedValue(false);
      authAttemptService.checkIpRateLimit.mockResolvedValue(false);
      usersService.findOneByEmail.mockResolvedValue(null);

      await expect(
        service.login(loginDto, '127.0.0.1', 'user-agent'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('should generate OTP for valid email', async () => {
      usersService.findOneByEmail.mockResolvedValue(mockUser as any);
      otpService.generateOtp.mockResolvedValue('123456');

      const result = await service.forgotPassword(
        'test@example.com',
        '127.0.0.1',
        false,
      );

      expect(result).toHaveProperty('message');
      expect(otpService.generateOtp).toHaveBeenCalled();
    });

    it('should return generic message for non-existent email', async () => {
      usersService.findOneByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword(
        'nonexistent@example.com',
        '127.0.0.1',
        true,
      );

      expect(result.message).toBe('If the email exists, an OTP has been sent');
      expect(otpService.generateOtp).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid OTP', async () => {
      usersService.update.mockResolvedValue(mockUser as any);

      const result = await service.resetPassword(
        'test@example.com',
        'reset-token',
        'NewPassword@123',
      );

      expect(result.message).toBe('Password reset successfully');
      expect(usersService.update).toHaveBeenCalled();
      expect(tokenService.revokeAllUserTokens).toHaveBeenCalled();
    });
  });
});
