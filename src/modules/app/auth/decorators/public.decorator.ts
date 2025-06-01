import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { IS_PUBLIC_DECORATOR_KEY } from '../constants';

/**
 * Decorator to mark a route as public
 *
 * @returns {CustomDecorator<string>} - The public decorator
 */
export const Public = (): CustomDecorator<string> =>
  SetMetadata(IS_PUBLIC_DECORATOR_KEY, true);
