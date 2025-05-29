import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { SKIP_CSRF_DECORATOR_KEY } from '../constants';

/**
 * Decorator to skip CSRF validation for specific routes or controllers
 * Use with caution and only for routes that don't perform state-changing operations
 */
export const SkipCsrf = (): CustomDecorator<string> =>
  SetMetadata(SKIP_CSRF_DECORATOR_KEY, true);
