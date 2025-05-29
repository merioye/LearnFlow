import { SetMetadata } from '@nestjs/common';
import { Throttle as BaseThrottle } from '@nestjs/throttler';

import {
  THROTTLE_DEFAULT_KEY,
  THROTTLE_MESSAGE_DECORATOR_KEY,
  THROTTLE_METADATA_KEY,
  THROTTLE_SKIP_IF_DECORATOR_KEY,
} from '../constants';
import { TThrottleOptions } from '../types';

/**
 * Enhanced throttle decorator - OPTIONAL for custom limits
 * Only use when you need different limits than the auto-determined ones
 * @param options - Throttling configuration
 * @returns Method decorator
 */
export function CustomThrottle(options: TThrottleOptions = {}) {
  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    // Store our custom throttle metadata with a specific key
    SetMetadata(THROTTLE_METADATA_KEY, options)(
      target,
      propertyKey,
      descriptor
    );

    // Apply base throttle decorator if limits are provided
    if (options.ttl && options.limit) {
      BaseThrottle({
        [options.name || THROTTLE_DEFAULT_KEY]: {
          ttl: options.ttl,
          limit: options.limit,
        },
      })(target, propertyKey, descriptor);
    }

    // Set additional metadata
    if (options.skipIf) {
      SetMetadata(THROTTLE_SKIP_IF_DECORATOR_KEY, options.skipIf)(
        target,
        propertyKey,
        descriptor
      );
    }

    if (options.message) {
      SetMetadata(THROTTLE_MESSAGE_DECORATOR_KEY, options.message)(
        target,
        propertyKey,
        descriptor
      );
    }

    return descriptor;
  };
}
