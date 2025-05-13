import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { CACHE_TTL_DECORATOR_KEY } from '../constants';

/**
 * Sets custom TTL for cache entries
 * @function CacheTTL
 * @param {number} ttl - Time-to-live in seconds
 * @returns {CustomDecorator<string>}
 */
export const CacheTTL = (ttl: number): CustomDecorator<string> => {
  if (typeof ttl !== 'number' || ttl <= 0) {
    throw new Error(`Invalid TTL value: ${ttl}. Must be a positive number`);
  }
  return SetMetadata(CACHE_TTL_DECORATOR_KEY, ttl);
};
