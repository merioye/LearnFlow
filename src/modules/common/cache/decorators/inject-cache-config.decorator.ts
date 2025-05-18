import { Inject } from '@nestjs/common';

import { CACHE_CONFIG } from '../constants';

/**
 * Custom decorator to inject the API cache configuration object.
 *
 * This is a shorthand for `@Inject(CACHE_CONFIG)` and can be used to
 * inject the cache config into class constructors or properties.
 *
 * @returns A property and parameter decorator that injects the cache config.
 */
export const InjectCacheConfig = (): PropertyDecorator & ParameterDecorator =>
  Inject(CACHE_CONFIG);
