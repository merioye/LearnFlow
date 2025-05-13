import { ExecutionContext } from '@nestjs/common';

/**
 * Invalidation options for @InvalidateCache decorator
 */
export type TCacheKeySuffixType =
  | string
  | ((context: ExecutionContext) => string);
export type TInvalidateCacheOptions =
  | { entities: string[]; keySuffix?: TCacheKeySuffixType }
  | { entities?: string[]; keySuffix: TCacheKeySuffixType };

/**
 * Type representing the CacheModuleOptions.
 *
 * @typedef TCacheModuleOptions
 *
 * @property {number} [ttl] - The time-to-live (TTL) of the cache entry in seconds. If not specified, the cache entry will be stored indefinitely.
 */
export type TCacheModuleOptions = {
  ttl?: number;
};
