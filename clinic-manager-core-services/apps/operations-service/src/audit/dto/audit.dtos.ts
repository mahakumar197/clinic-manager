import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AuditAction, AuditEntity } from '../entities/audit-log.entity';

/* ========================================================================== */
/* REQUEST DTOs (INPUT)                                                       */
/* ========================================================================== */

export class SearchAuditLogsDto {
  @ApiPropertyOptional({
    example: 'user-uuid-123',
    description: 'Filter by User ID',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    enum: AuditAction,
    example: AuditAction.LOGIN,
    description: 'Filter by Action type',
  })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @ApiPropertyOptional({
    enum: AuditEntity,
    example: AuditEntity.USER,
    description: 'Filter by Entity type',
  })
  @IsOptional()
  @IsEnum(AuditEntity)
  entityType?: AuditEntity;

  @ApiPropertyOptional({
    example: 'entity-uuid-456',
    description: 'Filter by specific Entity ID',
  })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({
    example: '2024-01-01',
    description: 'Start date for filtering',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2024-01-31',
    description: 'End date for filtering',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    example: 50,
    description: 'Limit number of results',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Page number',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;
}

export class GetAuditStatsDto {
  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-01-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

/* ========================================================================== */
/* RESPONSE OBJECTS (OUTPUT)                                                  */
/* ========================================================================== */

export class AuditMetadataDto {
  @ApiProperty({ example: 'session-123' })
  sessionId?: string;

  @ApiProperty({ example: 'Chrome on Windows' })
  deviceInfo?: string;

  @ApiProperty({ example: '192.168.1.1' })
  ip?: string;

  @ApiProperty({ example: 'reason for action' })
  reason?: string;
}

export class AuditLogResponseObject {
  @ApiProperty({ example: 'uuid-log-123' })
  id: string;

  @ApiProperty({ example: 'user-uuid-555' })
  userId: string;

  @ApiProperty({ example: 'Dr. John Doe' })
  userName: string;

  @ApiProperty({ enum: AuditAction, example: AuditAction.UPDATE })
  action: AuditAction;

  @ApiProperty({ enum: AuditEntity, example: AuditEntity.PATIENT })
  entityType: AuditEntity;

  @ApiProperty({ example: 'patient-uuid-999' })
  entityId: string;

  @ApiProperty({ example: { status: 'inactive' }, nullable: true })
  oldValue: Record<string, any>;

  @ApiProperty({ example: { status: 'active' }, nullable: true })
  newValue: Record<string, any>;

  @ApiProperty({ type: () => AuditMetadataDto, nullable: true })
  metadata: AuditMetadataDto;

  @ApiProperty({ example: '127.0.0.1' })
  ipAddress: string;

  @ApiProperty({ example: 'Mozilla/5.0...' })
  userAgent: string;

  @ApiProperty({ example: 'Updated patient status to active' })
  description: string;

  @ApiProperty()
  createdAt: Date;
}

export class AuditStatsResponseObject {
  @ApiProperty({ example: 150 })
  totalActions: number;

  @ApiProperty({
    example: { [AuditAction.LOGIN]: 50, [AuditAction.UPDATE]: 100 },
  })
  byAction: Record<string, number>;

  @ApiProperty({
    example: { [AuditEntity.USER]: 20, [AuditEntity.PATIENT]: 80 },
  })
  byEntity: Record<string, number>;
}

/* ========================================================================== */
/* API RESPONSE WRAPPERS (SWAGGER)                                            */
/* ========================================================================== */

export class GetAuditLogsResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: () => [AuditLogResponseObject] })
  data: AuditLogResponseObject[];

  @ApiProperty({ example: 'Audit logs retrieved successfully' })
  message: string;
}

export class GetAuditStatsResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: () => AuditStatsResponseObject })
  data: AuditStatsResponseObject;

  @ApiProperty({ example: 'Statistics retrieved successfully' })
  message: string;
}
