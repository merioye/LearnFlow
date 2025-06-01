import { FileTrackingEntity } from '@/database';

import { TGeneratedFileUploadUrl, TUploadUrlGenerationConfig } from '../types';

/**
 * Interface defining the contract for the StorageProvider
 *
 * @interface IStorageProvider
 */
export interface IStorageProvider {
  /**
   * Generates a pre-signed URL for file upload.
   *
   * @param {TUploadUrlGenerationConfig} config - Configuration object for generating a pre-signed URL.
   * @param {number} ownerId - ID of the user who is uploading the file.
   * @returns {Promise<TGeneratedFileUploadUrl>} Promise that resolves to the generated pre-signed URL.
   */
  generateUploadUrl(
    config: TUploadUrlGenerationConfig,
    ownerId: number
  ): Promise<TGeneratedFileUploadUrl>;

  /**
   * Deletes a file from the storage.
   *
   * @param {string} filePath - Path of the file to delete.
   * @returns {Promise<boolean>} True if deletion was successful, false otherwise
   */
  deleteFile(filePath: string): Promise<boolean>;

  /**
   * Confirms the upload of a file by updating the file status to ACTIVE
   *
   * @param {number} userId - The ID of the user who is performing the upload confirmation
   * @param {string} filePath - The path of the file in the storage
   * @returns {Promise<FileTrackingEntity | null>} The updated file if the upload is confirmed, null otherwise
   */
  confirmUpload(
    userId: number,
    filePath: string
  ): Promise<FileTrackingEntity | null>;
}
