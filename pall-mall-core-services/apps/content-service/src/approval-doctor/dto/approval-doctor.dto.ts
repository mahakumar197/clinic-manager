import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FormApprovalStatus } from '@pallmall/common-utils';

export class FetchQueueDto {
  @ApiPropertyOptional({
    example: 130,
    description: 'completed, urgent, pending',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  status?: number;

  @ApiPropertyOptional({
    description: 'Search by Patient Name or Form Name',
    example: 'Sarah',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Specific date (YYYY-MM-DD)',
    example: '2025-01-22',
  })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({
    example: '114',
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

  @ApiPropertyOptional({
    example: '149',
  })
  @IsOptional()
  @IsNumber()
  statusFilter?: number;
}

export class ReviewSubmissionDto {
  @ApiProperty({
    description: 'The ID of the form submission being reviewed',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  submissionId: string;

  @ApiProperty({
    description: 'The ID of the form definition',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  formId: string;

  @ApiProperty({
    description:
      'Approval status. Doctor can ONLY select Approved or Rejected.',
    enum: FormApprovalStatus,
    example: FormApprovalStatus.APPROVED,
  })
  @IsNotEmpty()
  @IsEnum(FormApprovalStatus)
  status: FormApprovalStatus;
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

export class AddQuickResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  submissionId: string;

  @ApiPropertyOptional({
    example: 'Needs immediate follow-up',
  })
  @IsOptional()
  @IsString()
  quickResponse: string;
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
    example: '2025-01-22',
  })
  @IsString()
  @IsOptional()
  date?: string;

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
}
