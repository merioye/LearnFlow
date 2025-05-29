import { createHash } from 'crypto';
import { Injectable } from '@nestjs/common';

import { HashAlgorithm } from '../enums';
import { IHashService } from '../interfaces';
import { THashOptions } from '../types';

/**
 * Service for hashing data using various algorithms
 * @class CryptoHashService
 * @implements {IHashService}
 */
@Injectable()
export class CryptoHashService implements IHashService {
  /**
   * Hashes a string using the specified options
   * @param {string} data - The string to hash
   * @param {THashOptions} [options] - Options for hashing
   * @returns {Promise<string>} The hashed string
   */
  public async hash(data: string, options?: THashOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const hash = createHash(options?.algorithm ?? HashAlgorithm.SHA256)
          .update(data)
          .digest('hex');
        resolve(hash);
      } catch (error) {
        reject(error as Error);
      }
    });
  }

  /**
   * Hashes a string using the specified options
   * @param {string} data - The string to hash
   * @param {THashOptions} [options] - Options for hashing
   * @returns {string} The hashed string
   */
  public hashSync(data: string, options?: THashOptions): string {
    return createHash(options?.algorithm ?? HashAlgorithm.SHA256)
      .update(data)
      .digest('hex');
  }

  /**
   * Compares a string with a hashed string
   * @param {string} data - The string to compare
   * @param {string} encrypted - The hashed string to compare with
   * @param {THashOptions} [options] - Options for hashing
   * @returns {Promise<boolean>} True if the strings match, false otherwise
   */
  public async compare(
    data: string,
    encrypted: string,
    options?: THashOptions
  ): Promise<boolean> {
    const dataHash = await this.hash(data, options);
    return dataHash === encrypted;
  }

  /**
   * Compares a string with a hashed string
   * @param {string} data - The string to compare
   * @param {string} encrypted - The hashed string to compare with
   * @param {THashOptions} [options] - Options for hashing
   * @returns {boolean} True if the strings match, false otherwise
   */
  public compareSync(
    data: string,
    encrypted: string,
    options?: THashOptions
  ): boolean {
    const dataHash = this.hashSync(data, options);
    return dataHash === encrypted;
  }
}
