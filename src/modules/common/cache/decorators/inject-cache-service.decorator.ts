import { Inject } from '@nestjs/common';

import { CACHE_SERVICE } from '../constants';

/**
 * Custom decorator to inject the cache service instance.
 *
 * This is a shorthand for `@Inject(CACHE_SERVICE)` and can be used to
 * inject the cache service into class constructors or properties.
 *
 * @returns A property and parameter decorator that injects the cache service.
 */
export const InjectCacheService = (): PropertyDecorator & ParameterDecorator =>
  Inject(CACHE_SERVICE);
