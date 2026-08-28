import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  FormStatus,
  FormType,
  NodeType,
  QuestionType,
} from '@pallmall/common-utils';
import { PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MaxLength,
  IsEnum,
  IsNumber,
  IsUUID,
  IsObject,
  ValidateNested,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FormPriority } from '@pallmall/common-utils';

export class CreateFormDto {
  @ApiProperty({
    example: 'Form Name',
    description: 'Name of the form',
  })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: 'Form PhaseId',
    description: 'PhaseId of the form',
  })
  @IsString()
  @MaxLength(100)
  phase: string;

  @ApiPropertyOptional({
    example: 'Form Procedure Type',
    description: 'Procedure Type of the form',
  })
  @IsString()
  @IsOptional()
  procedure_type?: string;

  @ApiProperty({
    example: FormPriority.HIGH,
    description: 'Priority of the form',
    enum: FormPriority,
  })
  @IsEnum(FormPriority)
  priority: FormPriority;

  @ApiPropertyOptional({
    example: FormType.CONCERN,
    description: 'Type of the form',
    enum: FormType,
  })
  @IsOptional()
  @IsEnum(FormType)
  formType?: FormType;

  @ApiProperty({
    example: 'Form Description',
    description: 'Description of the form',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'page exists or not',
  })
  @IsOptional()
  @IsBoolean()
  page_exists?: boolean;
}

export class CreateFormQuestionDto {
  @ApiProperty({
    example: 'c948c311-a711-42ea-8b99-9482a2d373d1',
    description: 'ID of the form',
  })
  @IsUUID()
  formId: string;

  @ApiProperty({
    example: 'What is your primary skill?',
    description: 'Question content (supports localization)',
  })
  @IsString()
  question: string;

  @ApiProperty({
    example: QuestionType.CHECKBOX,
    description: 'Type of the form question',
    enum: QuestionType,
  })
  @IsEnum(QuestionType)
  questionType: QuestionType;

  @ApiProperty({
    example: 1,
    description: 'Display order of the form question',
  })
  @IsNumber()
  displayOrder: number;

  @ApiPropertyOptional({
    example: ['Backend', 'Frontend', 'DevOps'],
    description: 'Options for dropdown / radio / checkbox questions',
  })
  @IsOptional()
  @IsArray()
  options?: string[];

  @ApiPropertyOptional({
    example: {
      required: 'true',
      minLength: '3',
    },
    description: 'Validation rules for the question',
  })
  @IsOptional()
  @IsObject()
  validations?: Record<string, string>;

  @ApiProperty({
    example: NodeType.QUESTION,
    description: 'Type of the form question',
    enum: NodeType,
  })
  @IsEnum(NodeType)
  nodeType: NodeType;

  @ApiPropertyOptional({
    example: 1,
    description: 'Page number for the question',
  })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    example: 'Page Name',
    description: 'Page name for the question',
  })
  @IsOptional()
  @IsString()
  pageName?: string;
}

export class UpdateFormQuestionDto extends PartialType(CreateFormQuestionDto) {}

export class FormAnswerInputDto {
  @ApiProperty({
    example: '36cb90f3-6543-418a-bb4f-975e09a96d9e',
    description: 'Form Question ID',
  })
  @IsUUID()
  questionId: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['John'],
    description:
      'Answer -> plain text {value:"John"} mcq -> use the same key value pair from question\'s options',
  })
  @IsOptional()
  answer?: any;
}

export class FormSubmissionDto {
  @ApiProperty({
    example: 'c6dfd02a-19a8-4a9b-8efe-b1a96194bf86',
    description: 'Form ID',
  })
  @IsUUID()
  formId: string;

  @ApiPropertyOptional({
    example: 'c6dfd02a-19a8-4a9b-8efe-b1a96194bf86',
    description: 'Task ID',
  })
  @IsOptional()
  @IsUUID()
  taskId?: string;

  @ApiProperty({
    type: [FormAnswerInputDto],
    description: 'Answers keyed by question ID',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormAnswerInputDto)
  answers: FormAnswerInputDto[];

  @ApiPropertyOptional({
    example: 'https://example.com/signature.jpg',
    description: 'Signature image URL',
  })
  @IsOptional()
  @IsString()
  signature_image?: string;
  @IsOptional()
  @IsBoolean()
  is_guest?: boolean;

  @ApiPropertyOptional({
    example: ['1', '2', '3'],
    description: 'Steps',
  })
  @IsOptional()
  @IsArray()
  steps?: string[];
}

export class FormSubmissionFilterQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ example: 10, description: 'Limit per page' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({
    example: 'Common',
    description: 'Search by form name',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: FormType,
    example: FormType.CONCERN,
    description: 'Filter by form type',
  })
  @IsOptional()
  @IsEnum(FormType)
  formType?: FormType;
}

export class NewFormAnswerInputDto {
  @ApiProperty({
    example: 'first_name',
    description: 'Zoho field link name — passed as questionId by the frontend',
  })
  @IsString()
  questionId: string;

  @ApiProperty({
    example: QuestionType.TEXT,
    description: 'Zoho field question type',
  })
  @IsEnum(QuestionType)
  questionType: QuestionType;

  @ApiProperty({
    example: NodeType.QUESTION,
    description: 'Zoho field node type',
  })
  @IsEnum(NodeType)
  nodeType: NodeType;

  @ApiProperty({
    example: 'First Name',
    description: 'Zoho field display name',
  })
  @IsString()
  displayName: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['John'],
    description:
      'Answer values. Plain text → single-element array; multi-select → multiple elements.',
  })
  @IsOptional()
  answer?: any;

  @ApiPropertyOptional({
    type: [String],
    example: ['Option 1', 'Option 2'],
    description: 'Question choices/options from mock responses',
  })
  @IsOptional()
  @IsArray()
  options?: string[];
}

export class NewFormSubmissionDto {
  @ApiProperty({
    example: 'c6dfd02a-19a8-4a9b-8efe-b1a96194bf86',
    description: 'Form ID',
  })
  @IsUUID()
  formId: string;

  @ApiPropertyOptional({
    example: 'c6dfd02a-19a8-4a9b-8efe-b1a96194bf86',
    description: 'Task ID',
  })
  @IsOptional()
  @IsUUID()
  taskId?: string;

  @ApiProperty({
    type: [NewFormAnswerInputDto],
    description: 'Answers keyed by Zoho field link name (as questionId)',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NewFormAnswerInputDto)
  answers: NewFormAnswerInputDto[];

  @ApiPropertyOptional({
    example: 'https://example.com/signature.jpg',
    description: 'Signature image URL',
  })
  @IsOptional()
  @IsString()
  signature_image?: string;

  @ApiPropertyOptional({
    example: ['1', '2', '3'],
    description: 'Steps',
  })
  @IsOptional()
  @IsArray()
  steps?: string[];
}
