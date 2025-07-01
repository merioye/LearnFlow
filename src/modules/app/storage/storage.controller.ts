import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ApiResponse } from '@/common/utils';
import { ILogger, InjectLogger } from '@/modules/common/logger';

import { Config } from '@/enums';
import { ENDPOINTS } from '@/constants';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { InjectStorageProvider } from './decorators';
import { GenerateUploadUrlDto } from './dtos';
import { IStorageProvider } from './interfaces';
import { FileTrackingService } from './services';
import { TGeneratedFileUploadUrl } from './types';

/**
 * Controller handling file storage operations.
 * Provides endpoints for generating upload URLs and managing stored files.
 *
 * @class StorageController
 */
@Controller(ENDPOINTS.Storage.Base)
export class StorageController {
  public constructor(
    @InjectStorageProvider()
    private readonly _storageProvider: IStorageProvider,
    @InjectLogger() private readonly _logger: ILogger,
    private readonly _configService: ConfigService,
    private readonly _fileTrackingService: FileTrackingService
  ) {}

  /**
   * Generates a pre-signed URL for file upload.
   * The URL will expire after a configured duration.
   *
   * @param {GenerateUploadUrlDto} input - Configuration for URL generation
   * @returns {Promise<ApiResponse<TGeneratedFileUploadUrl>>} Response containing the generated upload URL
   *
   * @example
   * GET /storage/upload-url?fileType=image/jpeg&fileName=example.jpg&entityType=USER_AVATAR
   *
   * @throws {BadRequestError} When an invalid file type is provided
   * @throws {InternalServerError} When URL generation fails
   */
  @Get(ENDPOINTS.Storage.Get.GenerateUploadUrl)
  public async generateUploadUrl(
    @Query() input: GenerateUploadUrlDto,
    @CurrentUser('userId') currentUserId: number
  ): Promise<ApiResponse<TGeneratedFileUploadUrl>> {
    this._logger.debug('Generating upload URL with config', {
      data: {
        ...input,
        by: currentUserId,
      },
    });

    const generatedUrl = await this._storageProvider.generateUploadUrl(
      {
        ...input,
        expiration: this._configService.get<number>(
          Config.UPLOAD_FILE_URL_EXPIRATION
        )!,
      },
      currentUserId
    );

    this._logger.info('Generated upload URL', {
      data: {
        ...generatedUrl,
        by: currentUserId,
      },
    });

    return new ApiResponse({
      message: 'Upload url generated successfully',
      result: generatedUrl,
      statusCode: HttpStatus.OK,
    });
  }

  /**
   * Deletes a file from storage using its unique identifier.
   *
   * @param {string} filePath - The encoded unique path of the file to delete
   * @returns {Promise<ApiResponse<null>>} Response indicating successful deletion
   *
   * @example
   * DELETE /storage/files/encoded-path
   *
   * @throws {InternalServerError} When file deletion fails
   */
  @Delete(ENDPOINTS.Storage.Delete.DeleteFile)
  public async deleteFile(
    @Param('file-path') filePath: string,
    @CurrentUser('userId') currentUserId: number
  ): Promise<ApiResponse<null>> {
    const decodedFilePath = decodeURIComponent(filePath);

    this._logger.debug('Deleting file with path', {
      data: {
        filePath: decodedFilePath,
        by: currentUserId,
      },
    });

    await this._fileTrackingService.updateMany({
      filter: { filePath: decodedFilePath, ownerId: currentUserId },
      data: {
        $inc: {
          referenceCount: -1,
        },
      },
    });

    this._logger.info('Deleted file with path', {
      data: {
        filePath: decodedFilePath,
        by: currentUserId,
      },
    });

    return new ApiResponse({
      message: 'File deleted successfully',
      result: null,
      statusCode: HttpStatus.OK,
    });
  }

  /**
   * Confirms the upload of a file by its unique identifier.
   *
   * @param {string} filePath - The encoded unique path of the file to confirm upload
   * @returns {Promise<ApiResponse<boolean>>} Response indicating successful confirmation
   *
   */
  @Patch(ENDPOINTS.Storage.Update.ConfirmUpload)
  public async confirmUpload(
    @Param('file-path') filePath: string,
    @CurrentUser('userId') currentUserId: number
  ): Promise<ApiResponse<boolean>> {
    const decodedFilePath = decodeURIComponent(filePath);

    this._logger.debug('Confirming file upload with path', {
      data: {
        filePath: decodedFilePath,
        by: currentUserId,
      },
    });

    const isConfirmed = await this._storageProvider.confirmUpload(
      currentUserId,
      decodedFilePath
    );

    this._logger.info('Confirmed file upload with path', {
      data: {
        filePath: decodedFilePath,
        by: currentUserId,
      },
    });

    return new ApiResponse({
      message: 'File upload confirmed successfully',
      result: isConfirmed ? true : false,
      statusCode: HttpStatus.OK,
    });
  }
}
