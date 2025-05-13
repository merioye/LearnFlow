import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { EXCLUDE_FROM_CACHE_DECORATOR_KEY } from '../constants';

/**
 * Decorator to exclude a method from cache (Opt-out of caching)
 * Skip the cache for this method
 * @returns {CustomDecorator<string>}
 */
export const ExcludeFromCache = (): CustomDecorator<string> =>
  SetMetadata(EXCLUDE_FROM_CACHE_DECORATOR_KEY, true);
