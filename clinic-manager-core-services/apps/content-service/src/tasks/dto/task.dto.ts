import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import {
  TaskPhase,
  TaskCategory,
  TaskStatus,
  ProcedureType,
  TaskPhaseId,
  TaskStatusId,
  ProcedureTypeId,
} from '@pallmall/common-utils';
import { Type } from 'class-transformer';

export class CreateTaskDto {
  @ApiProperty({
    example: 'a3b42e98-f09b-4f2a-bbc8-9c4fa0a8b322',
    description: 'Patient UUID',
  })
  @IsUUID()
  patientId: string;

  @ApiProperty({
    example: 28,
    description: 'Rhinoplasty',
  })
  @IsNumber()
  procedureType: number;

  @ApiPropertyOptional({
    example: 'c48ebf14-49f8-4c16-a022-cad18203af3d',
    description: 'Task template UUID (optional)',
  })
  @IsOptional()
  @IsUUID()
  taskTemplate?: string;

  @ApiProperty({
    example: 'Upload ID Proof',
    description: 'Task name',
  })
  @IsString()
  taskName: string;

  @ApiPropertyOptional({
    example: 'Please upload your government ID proof.',
    description: 'Detailed task description',
  })
  @IsOptional()
  @IsString()
  taskDescription?: string;

  @ApiProperty({
    example: 13,
    description: 'Task phase',
  })
  @IsNumber()
  phase: number;

  @ApiProperty({
    example: 16,
    description: 'Form Response',
  })
  @IsNumber()
  category: number;

  @ApiPropertyOptional({
    example: 60,
    description: 'Zoho form',
  })
  @IsOptional()
  @IsString()
  zohoform?: string;

  @ApiPropertyOptional({
    example: 63,
    description: 'Content ID',
  })
  @IsOptional()
  @IsString()
  contentId?: string;

