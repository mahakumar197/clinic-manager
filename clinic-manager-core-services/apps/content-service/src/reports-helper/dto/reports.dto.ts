import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DateFilterType } from '@pallmall/common-utils';

export class ReportsQueryDto {
  @ApiPropertyOptional({
    description:
      'Date filter type, use CUSTOM to provide startDate and endDate.',
  })
  @IsOptional()
  @IsNumber()
  filter?: number;

  @ApiPropertyOptional({
    example: '2026-01-01',
    description: 'Required when filter=CUSTOM (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-01-15',
    description: 'Required when filter=CUSTOM (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  endDate?: string;
}

export class ReportsStaffQueryDto {
  @ApiProperty({
    description: 'User id',
  })
  @IsString()
  userId: string;

  @ApiPropertyOptional({
    description:
      'Date filter type, use CUSTOM to provide startDate and endDate.',
  })
  @IsOptional()
  @IsNumber()
  filter?: number;

  @ApiPropertyOptional({
    example: '2026-01-01',
    description: 'Required when filter=CUSTOM (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-01-15',
    description: 'Required when filter=CUSTOM (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  endDate?: string;
}

export class PerformanceQueryDto extends ReportsQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 'smith',
    description: 'Search by user name or role',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
