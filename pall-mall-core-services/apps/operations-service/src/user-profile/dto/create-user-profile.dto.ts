import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserProfileDto {
  @ApiPropertyOptional({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Phone number of the user',
    example: '+1234567890',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Gender of the user', example: 'MALE' })
  @IsEnum(['MALE', 'FEMALE', 'OTHER'])
  @IsOptional()
  gender?: 'MALE' | 'FEMALE' | 'OTHER';

  @ApiPropertyOptional({ description: 'Age of the user', example: 30 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  age?: number;

  @ApiPropertyOptional({
    description: 'Height of the user in centimeters',
    example: 175,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  height?: number;

  @ApiPropertyOptional({
    description: 'Weight of the user in kilograms',
    example: 70,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({
    description: 'Blood group of the user',
    example: 'A+',
  })
  @IsString()
  @IsOptional()
  bloodGroup?: string;

  @ApiPropertyOptional({
    description: 'Profile image URL',
    example: 'http://example.com/profile.jpg',
  })
  @IsString()
  @IsOptional()
  profileImage?: string;

  @ApiPropertyOptional({
    description: 'Date of birth of the user',
    example: '1990-01-01',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'dateOfBirth must be a valid date (YYYY-MM-DD)' },
  )
  dateOfBirth?: string;
}
