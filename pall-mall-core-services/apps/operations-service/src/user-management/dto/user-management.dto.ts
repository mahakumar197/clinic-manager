import {
  IsEmail,
  IsOptional,
  IsString,
  IsBoolean,
  IsNotEmpty,
  MinLength,
  Matches,
  IsInt,
  IsUUID,
  IsDateString,
  MaxLength,
  IsDefined,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'admin123@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'Role id', example: '95' })
  @Transform(({ value }) =>
    value === null || value === undefined ? value : String(value),
  )
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({ description: 'Department id', example: '103' })
  @Transform(({ value }) =>
    value === null || value === undefined ? value : String(value),
  )
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ description: 'Password', example: 'Password@123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must contain uppercase, lowercase, number/special character',
  })
  password: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+91 8015888091',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Enable two-factor authentication',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  twoFaEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Send a welcome email to the user',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  sendWelcomeEmail?: boolean;

  @ApiPropertyOptional({
    description: 'Additional notes about the user',
    example: 'He is a doctor with 3 years of experience',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  additionalNotes?: string;
}

export class UpdateUserDto {
  @ApiProperty({
    description: 'User id to update',
    example: '84205522-02ea-4458-bec6-e9cf98b7cd2f',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({ description: 'First name', example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name', example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+91 8015888091',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Department id', example: '106' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ description: 'Role id', example: '95' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({
    description: 'Enable two-factor authentication',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  twoFaEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Additional notes about the user',
    example: 'This user is a content editor',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  additionalNotes?: string;
}

export class SuspendUserDto {
  @ApiProperty({
    description: 'User id to suspend',
    example: '84205522-02ea-4458-bec6-e9cf98b7cd2f',
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Suspension duration id', example: '112' })
  @IsString()
  @IsNotEmpty()
  duration: string;

  @ApiPropertyOptional({
    description: 'Reason for suspension',
    example: 'Violation of terms',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}

export class UnsuspendUserDto {
  @ApiProperty({
    description: 'User id to unsuspend',
    example: '84205522-02ea-4458-bec6-e9cf98b7cd2f',
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Optional reason for unsuspension',
    required: false,
    example: 'Appeal accepted',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}

export class RolePermissionDto {
  @ApiPropertyOptional({ description: 'Role id', example: '95' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({ description: 'Module id', example: '121' })
  @IsString()
  module: string;

  @ApiProperty({ description: 'Permission' })
  @IsBoolean()
  enabled: boolean;
}

export class ListUsersDto {
  @ApiPropertyOptional({ description: 'Name or Email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'RoleID' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ description: 'StatusID' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Page number', example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'Page size', example: 10 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number;
}

export default {
  CreateUserDto,
  UpdateUserDto,
  SuspendUserDto,
  UnsuspendUserDto,
  RolePermissionDto,
  ListUsersDto,
};
