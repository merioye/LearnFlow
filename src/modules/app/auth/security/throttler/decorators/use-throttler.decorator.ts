import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { THROTTLE_USE_DECORATOR_KEY } from '../constants';
import { TThrottlerConfig } from '../types';

/**
 * Apply specific throttler by name
 * Useful when auto-detection doesn't work for your use case
 * @param throttlerName - Name of the throttler to use
 * @returns Method decorator
 */
export function UseThrottler(
  throttlerName: keyof TThrottlerConfig
): CustomDecorator<string> {
  return SetMetadata(THROTTLE_USE_DECORATOR_KEY, throttlerName);
}
