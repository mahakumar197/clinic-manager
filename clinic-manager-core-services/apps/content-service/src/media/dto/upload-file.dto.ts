import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UploadFileDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'File to upload (either file or url must be provided)',
  })
  file?: Express.Multer.File;

  @ApiPropertyOptional({
    type: 'string',
    description:
      'External URL (e.g., YouTube video link). Either file or url must be provided.',
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional({
    type: 'string',
    description: 'Category/Flag for folder structure (e.g., Elearning)',
    example: 'Elearning',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    type: 'string',
    description: 'Optional folder path (legacy)',
    example: 'uploads',
  })
  @IsOptional()
  @IsString()
  folderPath?: string;
}
