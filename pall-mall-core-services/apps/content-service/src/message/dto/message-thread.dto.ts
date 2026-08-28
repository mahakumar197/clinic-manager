import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsUUID,
  IsEnum,
  IsBoolean,
  ArrayNotEmpty,
  ArrayUnique,
  IsUrl,
  ValidateNested,
  Matches,
  IsDefined,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import {
  FileType,
  MessageVisibility,
  ThreadStatus,
  PaginationQueryDto,
  MessageStatus,
} from '@pallmall/common-utils';
import { UserRole } from '@pallmall/shared-types';

/* -------------------------------------------------------------------------- */
/*                           INTERNAL NOTE DTOs                               */
/* -------------------------------------------------------------------------- */

export class CreateInternalNoteDto {
  @ApiProperty({ example: '@Dr. Smith please reply' })
  @IsString()
  @IsNotEmpty()
  @Matches(/\S+/, { message: 'note_text should not be empty or whitespace' })
  note_text: string;
}

export class CreateInternalNoteResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'uuid' })
  message_id: string;
}

/* -------------------------------------------------------------------------- */
/*                                ARCHIVE THREAD                              */
/* -------------------------------------------------------------------------- */

export class ArchiveThreadDto {
  @ApiProperty({
    example: true,
    description: 'True to archive (close), false to unarchive (open)',
  })
  @IsDefined()
  @IsBoolean()
  status: boolean;
}

export class ArchiveThreadResponseDto {
  @ApiProperty({ example: true })
  success: boolean;
}

export class DeleteThreadResponseDto {
  @ApiProperty({ example: true })
  success: boolean;
}

/* -------------------------------------------------------------------------- */
/*                              MARK READ DTO                                  */
/* -------------------------------------------------------------------------- */

export class MarkReadDto {
  @ApiProperty({ example: '562a5ae1-c117-442f-a07a-62e700261c57' })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  @IsDefined()
  last_seen_message_id: string;
}

export class MarkReadResponseDto {
  @ApiProperty({ example: true })
  success: boolean;
}

export class MarkUnreadResponseDto {
  @ApiProperty({ example: true })
  success: boolean;
}

/* -------------------------------------------------------------------------- */
/*                               ASSIGN THREAD                                  */
/* -------------------------------------------------------------------------- */

export class AssignThreadDto {
  @ApiProperty({
    type: 'array',
    example: [
      '3544cac4-e35f-4239-b604-de2deec74f53',
      '3544cac4-e35f-4239-b604-de2deec74f54',
    ],
  })
  @IsArray()
  @ArrayUnique()
  @IsUUID('all', { each: true })
  assigned_user_ids: string[];
}

export class AssignThreadResponseDto {
  @ApiProperty({ example: true })
  success: boolean;
}

/* -------------------------------------------------------------------------- */
/*                           UPDATE THREAD STATUS                              */
/* -------------------------------------------------------------------------- */

export class UpdateThreadStatusDto {
  @ApiProperty({ enum: ['open', 'closed'] })
  @IsNotEmpty()
  @IsEnum(ThreadStatus)
  status: ThreadStatus;
}

export class UpdateThreadStatusResponseDto {
  @ApiProperty({ example: true })
  success: boolean;
}

/* -------------------------------------------------------------------------- */
/*                               MESSAGE DTO                                   */
/* -------------------------------------------------------------------------- */

export class AttachmentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUrl()
  @IsString()
  file_url: string;

  @ApiProperty({ enum: FileType })
  @IsNotEmpty()
  @IsEnum(FileType)
  @IsString()
  file_type: string;

  @ApiPropertyOptional({ example: '3600' })
  @IsOptional()
  @IsString()
  duration?: string;
}

export class CreatePatientMessageDto {
  @ApiProperty({ example: 'Still swollen today' })
  @IsString()
  @IsNotEmpty()
  @Matches(/\S+/, { message: 'message should not be empty or whitespace' })
  message: string;

  @ApiProperty({
    type: () => [AttachmentDto],
    required: false,
    description: 'Optional attachments',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];
}

export class CreateMessageResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'uuid' })
  message_id: string;
}

export class CreateMessageDto {} // Base DTO for update

export class UpdateMessageDto extends PartialType(CreateMessageDto) {}

