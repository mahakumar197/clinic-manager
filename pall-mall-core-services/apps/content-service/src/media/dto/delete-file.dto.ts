import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteFileDto {
  @ApiProperty({
    type: 'string',
    description: 'The S3 key of the file to delete',
    example: 'folder/filename.jpg',
  })
  @IsNotEmpty()
  @IsString()
  fileKey: string;
}
