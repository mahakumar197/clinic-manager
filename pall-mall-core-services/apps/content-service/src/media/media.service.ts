import { Injectable } from '@nestjs/common';
import {
  ApiResponseBuilder,
  ApiResponse,
  HttpStatus,
  ErrorCode,
} from '@pallmall/shared-types';
import { logger } from '@pallmall/logger';
import {
  uploadBlobFile,
  deleteBlobFile,
  getBlobFileUrl,
} from '@pallmall/common-utils';

@Injectable()
export class MediaService {
  private containerName: string;

  constructor() {
    this.containerName =
      process.env.AZURE_STORAGE_CONTAINER_NAME || 'mobile-app';
  }

  /**
   * Uploads a file to Azure Blob Storage.
   * @param file - The file to upload
   * @param userId - ID of the user uploading the file
   * @param category - Optional file category
   * @param folderPath - Optional folder path
   * @returns ApiResponse with the uploaded file's URL and key
   */
  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    category?: string,
    folderPath?: string,
  ): Promise<ApiResponse<{ url: string; key: string }>> {
    try {
      const finalCategory = category || folderPath || 'uploads';
      logger.info(
        `Uploading file: ${file.originalname} for user: ${userId}, category: ${finalCategory}`,
      );

      const result = await uploadBlobFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        userId,
        finalCategory,
        this.containerName,
      );

      return this.handleUploadSuccess(result);
    } catch (error) {
      return this.handleError(error, 'Failed to upload file');
    }
  }

  /**
   * Processes an external URL (e.g., YouTube, Vimeo).
   * @param url - The external URL
   * @param category - Optional category
   * @returns ApiResponse with the processed URL information
   */
  async handleExternalUrl(
    url: string,
    category?: string,
  ): Promise<ApiResponse<{ url: string; key: string; type: string }>> {
    try {
      logger.info(
        `Handling external URL: ${url}, category: ${category || 'external'}`,
      );
      const type = this.detectUrlType(url);

      return new ApiResponseBuilder().success(
        { url, key: url, type },
        'External URL processed successfully',
        HttpStatus.CREATED,
      );
    } catch (error) {
      return this.handleError(error, 'Failed to process external URL');
    }
  }

  /**
   * Deletes a file from Azure Blob Storage.
   * @param fileKey - The key/path of the file to delete
   * @returns ApiResponse indicating success or failure
   */
  async deleteFile(fileKey: string): Promise<ApiResponse<null>> {
    try {
      logger.info(`Deleting file: ${fileKey} from Azure bucket`);
      await deleteBlobFile(fileKey, this.containerName);
      logger.info(`File deleted successfully: ${fileKey}`);

      return new ApiResponseBuilder().success(
        null,
        'File deleted successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      return this.handleError(error, `Failed to delete file ${fileKey}`);
    }
  }

  /**
   * Retrieves a temporary SAS URL for a file.
   * @param fileKey - The key/path of the file
   * @returns ApiResponse with the SAS URL
   */
  async getFileUrl(fileKey: string): Promise<ApiResponse<{ url: string }>> {
    logger.info('getFileUrl --->');
    try {
      const url = await getBlobFileUrl(fileKey, this.containerName);
      return new ApiResponseBuilder().success(
        { url },
        'File URL retrieved successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      return this.handleError(error, 'Failed to get file URL');
    }
  }

  private handleUploadSuccess(result: {
    url: string;
    key: string;
  }): ApiResponse<any> {
    logger.info(`File uploaded successfully: ${result.key}`);
    return new ApiResponseBuilder().success(
      result,
      'File uploaded successfully',
      HttpStatus.CREATED,
    );
  }

  private detectUrlType(url: string): string {
    logger.debug('detectUrlType --->');
    if (url.includes('youtube.com') || url.includes('youtu.be'))
      return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    return 'external';
  }

  private handleError(error: Error, message: string): ApiResponse<any> {
    logger.error(`${message}: ${error.message}`, error.stack);
    return new ApiResponseBuilder().error(
      {
        code: ErrorCode.EXTERNAL_SERVICE_ERROR,
        message,
        details: [{ message: error.message }],
        timestamp: new Date().toISOString(),
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}