  @ApiPropertyOptional({
    example: 'b920fa4f-0908-46a3-b9a8-3ac2b9d4b249',
    description: 'Assignee UUID',
  })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @ApiPropertyOptional({
    example: '2025-12-12',
    description: 'Due date for the task',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({
    example: 'MANAGER',
    description: 'User role of the creator',
  })
  @IsOptional()
  @IsString()
  userRole?: string;
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}

export class ReAssignTaskDto {
  @ApiProperty({
    example: 'b920fa4f-0908-46a3-b9a8-3ac2b9d4b249',
    description: 'Assignee UUID',
  })
  @IsUUID()
  assigneeId: string;
}
export class TaskFilterQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ example: 10, description: 'Limit per page' })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether to export the filtered tasks',
  })
  @IsOptional()
  @IsBoolean()
  export?: boolean;

  @ApiPropertyOptional({
    example: 'Samuel or Taskname',
    description: 'Search by patient name or task name',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ProcedureTypeId,
    example: ProcedureTypeId.Rhinoplasty,
    description: 'Procedure type',
  })
  @Type(() => Number)
  @IsOptional()
  @IsEnum(ProcedureTypeId)
  procedureType?: ProcedureType;

  @ApiPropertyOptional({
    enum: TaskStatusId,
    example: TaskStatusId.PENDING,
    description: 'Task status',
  })
  @Type(() => Number)
  @IsOptional()
  @IsEnum(TaskStatusId)
  status?: TaskStatusId;

  @ApiPropertyOptional({
    enum: TaskPhaseId,
    example: TaskPhaseId.PRE_OP,
    description: 'Task phase',
  })
  @Type(() => Number)
  @IsOptional()
  @IsEnum(TaskPhaseId)
  phases?: TaskPhaseId;

  @ApiPropertyOptional({
    example: '2025-12-12',
    description: 'Due date',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({
    example: '1 for ascending and -1 for descending',
    description: 'Due date order',
  })
  @IsOptional()
  @IsNumber()
  dueDateOrder?: number;

  @ApiPropertyOptional({
    example: '155',
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

export class CreateTaskFilterDto {
  @ApiProperty({
    description: 'Name of the saved filter',
    example: 'My Pending Tasks Filter',
  })
  @IsString()
  @IsNotEmpty()
  filterName: string;

  @ApiProperty({
    description: 'JSON payload defining the filter rules',
    example: {
      patient: {
        id: '295190cb-20ed-41fc-a66f-dbe182e56532',
        userName: 'John Doe',
      },
      status: {
        id: '295190cb-20ed-41fc-a66f-dbe182e56532',
        beValue: 'Pending',
      },
      procedureType: {
        id: '295190cb-20ed-41fc-a66f-dbe182e56532',
        beValue: 'Rhinoplasty',
      },
      phase: { id: '295190cb-20ed-41fc-a66f-dbe182e56532', beValue: 'Pre-op' },
    },
  })
  @IsNotEmpty()
  filterData: JSON;
}

export class CreateTaskCommentDto {
  @ApiProperty({
    example: '295190cb-20ed-41fc-a66f-dbe182e56532',
    description: 'Task UUID this comment belongs to',
  })
  @IsUUID()
  taskId: string;

  @ApiProperty({
    example: 'This is a comment for the task.',
    description: 'Actual comment text',
  })
  @IsString()
  comment: string;

  @ApiPropertyOptional({
    example: '295190cb-20ed-41fc-a66f-dbe182e56532',
    description: 'Attachment UUID this comment belongs to',
  })
  @IsUUID()
  @IsOptional()
  attachmentId?: string;
}

export class UpdateTaskCommentDto extends PartialType(CreateTaskCommentDto) {}

export class CreateTaskTemplateDto {
  @ApiProperty({
    description: 'JSON payload defining the template rules',
    example: {
      taskName: {
        name: 'Task Name',
      },
      status: {
        id: 24,
        beValue: 'Pending',
      },
      procedureType: {
        id: 28,
        beValue: 'Rhinoplasty',
      },
      phase: { id: 13, beValue: 'Pre-op' },
    },
  })
  @IsNotEmpty()
  templateData: JSON;
}

export class UpdateTaskTemplateDto extends PartialType(CreateTaskTemplateDto) {}

export class FormAnswerInputDto {
  @ApiProperty({
    example: '295190cb-20ed-41fc-a66f-dbe182e56532',
    description: 'Form ID',
  })
  @IsUUID()
  formId: string;

  @ApiProperty({
    example: '36cb90f3-6543-418a-bb4f-975e09a96d9e',
    description: 'Question ID',
  })
  @IsUUID()
  submissionId: string;
}

export class TaskTrackDto {
  @ApiProperty({
    example: '295190cb-20ed-41fc-a66f-dbe182e56532',
  })
  @IsUUID()
  taskId: string;

  @ApiPropertyOptional({
    example: 'lesson1',
  })
  @IsString()
  @IsOptional()
  enValue?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/blog-thumbnail.jpg',
  })
  @IsString()
  @IsOptional()
  signature?: string;

  @ApiPropertyOptional({
    example: ['1', '2', '3'],
  })
  @IsArray()
  @IsOptional()
  steps?: string[];
}

export class TaskFileUploadDto {
  @ApiProperty({
    example: '295190cb-20ed-41fc-a66f-dbe182e56532',
  })
  @IsUUID()
  taskId: string;

  @ApiProperty({
    example: 'www/bloodReport.pdf',
  })
  @IsString()
  fileContent: string;
}

export class AutoCreateTasksDto {
  @ApiProperty({
    example: 'a3b42e98-f09b-4f2a-bbc8-9c4fa0a8b322',
    description: 'Patient UUID',
  })
  @IsUUID()
  patientId: string;

  @ApiProperty({
    example: 142,
    description:
      'Patient phase ID (140=Guest, 141=Consultation, 142=Pre-Op, 143=Post-Op)',
  })
  @IsNumber()
  patientPhaseId: number;

  @ApiProperty({
    example: 28,
    description: 'Procedure type ID (28=Rhinoplasty, etc.)',
  })
  @IsNumber()
  procedureType: number;

  @ApiPropertyOptional({
    example: 'b920fa4f-0908-46a3-b9a8-3ac2b9d4b249',
    description:
      'Optional assignee UUID (doctor or coordinator). If not provided, tasks are assigned to the patient.',
  })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;
}
