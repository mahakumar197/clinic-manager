import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MimeType } from '@pallmall/common-utils';
import { IsUUID, IsString, IsOptional, IsBoolean } from 'class-validator';

export class AddTaskAttachmentDto {
  @ApiProperty({
    example: 'b920fa4f-0908-46a3-b9a8-3ac2b9d4b249',
    description: 'Task UUID',
  })
  @IsUUID()
  taskId: string;

  @ApiProperty({
    example: 'report.pdf',
    description: 'Attachment file name',
  })
  @IsString()
  filename: string;

  @ApiProperty({
    example: 'tasks/attachments/12345-report.pdf',
    description: 'Encrypted AWS S3 storage key for the file',
  })
  @IsString()
  s3Key: string;

  @ApiPropertyOptional({
    example: 'true',
    description: 'True if attachment is in comment else False',
  })
  @IsOptional()
  @IsBoolean()
  inComment?: boolean;

  @ApiProperty({
    example: 'application/pdf',
    description: 'File MIME type',
  })
  @IsString()
  mimeType: MimeType;
}
