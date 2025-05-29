import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { THROTTLE_SKIP_DECORATOR_KEY } from '../constants';

/**
 * Skip throttling completely for specific endpoints
 * Use for health checks, monitoring endpoints, or internal APIs
 * @param condition - Optional function to determine if throttling should be skipped
 * @returns Method decorator
 */
export function CustomSkipThrottle(
  condition?: (request: any) => boolean
): CustomDecorator<string> {
  return SetMetadata(
    THROTTLE_SKIP_DECORATOR_KEY,
    condition || ((): boolean => true)
  );
}
