import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class FormListFiltersDto {

  @ApiPropertyOptional({
    example: 136,
  })
  @IsOptional()
  @IsNumber()
  formPriority?: number;

  @ApiPropertyOptional({
    example: 'john / health questionnaire',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 149,
  })
  @IsOptional()
  @IsNumber()
  statusFilter?: number;

  @ApiPropertyOptional({
    example: 114,
  })
  @IsOptional()
  @IsNumber()
  dateFilter?: number;

  @ApiPropertyOptional({
    example: '2026-01-22',
  })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-01-22',
  })
  @IsString()
  @IsOptional()
  endDate?: string;
}
export class AddCommentsDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  submissionId: string;

  @ApiPropertyOptional({
    example: 'This is a comment',
  })
  @IsOptional()
  comment: string;
}

export class ApproveOrRejectSubmissionDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  formId: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  submissionId: string;

  @ApiPropertyOptional({
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isApproved: boolean;

  @ApiPropertyOptional({
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isRejected: boolean;

  @ApiPropertyOptional({
    example: {
      comment: 'This is a comment',
    },
  })
  @IsOptional()
  comment: Record<string, string>;
}
export class ApproveOrRejectTaskSubmissionDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  taskId: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  submissionId: string;

  @ApiPropertyOptional({
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isApproved: boolean;

  @ApiPropertyOptional({
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isRejected: boolean;

  @ApiPropertyOptional({
    example: {
      comment: 'This is a comment',
    },
  })
  @IsOptional()
  comment: Record<string, string>;
}

export class TaskListFiltersDto {

  @ApiPropertyOptional({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  taskTypeFilter?: number;

  @ApiPropertyOptional({
    example: 'john / health questionnaire',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 149,
  })
  @IsOptional()
  @IsNumber()
  statusFilter?: number;

  @ApiPropertyOptional({
    example: 114,
  })
  @IsOptional()
  @IsNumber()
  dateFilter?: number;

  @ApiPropertyOptional({
    example: '2026-01-22',
  })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-01-22',
  })
  @IsString()
  @IsOptional()
  endDate?: string;  
}
