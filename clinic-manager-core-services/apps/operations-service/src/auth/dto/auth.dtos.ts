import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@pallmall/shared-types';
import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  Length,
  IsDateString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationQueryDto } from '@pallmall/common-utils';

/* ========================================================================== */
/* REQUEST DTOs (INPUT)                                                       */
/* ========================================================================== */

export class VerifyOtpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    example: '123456',
    description: '6-digit OTP code',
  })
  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'OTP must contain only numbers' })
  otp: string;
}

export class SignupDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiPropertyOptional({
    example: 'StrongP@ssw0rd!',
    description:
      'User password (min 8 characters, must contain uppercase, lowercase, number, and special character)',
    minLength: 8,
  })
  @IsString()
  @IsOptional()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password?: string;

  @ApiProperty({
    example: 'DOCTOR',
    enum: UserRole,
    description: 'User role',
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
    required: false,
  })
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: '9876543210',
    description: 'User phone number (10 digits)',
    required: false,
  })
  @IsOptional()
  @Matches(/^((?!([0-9])\2{9})[6-9][0-9]{9}|(?!([0-9])\3{10})07[0-9]{9})$/, {
    message: 'Phone number must be exactly 10 digits',
  })
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: '1995-08-15',
    description: 'Date of birth (YYYY-MM-DD format)',
    required: false,
  })
  @IsDateString({}, { message: 'DOB must be in format YYYY-MM-DD' })
  @IsOptional()
  dob?: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: 'reset-token-uuid-123' })
  @IsString()
  resetToken: string;

  @ApiProperty({
    example: 'NewStrongP@ssw0rd!',
    description:
      'New password (min 8 characters, must contain uppercase, lowercase, number, and special character)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  newPassword: string;
}

export class ResetPasswordMobileDto {
  @ApiProperty({
    example: 'OldStrongP@ssw0rd!',
  })
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  oldPassword: string;

  @ApiProperty({
    example: 'NewStrongP@ssw0rd!',
    description:
      'New password (min 8 characters, must contain uppercase, lowercase, number, and special character)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  newPassword: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address to send OTP',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Is this a signup flow?',
  })
  @IsBoolean()
  @IsOptional()
  signup?: boolean;
}

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd!',
    description: 'User password',
  })
  @IsString()
  password: string;

  @ApiProperty({
    example: true,
    description: 'Remember me session',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  rememberMe?: boolean;

  @ApiPropertyOptional({
    example: 'website',
    description: 'Device type or identifier',
  })
  @IsString()
  @IsOptional()
  device?: string;

  @ApiPropertyOptional({
    example: 'fcm_device_token_here',
    description:
      'Firebase Cloud Messaging device token (required for mobile login)',
  })
  @IsString()
  @IsOptional()
  fcmToken?: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token string',
  })
  @IsString()
  @IsOptional()
  refreshToken?: string;
}

export class PatientPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd!',
    description:
      'New password (min 8 characters, must contain uppercase, lowercase, number, and special character)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;
}

export class SyncUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    example: UserRole.DOCTOR,
    enum: UserRole,
    description: 'User role',
  })
  @IsEnum(UserRole)
  role: UserRole;
}

export class UserListDto {
  @ApiPropertyOptional({
    example: 'DOCTOR,PATIENT',
    description: 'User role types (comma separated)',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').map((v) => v.trim()) : value,
  )
  @IsArray()
  @IsEnum(UserRole, {
    each: true,
    message: 'Each roleType value must be a valid UserRole',
  })
  @IsOptional()
  roleType?: UserRole[];

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Search by name',
  })
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    example: 'ADMIN,NURSE',
    description: 'Exclude user role types (comma separated)',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').map((v) => v.trim()) : value,
  )
  @IsArray()
  @IsEnum(UserRole, {
    each: true,
    message: 'Each exclude value must be a valid UserRole',
  })
  @IsOptional()
  exclude?: UserRole[];
}

/* ========================================================================== */
/* RESPONSE OBJECTS (OUTPUT)                                                  */
/* ========================================================================== */

export class UserResponseObject {
  @ApiProperty({ example: 'uuid-1234-5678' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe', nullable: true })
  name: string;

  @ApiProperty({ enum: UserRole, example: 'DOCTOR' })
  role: UserRole;

  @ApiProperty({ example: '9876543210', nullable: true })
  phoneNumber: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;
}

export class TokenResponseObject {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  refreshToken?: string;
}

export class googleToken {
  @ApiProperty({
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  idToken: string;

  @ApiPropertyOptional({
    example: 'fcm_device_token_here',
  })
  @IsString()
  @IsOptional()
  fcmToken?: string;
}

export class AuthResponseData extends UserResponseObject {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;
}

/* ========================================================================== */
/* API RESPONSE WRAPPERS (SWAGGER)                                            */
/* ========================================================================== */

export class AuthResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: () => AuthResponseData })
  data: AuthResponseData;

  @ApiProperty({ example: 'Operation successful' })
  message: string;

  @ApiProperty({ example: 201 })
  statusCode: number;
}

export class TokenRefreshResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: () => TokenResponseObject })
  data: TokenResponseObject;

  @ApiProperty({ example: 'Access token issued' })
  message: string;

  @ApiProperty({ example: 201 })
  statusCode: number;
}

export class GenericResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: {} })
  data: any;

  @ApiProperty({ example: 'Operation successful' })
  message: string;

  @ApiProperty({ example: 200 })
  statusCode: number;
}

export class UserListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: () => [UserResponseObject] })
  data: UserResponseObject[];

  @ApiProperty({ example: 'User data fetched successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  statusCode: number;
}

export class ForceUpdateDataDto {
  @ApiProperty({ example: '1.0.5' })
  android: string;

  @ApiProperty({ example: '1.0.0' })
  ios: string | null;
}

/* ========================================================================== */
/* USER APPOINTMENTS LIST DTOs                                                */
/* ========================================================================== */

export class UserAppointmentsListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    example: {
      users: [
        {
          userId: 'uuid',
          name: 'Dr. Smith',
          email: 'dr.smith@example.com',
          role: 'DOCTOR',
          threadId: 'uuid-thread-id',
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    },
  })
  data: any;
}

export class UserAppointmentsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: 'Dr. Smith',
    description: 'Search by user name or email',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class ForceUpdateResponseDto {
  @ApiProperty({ example: 200 })
  successCode: number;

  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ type: [ForceUpdateDataDto] })
  data: ForceUpdateDataDto[];
}