/* -------------------------------------------------------------------------- */
/*                              THREAD CREATION                                */
/* -------------------------------------------------------------------------- */

export class CreateThreadDto {
  @ApiProperty({
    example: 'Swelling in left leg',
    description: 'Subject of the conversation thread',
  })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({
    example: "I'm experiencing swelling near my ankle.",
    description: 'Initial message sent by the patient while creating thread',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/\S+/, { message: 'message should not be empty or whitespace' })
  message: string;

  @ApiProperty({
    type: 'array',
    example: ['562a5ae1-c117-442f-a07a-62e700261c57'],
    description: 'List of assigned doctor/nurse user IDs',
  })
  @IsArray()
  @ArrayUnique()
  @IsUUID('all', { each: true })
  @IsNotEmpty()
  @ArrayNotEmpty()
  assigned_user_ids: string[];

  @ApiPropertyOptional({
    type: () => [AttachmentDto],
    description: 'List of attachments for the first message',
    example: [
      {
        file_url: 'https://your-bucket-url/path/to/file.png',
        file_type: FileType.IMAGE,
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];
}

/* -------------------------------------------------------------------------- */
/*                        GET THREAD MESSAGE RESPONSE                          */
/* -------------------------------------------------------------------------- */

export class MessageDto {
  @ApiProperty()
  message_id: string;

  @ApiProperty()
  thread_id: string;

  @ApiProperty()
  sender_id: string;

  @ApiProperty()
  message_text: string;

  @ApiProperty({ enum: ['text', 'image', 'file', 'voice_note'] })
  message_type: string;

  @ApiProperty({ enum: ['patient', 'internal'] })
  visibility: MessageVisibility;

  @ApiProperty()
  created_at: Date;
}

export class GetThreadMessagesResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: () => [MessageDto] })
  data: {
    messages: MessageDto[];
  };
}

/* -------------------------------------------------------------------------- */
/*                        ADMIN THREAD LIST DTO                                */
/* -------------------------------------------------------------------------- */

export class ThreadDto {
  @ApiProperty()
  thread_id: string;

  @ApiProperty()
  patient_user_id: string;

  @ApiProperty({
    type: 'array',
    example: ['user-id-1', 'user-id-2'],
  })
  assigned_user_ids: string[];

  @ApiProperty({ enum: ['open', 'closed'] })
  status: ThreadStatus;

  @ApiProperty()
  created_at: Date;

  @ApiProperty({ required: false })
  archived_at?: Date;

  @ApiProperty({ required: false })
  subject?: string;

  @ApiProperty()
  isRead: boolean;

  @ApiProperty()
  flagged: boolean;

  @ApiProperty({ required: false })
  last_message?: any;
}

export class GetAdminThreadsResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: () => [ThreadDto] })
  data: ThreadDto[];
}

export class ToggleActionResponseDto {
  success: boolean;
  action: string;
}

export class GetThreadsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search term for thread subject, patient name, or doctor name',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter threads',
    enum: MessageStatus,
    default: MessageStatus.ALL,
  })
  @IsOptional()
  @IsEnum(MessageStatus)
  filter?: MessageStatus;

  @ApiPropertyOptional({
    description: 'Filter by role group',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  roleGroup?: number;
}

/* -------------------------------------------------------------------------- */
/*                        GET ASSIGNED USERS DTO                               */
/* -------------------------------------------------------------------------- */

export class AssignedUserDto {
  @ApiProperty()
  user_id: string;

  @ApiProperty({ nullable: true })
  name: string | null;

  @ApiProperty({ nullable: true })
  role: string | null;
}

export class GetAssignedUsersResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: () => [AssignedUserDto] })
  data: AssignedUserDto[];
}

/* -------------------------------------------------------------------------- */
/*                        BULK THREAD SEARCH DTO                               */
/* -------------------------------------------------------------------------- */

export class SearchThreadsBulkDto {
  @ApiProperty({
    type: 'array',
    example: ['user-id-1', 'user-id-2'],
  })
  @IsArray()
  @ArrayUnique()
  @IsUUID('all', { each: true })
  @IsNotEmpty()
  @ArrayNotEmpty()
  provider_ids: string[];
}
