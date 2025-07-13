import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

import { InternalServerError, NotFoundError } from '@/common/errors';
import { ILogger, InjectLogger } from '@/modules/common/logger';
import { FileTrackingEntity } from '@/database';

import { Config, Environment } from '@/enums';

import { FileStatus, StorageEntity } from '../enums';
import { IStorageProvider } from '../interfaces';
import { FileTrackingService } from '../services';
import { TGeneratedFileUploadUrl, TUploadUrlGenerationConfig } from '../types';
import { BaseStorageProvider } from './base-storage.provider';

/**
 * Provider for handling AWS S3 storage operations.
 * Extends BaseStorageProvider and implements IStorageProvider interface.
 * Provides functionality for generating pre-signed URLs and managing files in S3.
 *
 * @class S3StorageProvider
 * @extends {BaseStorageProvider}
 * @implements {IStorageProvider}
 */
@Injectable()
export class S3StorageProvider
  extends BaseStorageProvider
  implements IStorageProvider
{
  private readonly _client: S3Client;
  private readonly _bucketName: string;

  /**
   * Initializes the S3 storage service with necessary configurations.
   *
   * @param {ConfigService} _configService - NestJS config service for accessing environment variables
   * @param {ILogger} _logger - Logger interface for error tracking
   * @param {FileTrackingService} _fileTrackingService - Service for tracking file references
   */
  public constructor(
    @InjectLogger() private readonly _logger: ILogger,
    private readonly _configService: ConfigService,
    private readonly _fileTrackingService: FileTrackingService
  ) {
    super();
    this._bucketName = this._configService.get(Config.AWS_S3_BUCKET_NAME)!;
    this._client = new S3Client({
      region: this._configService.get(Config.AWS_S3_REGION),
      credentials: {
        accessKeyId: this._configService.get(Config.AWS_ACCESS_KEY_ID)!,
        secretAccessKey: this._configService.get(Config.AWS_SECRET_ACCESS_KEY)!,
      },
      endpoint: this._configService.get(Config.AWS_S3_ENDPOINT),
      forcePathStyle:
        this._configService.get(Config.NODE_ENV) !== Environment.PROD,
    });
  }

  /**
   * @inheritdoc
   */
  public async generateUploadUrl(
    config: TUploadUrlGenerationConfig,
    ownerId: number
  ): Promise<TGeneratedFileUploadUrl> {
    const { fileType, fileName, expiration, entityType, entityId } = config;
    // Validate
    this.validateFileType(fileType, entityType);
    const environment: Environment = this._configService.get<Environment>(
      Config.NODE_ENV
    )!;
    const uniqueId = uuidv4();

    const queryRunner = await this._fileTrackingService.startTransaction();
    try {
      // Generate unique filename and full object key
      const uniqueFileName = this.generateUniqueFileName(fileName, uniqueId);
      const objectKey = this._generateObjectKey(uniqueFileName, {
        entityType,
        entityId,
        environment,
      });

      // Create file record
      await this._fileTrackingService.create({
        data: {
          filePath: objectKey,
          ownerId,
          status: FileStatus.PENDING,
          referenceCount: 0,
          lastReferencedAt: null,
        },
        options: {
          queryRunner,
        },
      });

      // Create command for PUT operation
      const putCommand = new PutObjectCommand({
        Bucket: this._bucketName,
        Key: objectKey,
        ContentType: fileType,
        Metadata: {
          entityType,
          entityId: entityId || '',
          originalName: fileName,
          uniqueId,
          environment,
        },
      });

      // Generate presigned URL
      const presignedUrl = await getSignedUrl(this._client, putCommand, {
        expiresIn: expiration,
      });

      await this._fileTrackingService.commitTransaction(queryRunner);

      return {
        filePath: objectKey,
        presignedUrl,
      };
    } catch (error) {
      await this._fileTrackingService.rollbackTransaction(queryRunner);

      this._logger.error('Error generating upload file URL:', { error });
      throw new InternalServerError('Failed to generate upload URL');
    }
  }

  /**
   * @inheritdoc
   */
  public async confirmUpload(
    userId: number,
    filePath: string
  ): Promise<FileTrackingEntity | null> {
    const queryRunner = await this._fileTrackingService.startTransaction();
    try {
      // Verify file exists in S3
      const headCommand = new HeadObjectCommand({
        Bucket: this._bucketName,
        Key: filePath,
      });
      await this._client.send(headCommand);

      // Check file exists
      const file = await this._fileTrackingService.findOne({
        filter: { filePath, ownerId: userId, status: FileStatus.PENDING },
        queryRunner,
      });
      if (!file) {
        throw new NotFoundError('File not found');
      }

      // Update file status
      const updatedFile = await this._fileTrackingService.updateById({
        id: file.id,
        data: {
          status: FileStatus.ACTIVE,
        },
        options: {
          queryRunner,
        },
      });

      await this._fileTrackingService.commitTransaction(queryRunner);
      return updatedFile;
    } catch (error) {
      // Cleanup if S3 upload failed
      if ((error as { code?: string })?.code === 'NotFound') {
        await this._fileTrackingService.deleteMany({
          filter: { filePath },
          options: { queryRunner },
        });
      }
      await this._fileTrackingService.rollbackTransaction(queryRunner);

      this._logger.error(`Upload confirmation failed for file ${filePath}`, {
        error,
      });
      return null;
    }
  }

  /**
   * @inheritdoc
   */
  public async deleteFile(objectPath: string): Promise<boolean> {
    try {
      const objectKey = this._extractObjectKeyFromPath(objectPath);
      await this._client.send(
        new DeleteObjectCommand({
          Bucket: this._bucketName,
          Key: objectKey,
        })
      );

      return true;
    } catch (error) {
      this._logger.error(`Error deleting file from S3: ${objectPath}`, {
        error,
      });
      return false;
    }
  }

  /**
   * Generates an object key (path) for S3 storage based on provided configuration.
   *
   * @param {string} fileName - The unique file name
   * @param {Object} config - Configuration object for object key generation
   * @param {StorageEntity} config.entityType - Type of entity the object belongs to
   * @param {string} [config.entityId] - Optional ID of the entity
   * @param {Environment} config.environment - Current environment (development/production)
   * @returns {string} Generated object key in format: environment/entityType/[entityId]/fileName
   */
  private _generateObjectKey(
    fileName: string,
    config: {
      entityType: StorageEntity;
      entityId?: string;
      environment: Environment;
    }
  ): string {
    const parts = [
      config.environment,
      config.entityType,
      config.entityId,
      fileName,
    ].filter(Boolean);

    return parts.join('/');
  }

  /**
   * Extracts the object key from a given S3 object path.
   *
   * @param {string} objectPath - The full path of the object in S3
   * @returns {string} The extracted object key
   */
  private _extractObjectKeyFromPath(objectPath: string): string {
    const urlParts = objectPath.split('/');
    return urlParts.slice(3).join('/');
  }
}
