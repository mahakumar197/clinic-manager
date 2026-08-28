import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  UseGuards,
  Req,
  UnauthorizedException,
  Query,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UploadFileDto } from './dto/upload-file.dto';
import { DeleteFileDto } from './dto/delete-file.dto';
import { AuthGuard } from '@nestjs/passport';
import { logger } from '@pallmall/logger';

@ApiTags('media')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @ApiOperation({
    summary:
      'Upload a file to Azure Blob Storage or pass an external URL (e.g., YouTube)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 20 * 1024 * 1024,
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
    @Req() req: any,
  ) {
    logger.info(`Upload Request - Body: ${JSON.stringify(dto)}`);

    if (!req.user?.userId) {
      throw new UnauthorizedException('User information not found in request');
    }

    // If URL is provided, return it directly without uploading
    if (dto.url) {
      logger.info(`External URL provided: ${dto.url}`);
      return await this.mediaService.handleExternalUrl(dto.url, dto.category);
    }

    // If file is provided, upload to Azure
    if (!file) {
      throw new BadRequestException('Either file or url must be provided');
    }

    return await this.mediaService.uploadFile(
      file,
      req.user.userId,
      dto.category,
      dto.folderPath,
    );
  }

  @Get('file-url')
  @ApiOperation({
    summary: 'Get file URL with SAS token from Azure Blob Storage',
  })
  async getFileUrl(@Query('key') key: string) {
    if (!key) {
      throw new BadRequestException('File key is required');
    }
    return await this.mediaService.getFileUrl(key);
  }

  @Delete('delete')
  @ApiOperation({ summary: 'Delete a file from S3' })
  @ApiBody({ type: DeleteFileDto })
  async deleteFile(@Body() deleteFileDto: DeleteFileDto) {
    if (!deleteFileDto.fileKey) {
      throw new BadRequestException('File key is required');
    }

    return await this.mediaService.deleteFile(deleteFileDto.fileKey);
  }
}
