import { StorageEntity } from '../enums';

/**
 * Parameters for generating a pre-signed URL for file upload.
 */
export type TUploadUrlGenerationParams = {
  /** MIME type of the file */
  fileType: string;
  /** Original name of the file */
  fileName: string;
  /** Type of entity the file belongs to */
  entityType: StorageEntity;
  /** Optional ID of the entity */
  entityId?: string;
};

/**
 * Configuration object for generating a pre-signed URL for file upload.
 */
export type TUploadUrlGenerationConfig = {
  /** URL expiration time in seconds */
  expiration: number;
} & TUploadUrlGenerationParams;

/**
 * Context object for the storage cleanup task.
 */
export type TStorageCleanupTaskContext = {
  RETENTION_DAYS: number;
};

export type TGeneratedFileUploadUrl = {
  filePath: string;
  presignedUrl: string;
};
