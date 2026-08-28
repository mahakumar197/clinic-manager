import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Ip,
  Headers,
  Query,
  UnauthorizedException,
  Res,
  Req,
  Put,
  Param,
} from '@nestjs/common';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { ApiResponseBuilder, HttpStatus } from '@pallmall/shared-types';
import { ConfigService } from '@nestjs/config';
import { AUTH_MESSAGES } from '@pallmall/common-utils';
import { ForceUpdateResponseDto, googleToken } from './dto/auth.dtos';

import {
  SignupDto,
  LoginDto,
  ForgotPasswordDto,
  VerifyOtpDto,
  ResetPasswordDto,
  ResetPasswordMobileDto,
  PatientPasswordDto,
  RefreshTokenDto,
  SyncUserDto,
  UserListDto,
  AuthResponseDto,
  TokenRefreshResponseDto,
  GenericResponseDto,
  UserListResponseDto,
  UserAppointmentsListResponseDto,
  UserAppointmentsQueryDto,
} from './dto/auth.dtos';
import { UsersService } from '../users/users.service';
import { DoctorPatientListQueryDto } from '../users/dto/users.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private configServices: ConfigService,
  ) {}

  // ==================== Email/Password Authentication ====================
  @Post('signup/email')
  @ApiOperation({ summary: 'Sign up with email and password' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or user exists',
  })
  @ApiBody({ type: SignupDto })
  async signupEmail(@Body() signupDto: SignupDto, @Ip() ipAddress: string) {
    const data = await this.authService.register(signupDto, ipAddress);
    return new ApiResponseBuilder().success(
      data,
      AUTH_MESSAGES.SIGNUP_SUCCESS,
      HttpStatus.CREATED,
    );
  }

  @Post('password-patient')
  @ApiOperation({ summary: 'Enter patient password' })
  @ApiResponse({
    status: 201,
    description: 'Password entered successfully',
    type: GenericResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or user exists',
  })
  @ApiBody({ type: PatientPasswordDto })
  async patientPassword(@Body() patientPasswordDto: PatientPasswordDto) {
    return this.authService.patientPassword(patientPasswordDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or account locked',
  })
  @ApiBody({ type: LoginDto })
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
    @Headers('x-requested-with') requestedWith: string,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const { rememberMe = false } = loginDto;
    // const isBrowserRequest = !requestedWith || requestedWith !== 'XMLHttpRequest'; // Unused var

    const result = await this.authService.login(
      loginDto,
      ipAddress,
      userAgent || '',
    );
    return new ApiResponseBuilder().success(
      result,
      AUTH_MESSAGES.LOGIN_SUCCESS,
      HttpStatus.CREATED,
    );
  }

  // ==================== Password Management ====================

  @Post('forgot-password')
  @ApiOperation({
    summary:
      'Request password reset - sends OTP to email // Patient email verify otp',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent if email exists',
    type: GenericResponseDto,
  })
  @ApiBody({ type: ForgotPasswordDto })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Ip() ipAddress: string,
  ) {
    return await this.authService.forgotPassword(
      forgotPasswordDto.email,
      ipAddress,
      forgotPasswordDto.signup,
    );
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP code for password reset' })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully',
    type: GenericResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  @ApiBody({ type: VerifyOtpDto })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const data = await this.authService.verifyOtp(
      verifyOtpDto.email,
      verifyOtpDto.otp,
    );
    return new ApiResponseBuilder().success(
      data,
      AUTH_MESSAGES.OTP_VERIFIED,
      HttpStatus.CREATED,
    );
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with verified OTP' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    type: GenericResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const data = await this.authService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.resetToken,
      resetPasswordDto.newPassword,
    );
    return new ApiResponseBuilder().success(
      data,
      AUTH_MESSAGES.PASSWORD_RESET_SUCCESS,
      HttpStatus.CREATED,
    );
  }

  @Post('reset-password-mobile')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Reset password with verified OTP' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  @ApiBody({ type: ResetPasswordMobileDto })
  async resetPasswordMobile(
    @Body() resetPasswordDto: ResetPasswordMobileDto,
    @Req() req: any,
  ) {
    const token = req.headers.authorization;
    const data = await this.authService.resetPasswordMobile(
      resetPasswordDto,
      token,
    );
    return new ApiResponseBuilder().success(
      data,
      AUTH_MESSAGES.PASSWORD_RESET_SUCCESS,
      HttpStatus.CREATED,
    );
  }

  // ==================== Token Management ====================

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({
    status: 200,
    description: 'New access token generated',
    type: TokenRefreshResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() req: ExpressRequest,
  ) {
    const refreshToken =
      req.cookies?.refreshToken || refreshTokenDto.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }
    const { accessToken } = await this.authService.refreshToken(refreshToken);
    const data = { accessToken };
    return new ApiResponseBuilder().success(
      data,
      AUTH_MESSAGES.ACCESS_TOKEN_ISSUED,
      HttpStatus.CREATED,
    );
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout - revoke refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully',
    type: GenericResponseDto,
  })
  @ApiBearerAuth()
  @ApiBody({ type: RefreshTokenDto })
  async logout(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const refreshToken =
      req.cookies?.refreshToken || refreshTokenDto.refreshToken;
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    return new ApiResponseBuilder().success(
      {},
      AUTH_MESSAGES.LOGOUT_SUCCESS,
      HttpStatus.OK,
    );
  }

  // ==================== Google OAuth ====================

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth flow' })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth' })
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: 200, description: 'Google authentication successful' })
  async googleAuthRedirect(
    @Request() req: ExpressRequest,
    @Res() res: ExpressResponse,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    console.log('Google req.user >>>', JSON.stringify(req.user, null, 2));
    const redirectBaseUrl = this.configServices.get('GOOGLE_REDIRECT_URL');
    const accessDeniedUrl = this.configServices.get('GOOGLE_ACCESS_DENIED_URL');
    try {
      const data = await this.authService.socialLogin(
        req.user,
        'google',
        ipAddress,
        userAgent || '',
      );
      return res.redirect(
        `${redirectBaseUrl}?accessToken=${data.accessToken}&refreshToken=${data.refreshToken}`,
      );
    } catch (error) {
      console.log('Google OAuth failed', error);
      return res.redirect(accessDeniedUrl);
    }
  }

  @Post('google/mobile')
  @ApiOperation({ summary: 'Google OAuth (Mobile SDK)' })
  async googleMobileLogin(@Ip() ipAddress: string, @Body() dto: googleToken) {
    const { idToken, fcmToken } = dto;
    if (!idToken) {
      throw new BadRequestException('idToken is required');
    }

    const profile = await this.authService.verifyIdToken(idToken);

    const data = await this.authService.socialLogin(
      profile,
      'google',
      ipAddress,
      'mobile',
      fcmToken,
    );
    return new ApiResponseBuilder().success(
      data,
      AUTH_MESSAGES.SOCIAL_SIGNUP_SUCCESS,
      HttpStatus.CREATED,
    );
  }

  @Post('signup/google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Sign up with Google OAuth' })
  @ApiResponse({
    status: 201,
    description: 'User registered with Google',
    type: AuthResponseDto,
  })
  async signupGoogle(
    @Request() req: ExpressRequest,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const data = await this.authService.socialLogin(
      req.user,
      'google',
      ipAddress,
      userAgent || '',
    );
    return new ApiResponseBuilder().success(
      data,
      AUTH_MESSAGES.SOCIAL_SIGNUP_SUCCESS,
      HttpStatus.CREATED,
    );
  }

  @Post('login/google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Login with Google OAuth' })
  @ApiResponse({
    status: 200,
    description: 'Login with Google successful',
    type: AuthResponseDto,
  })
  async loginGoogle(
    @Request() req: ExpressRequest,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const data = await this.authService.socialLogin(
      req.user,
      'google',
      ipAddress,
      userAgent || '',
    );
    return new ApiResponseBuilder().success(
      data,
      AUTH_MESSAGES.SOCIAL_LOGIN_SUCCESS,
      HttpStatus.OK,
    );
  }

  // ==================== Facebook OAuth ====================

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Initiate Facebook OAuth flow' })
  @ApiResponse({ status: 302, description: 'Redirects to Facebook OAuth' })
  async facebookAuth() {
    // Guard redirects to Facebook
  }

  @Get('facebook/redirect')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Facebook OAuth callback' })
  @ApiResponse({
    status: 200,
    description: 'Facebook authentication successful',
    type: AuthResponseDto,
  })
  async facebookAuthRedirect(
    @Request() req: ExpressRequest,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const data = await this.authService.socialLogin(
      req.user,
      'facebook',
      ipAddress,
      userAgent || '',
    );
    return new ApiResponseBuilder().success(
      data,
      AUTH_MESSAGES.USER_PROFILE_FETCHED,
      HttpStatus.OK,
    );
  }

  @Post('signup/facebook')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Sign up with Facebook OAuth' })
  @ApiResponse({
    status: 201,
    description: 'User registered with Facebook',
    type: AuthResponseDto,
  })
  async signupFacebook(
    @Request() req: ExpressRequest,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const data = await this.authService.socialLogin(
      req.user,
      'facebook',
      ipAddress,
      userAgent || '',
    );
    return new ApiResponseBuilder().success(
      data,
      AUTH_MESSAGES.SOCIAL_SIGNUP_SUCCESS,
      HttpStatus.CREATED,
    );
  }

  @Post('login/facebook')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Login with Facebook OAuth' })
  @ApiResponse({
    status: 200,
    description: 'Login with Facebook successful',
    type: AuthResponseDto,
  })
  async loginFacebook(
    @Request() req: ExpressRequest,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const data = await this.authService.socialLogin(
      req.user,
      'facebook',
      ipAddress,
      userAgent || '',
    );
    return new ApiResponseBuilder().success(
      data,
      AUTH_MESSAGES.SOCIAL_LOGIN_SUCCESS,
      HttpStatus.OK,
    );
  }

  // ==================== Apple OAuth ====================

  @Get('apple')
  @UseGuards(AuthGuard('apple'))
  @ApiOperation({ summary: 'Initiate Apple Sign In flow' })
  @ApiResponse({ status: 302, description: 'Redirects to Apple Sign In' })
  async appleAuth() {
    // Guard redirects to Apple
  }

  @Get('apple/redirect')
  @UseGuards(AuthGuard('apple'))
  @ApiOperation({ summary: 'Apple Sign In callback' })
  @ApiResponse({
    status: 200,
    description: 'Apple authentication successful',
    type: AuthResponseDto,
  })
  async appleAuthRedirect(
    @Request() req: ExpressRequest,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const data = await this.authService.socialLogin(
      req.user,
      'apple',
      ipAddress,
      userAgent || '',
    );

    return new ApiResponseBuilder().success(
      data,
      AUTH_MESSAGES.USER_PROFILE_FETCHED,
      HttpStatus.OK,
    );
  }

  @Post('signup/apple')
  @UseGuards(AuthGuard('apple'))
  @ApiOperation({ summary: 'Sign up with Apple Sign In' })
  @ApiResponse({
    status: 201,
    description: 'User registered with Apple',
    type: AuthResponseDto,
  })
  async signupApple(
    @Request() req: ExpressRequest,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const data = await this.authService.socialLogin(
      req.user,
      'apple',
      ipAddress,
      userAgent || '',
    );
    return new ApiResponseBuilder().success(
      data,
      AUTH_MESSAGES.SOCIAL_SIGNUP_SUCCESS,
      HttpStatus.CREATED,
    );
  }

  @Post('login/apple')
  @UseGuards(AuthGuard('apple'))
  @ApiOperation({ summary: 'Login with Apple Sign In' })
  @ApiResponse({
    status: 200,
    description: 'Login with Apple successful',
    type: AuthResponseDto,
  })
  async loginApple(
    @Request() req: ExpressRequest,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const data = await this.authService.socialLogin(
      req.user,
      'apple',
      ipAddress,
      userAgent || '',
    );
    return new ApiResponseBuilder().success(
      data,
      AUTH_MESSAGES.SOCIAL_LOGIN_SUCCESS,
      HttpStatus.OK,
    );
  }

  // ==================== Fetch userData based on User ID ====================

  @Get('user-data')
  @ApiOperation({ summary: 'Fetch user data based on User IDs' })
  @ApiResponse({
    status: 200,
    description: 'User data fetched successfully',
    type: UserListResponseDto,
  })
  async getUserData(@Query('ids') ids: string) {
    const idArray = ids.split(',');
    return this.authService.getUserData(idArray);
  }

  // ==================== Fetch userList based on roletype ====================

  @Get('user-list')
  @ApiOperation({ summary: 'Fetch user data based on roletype' })
  @ApiResponse({
    status: 200,
    description: 'User data fetched successfully',
    type: UserListResponseDto,
  })
  async getUserList(@Query() userlistDto: UserListDto) {
    return this.authService.getUserList(userlistDto);
  }

  @Get('user-by-email-or-name')
  @ApiOperation({ summary: 'Fetch user data based on email or name' })
  @ApiResponse({
    status: 200,
    description: 'User data fetched successfully',
    type: UserListResponseDto,
  })
  async getUserByEmailorName(@Query('emailOrName') emailOrName: string) {
    return this.authService.getUserByEmailorName(emailOrName);
  }

  @Get('user-by-emails')
  @ApiOperation({ summary: 'Fetch user data based on emails' })
  @ApiResponse({
    status: 200,
    description: 'User data fetched successfully',
    type: UserListResponseDto,
  })
  async getUsersByEmails(@Query('emails') emails: string) {
    const emailsArray = emails.split(',');
    return this.authService.getUsersByEmails(emailsArray);
  }

  // ==================== Fetch userData based on token ====================

  @Get('user-dataFromToken')
  @ApiOperation({ summary: 'Fetch user data based on User IDs' })
  @ApiResponse({
    status: 200,
    description: 'User data fetched successfully',
    type: AuthResponseDto,
  })
  async getUserDataFromToken(@Query('accessToken') accessToken: string) {
    return this.authService.getUserDataFromToken(accessToken);
  }

  // ==================== Force Update====================

  @Get('force-update')
  @ApiOperation({ summary: 'Get latest mobile app versions (Android & iOS)' })
  @ApiResponse({
    status: 200,
    description: 'Latest app versions fetched successfully',
    type: ForceUpdateResponseDto,
  })
  async getForceUpdateVersions() {
    const data = await this.authService.getLatestVersions();

    return {
      successCode: HttpStatus.OK,
      status: 'success',
      data,
    };
  }

  @Get('user-appointments-list')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user list from appointments' })
  @ApiResponse({
    status: 200,
    description: 'User list fetched successfully',
    type: UserAppointmentsListResponseDto,
  })
  async getUserAppointmentsList(
    @Req() req: any,
    @Query() dto: UserAppointmentsQueryDto,
  ) {
    const token = req.headers.authorization;
    return this.authService.getUserAppointmentsList(token, dto);
  }

  @Post('sync-user')
  @ApiOperation({ summary: 'Internal: Sync user from Zoho' })
  @ApiResponse({ status: 200, description: 'User synced successfully' })
  async syncUser(@Body() syncDto: SyncUserDto) {
    return this.authService.syncUser(syncDto);
  }

  @Get('doctor/patients')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get patients list for logged-in doctor' })
  async getDoctorPatients(
    @Req() req: any,
    @Query() query: DoctorPatientListQueryDto,
  ) {
    const doctorId = req.user.id;
    return this.usersService.getPatientsForDoctor(doctorId, query);
  }

  @Put('update-patient-phase')
  @ApiOperation({ summary: 'Update patient phase' })
  @ApiResponse({
    status: 200,
    description: 'Patient phase updated successfully',
    type: AuthResponseDto,
  })
  async updatePatientPhase(@Query('userId') userId: string) {
    return this.authService.updatePatientPhase(userId);
  }

  @Put('update-patient-phase-webhook')
  @ApiOperation({ summary: 'Update patient phase webhook' })
  @ApiResponse({
    status: 200,
    description: 'Patient phase updated successfully',
    type: AuthResponseDto,
  })
  async updatePatientPhaseWebhook(
    @Query('userId') userId: string,
    @Query('phase') phase: number,
  ) {
    return this.authService.updatePatientPhaseWebhook(userId, phase);
  }
}
