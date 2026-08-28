import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';

import {
  TriggerEventId,
  NotificationChannel,
  EscalationConditionId,
  EscalationActionId,
} from '@pallmall/common-utils';

export class NotificationRecipientsDto {
  /**
   * Notify by roles
   * Example: ['MANAGER', 'ADMIN']
   */
  @ApiProperty({
    type: 'array',
    items: { type: 'string' },
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  /**
   * Explicit user IDs
   */
  @ApiProperty({
    type: 'array',
    items: { type: 'string' },
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  users?: string[];

  /**
   * Assigned entity owner (task owner, message owner, etc.)
   */
  @ApiProperty({
    type: 'boolean',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  assignedTo?: boolean;
}

export class CreateNotificationRuleDto {
  @ApiProperty({
    type: 'string',
    example: 'name of the notification rule',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: 'string',
    required: true,
    enum: TriggerEventId,
    example: TriggerEventId.TASK_CREATED,
  })
  @IsEnum(TriggerEventId)
  triggerEvent: TriggerEventId;

  @ApiProperty({
    type: 'array',
    example: [NotificationChannel.EMAIL, NotificationChannel.DIGEST],
    items: { type: 'string' },
    required: true,
  })
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  channels: NotificationChannel[];

  @ApiProperty({
    type: 'object',
    example: {
      roles: ['MANAGER', 'ADMIN'],
      users: ['user1', 'user2'],
      assignedTo: true,
    },
    required: true,
  })
  @ValidateNested()
  @Type(() => NotificationRecipientsDto)
  recipients: NotificationRecipientsDto;
}

export class UpdateNotificationRuleDto extends PartialType(
  CreateNotificationRuleDto,
) {}

export class UpdateNotificationStatusDto {
  @IsBoolean()
  isActive: boolean;
}

export class CreateEscalationRuleDto {
  @ApiProperty({
    type: 'string',
    example: 'name of the escalation rule',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: 'string',
    required: true,
    enum: TriggerEventId,
    example: TriggerEventId.TASK_CREATED,
  })
  @IsEnum(TriggerEventId)
  baseTriggerEvent: TriggerEventId;

  @ApiProperty({
    type: 'string',
    required: true,
    enum: EscalationConditionId,
    example: EscalationConditionId.TASK_OVERDUE,
  })
  @IsEnum(EscalationConditionId)
  condition: EscalationConditionId;

  @ApiProperty({
    type: 'string',
    example: EscalationActionId.ALERT_MANAGER,
    required: true,
  })
  @IsEnum(EscalationActionId)
  action: EscalationActionId;

  @ApiProperty({
    type: 'array',
    items: { type: 'string' },
    example: [NotificationChannel.EMAIL, NotificationChannel.DIGEST],
    required: true,
  })
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  channels: NotificationChannel[];

  @ApiProperty({
    type: 'object',
    example: {
      roles: ['MANAGER', 'ADMIN'],
      users: ['user1', 'user2'],
      assignedTo: true,
    },
    required: true,
  })
  @ValidateNested()
  @Type(() => NotificationRecipientsDto)
  recipients: NotificationRecipientsDto;
}

export class UpdateEscalationRuleDto extends PartialType(
  CreateEscalationRuleDto,
) {}

/* ================================
   Notification Rule DTO
================================ */
export class NotificationRuleDto {
  @ApiProperty({ example: 'bbbe8130-5c52-4315-b816-e73fb940f8fd' })
  id: string;

  @ApiProperty({ example: 'notification rule' })
  name: string;

  @ApiProperty({ example: 67 })
  trigger_event: number;

  @ApiProperty({ example: 'TASK_OVERDUE' })
  trigger_event_label: string;

  @ApiProperty({
    example: ['EMAIL', 'DIGEST'],
  })
  channels: string[];

  @ApiProperty({
    example: {
      roles: ['MANAGER', 'ADMIN'],
      users: ['user1', 'user2'],
      assignedTo: true,
    },
  })
  recipients: {
    roles: string[];
    users: string[];
    assignedTo: boolean;
  };

  @ApiProperty({ example: true })
  is_active: boolean;

  @ApiProperty({ example: null, nullable: true })
  created_by: string | null;

  @ApiProperty({ example: '2026-01-09T04:29:09.227Z' })
  created_at: string;

  @ApiProperty({ example: '2026-01-09T04:42:43.777Z' })
  updated_at: string;
}

/* ================================
   Get All Notification Rules Response DTO
================================ */
export class NotificationRulesListDto {
  @ApiProperty({
    type: [NotificationRuleDto],
    description: 'List of notification rules',
    example: [
      {
        id: 'bbbe8130-5c52-4315-b816-e73fb940f8fd',
        name: 'notification rule',
        trigger_event: 67,
        trigger_event_label: 'TASK_OVERDUE',
        channels: ['EMAIL', 'DIGEST'],
        recipients: {
          roles: ['MANAGER', 'ADMIN'],
          users: ['user1', 'user2'],
          assignedTo: true,
        },
        is_active: true,
        created_by: null,
        created_at: '2026-01-09T04:29:09.227Z',
        updated_at: '2026-01-09T04:42:43.777Z',
      },
    ],
  })
  data: NotificationRuleDto[];
}
/* ================================
   Get Notification Rule By ID DTO
================================ */
export class NotificationRuleByIdResponseDto {
  @ApiProperty({
    type: NotificationRuleDto,
    description: 'Notification rule details',
  })
  data: NotificationRuleDto;
}

/* =====================================================
   ESCALATION RULE DTOs
===================================================== */

export class EscalationRuleDto {
  @ApiProperty({
    example: 'dde4efda-a4d6-4807-8806-b07d087b4eb7',
  })
  id: string;

  @ApiProperty({
    example: 'name of the escalation rule',
  })
  name: string;

  @ApiProperty({
    example: 66,
    description: 'Base trigger event ID',
  })
  base_trigger_event: number;

  @ApiProperty({
    example: 'TASK_CREATED',
    description: 'Base trigger event label',
  })
  base_trigger_event_label: string;

  @ApiProperty({
    example: 77,
    description: 'Escalation condition ID',
  })
  condition: number;

  @ApiProperty({
    example: 78,
    description: 'Escalation action ID',
  })
  action: number;

  @ApiProperty({
    example: ['EMAIL', 'DIGEST'],
  })
  channels: string[];

  @ApiProperty({
    example: {
      roles: ['MANAGER', 'ADMIN'],
      users: ['user1', 'user2'],
      assignedTo: true,
    },
  })
  recipients: {
    roles: string[];
    users: string[];
    assignedTo: boolean;
  };

  @ApiProperty({
    example: true,
  })
  is_active: boolean;

  @ApiProperty({
    example: '2026-01-17T00:17:07.899Z',
  })
  created_at: string;

  @ApiProperty({
    example: '2026-01-17T00:17:07.899Z',
  })
  updated_at: string;
}

export class EscalationRulesListResponseDto {
  @ApiProperty({
    type: [EscalationRuleDto],
    description: 'List of escalation rules',
  })
  data: EscalationRuleDto[];
}

export class EscalationRuleByIdResponseDto {
  @ApiProperty({
    type: EscalationRuleDto,
    description: 'Escalation rule details',
  })
  data: EscalationRuleDto;
}
