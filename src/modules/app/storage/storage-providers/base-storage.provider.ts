import * as path from 'path';
import { BadRequestError } from '@/common/errors';

import { allowedFileTypes } from '../constants';
import { StorageEntity } from '../enums';

/**
 * Base class for handling storage-related operations.
 * Provides common utility methods for file name generation and type validation.
 *
 * @class BaseStorageProvider
 */
export class BaseStorageProvider {
  /**
   * Generates a unique file name by combining a sanitized original name with a unique identifier.
   *
   * @param {string} originalName - The original file name including extension
   * @param {string} uniqueId - A unique identifier to ensure file name uniqueness
   * @returns {string} A sanitized and unique file name with the original extension
   *
   * @example
   * // Returns "my-image-123abc.jpg"
   * generateUniqueFileName("My Image!.jpg", "123abc")
   */
  protected generateUniqueFileName(
    originalName: string,
    uniqueId: string
  ): string {
    const extension = path.extname(originalName);
    const sanitizedName = path
      .basename(originalName, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');

    return `${sanitizedName}-${uniqueId}${extension}`;
  }

  /**
   * Validates if a given file type is allowed for the specified storage entity.
   *
   * @param {string} fileType - The MIME type or file extension to validate
   * @param {StorageEntity} entityType - The storage entity type to check against
   * @throws {BadRequestError} If the file type is not allowed for the given entity type
   *
   * @example
   * // Validates if "image/jpeg" is allowed for "USER_AVATAR" entity
   * validateFileType("image/jpeg", StorageEntity.USER_AVATAR)
   */
  protected validateFileType(
    fileType: string,
    entityType: StorageEntity
  ): void {
    const allowed = allowedFileTypes.get(entityType) || [];
    if (!allowed.includes(fileType)) {
      throw new BadRequestError(
        `Invalid file type ${fileType}. Allowed types are: ${allowed.join(', ')}`
      );
    }
  }
}
