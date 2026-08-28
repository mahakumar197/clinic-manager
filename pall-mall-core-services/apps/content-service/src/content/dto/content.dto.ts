import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
  IsObject,
  IsUUID,
  IsUrl,
  ValidateIf,
  Min,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ContentStatus, ContentType } from '@pallmall/common-utils';
import { Transform, Type } from 'class-transformer';

function sanitizeInput(value: any) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '')
    .replace(/on\w+="[^"]*"/g, '');
}

export class CreateContentDto {
  @ApiProperty({
    description: 'Title of the content',
    example: 'Understanding Facial Anatomy',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => sanitizeInput(value))
  title: string;

  @ApiProperty({
    description: 'Description of the content',
    example: 'An in-depth look at facial anatomy for medical professionals.',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => sanitizeInput(value))
  description: string;

  @ApiProperty({
    description: 'Content Write-up or Body',
    example: '<p>dummy data</p>',
  })
  @ValidateIf((o) => o.type === ContentType.BLOG)
  @IsNotEmpty({ message: 'Content is required for Blog type' })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => sanitizeInput(value))
  content: string;

  @ApiProperty({
    description: 'Type of the content',
    example: ContentType.IMAGE,
  })
  @IsEnum(ContentType)
  type: ContentType;

  @ApiPropertyOptional({
    description: 'Thumbnail URL of the content',
    example: 'https://example.com/thumbnail.jpg',
  })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    description: 'Image count either single or multiple',
    example: 87,
  })
  @IsNumber()
  @IsOptional()
  imgCount?: number;

  @ApiProperty({
    description: 'Content URL of the content',
    example:
      '["https://example.com/content.jpg","https://example.com/content.jpg"]',
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  contentUrl: string[];

  @ApiProperty({
    description: 'Associated Procedure ID',
    example: 'e099e02c-156b-420e-b056-dbdaf1bb221d',
    required: false,
  })
  @IsNotEmpty({ message: 'Procedure ID is required to create a content' })
  @IsUUID('4', { message: 'procedureId must be a valid UUID' })
  procedureId?: string;

  @ApiProperty({
    description: 'Status of the content',
    example: ContentStatus.DRAFT,
  })
  @IsEnum(ContentStatus)
  status: ContentStatus;

  @ApiPropertyOptional({
    description: 'Author ID of the content',
    example: '02e4ab35-bedb-4261-a2ad-35d39333fe5a',
  })
  @IsString()
  @IsOptional()
  authorId?: string;

  @ApiPropertyOptional({
    description: 'Author Name',
    example: 'Johnson Doe',
  })
  @IsString()
  @IsOptional()
  authorName?: string;

  @ApiPropertyOptional({
    description: 'Blog header of the content',
    example: 'Understanding Facial Anatomy',
  })
  @ValidateIf((o) => o.type === ContentType.BLOG)
  @IsNotEmpty({ message: 'Blog Header is required for Blog type' })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => sanitizeInput(value))
  blogHeader?: string;

  @ApiPropertyOptional({
    description: 'eLearnings content',
    type: 'object',
    example: {
      lesson1: {
        title: 'Understanding Facial Anatomy',
        description: 'An in-depth look at facial anatomy',
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
        content_Url: 'https://example.com/content.jpg',
      },
    },
  })
  @IsObject()
  @IsOptional()
  eLearnings?: JSON;
}

export class listContentDto {
  @ApiProperty({
    required: false,
    description: 'Page number for pagination',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page must be an integer' })
  @Min(1, { message: 'page must be greater than or equal to 1' })
  page?: number;

  @ApiProperty({
    required: false,
    description: 'Number of items per page',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit must be an integer' })
  @Min(1, { message: 'limit must be greater than 0' })
  limit?: number;

  @ApiProperty({
    required: false,
    description: 'Search term for filtering procedures',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => sanitizeInput(value))
  search?: string;

  @ApiProperty({
    required: false,
    enum: ContentType,
    description: 'Type of the content for filtering',
  })
  @IsEnum(ContentType)
  @IsOptional()
  type?: ContentType;

  @ApiProperty({
    required: false,
    description: 'Procedure ID of the content for filtering',
  })
  @IsUUID('4', { message: 'procedureId must be a valid UUID' })
  @IsOptional()
  procedureId?: string;

  @ApiProperty({
    required: false,
    enum: ContentStatus,
    description: 'Status of the content for filtering',
  })
  @IsEnum(ContentStatus)
  @IsOptional()
  status?: ContentStatus;
}

export class UpdateContentDto extends PartialType(CreateContentDto) {}
export class ContentIdParamDto {
  @IsUUID('4', { message: 'id must be a valid UUID' })
  id: string;
}
