import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';

import { INVALIDATE_CACHE_DECORATOR_KEY } from '../constants';
import { InvalidateCacheInterceptor } from '../interceptors';
import { TInvalidateCacheOptions } from '../types';

/**
 * Decorator for cache invalidation
 * @function InvalidateCache
 * @param {Object} options - Invalidation options
 * @param {string[]} options.entities - Entities to invalidate
 * @param {string} [options.keySuffix] - Key suffix pattern to invalidate
 * @returns {MethodDecorator}
 * @example
 * @InvalidateCache({ entities: ['Product'], keySuffix: 'product_list' })
 */
export const InvalidateCache = (
  options: TInvalidateCacheOptions
): MethodDecorator => {
  return applyDecorators(
    UseInterceptors(InvalidateCacheInterceptor),
    SetMetadata(INVALIDATE_CACHE_DECORATOR_KEY, options)
  );
};
