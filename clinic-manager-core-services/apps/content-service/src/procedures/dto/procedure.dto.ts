import { IsString, IsNotEmpty, IsEnum, IsOptional, MaxLength, IsUrl, Matches, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProcedureStatus, ProcedureModel } from '@pallmall/common-utils';
import { Type } from 'class-transformer';

export class CreateProcedureDto {
  @ApiProperty({
    description: 'Title of the procedure',
    example: 'Face Lift'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30, { message: 'Title must not exceed 30 characters' })
  @Matches(/^[^<>]*$/, {
    message: 'Title contains invalid characters',
  })
  title: string;

  @ApiProperty({
    description: 'Description of the procedure',
    example: 'A surgical procedure to lift and tighten the face',
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ enum: ProcedureModel, description: 'Type of the procedure' })
  @IsEnum(ProcedureModel)
  type: ProcedureModel;

  @ApiProperty({
    description: 'Thumbnail URL of the procedure',
    example: 'https://example.com/thumbnail.jpg'
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl({}, { message: 'Thumbnail must be a valid URL' })
  thumbnailUrl: string;

  // @ApiProperty({
  //     description: 'Video URL of the procedure',
  //     example: 'https://example.com/video.mp4'
  // })
  // @IsString()
  // @IsOptional()
  // videoUrl: string;

  @ApiProperty({
    enum: ProcedureStatus,
    description: 'Status of the procedure',
  })
  @IsEnum(ProcedureStatus)
  status: ProcedureStatus;
}

export class listProcedureDto {
  @ApiProperty({ 
    required: false, 
    description: 'Page number for pagination', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number;

  @ApiProperty({ 
    required: false, 
    description: 'Number of items per page', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be greater than 0' })
  limit?: number;

  @ApiProperty({
    required: false,
    description: 'Search term for filtering procedures',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    required: false,
    enum: ProcedureModel,
    description: 'Type of the procedure for filtering',
  })
  @IsEnum(ProcedureModel)
  @IsOptional()
  type?: ProcedureModel;

  @ApiProperty({
    required: false,
    enum: ProcedureStatus,
    description: 'Status of the procedure for filtering',
  })
  @IsEnum(ProcedureStatus)
  @IsOptional()
  status?: ProcedureStatus;
}
