import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { PERMISSION_DECORATOR_KEY } from '../constants';
import { RequiredPermission } from '../types';

/**
 * Decorator to specify required permissions for a route
 *
 * @param {RequiredPermission[]} permissions - Array of required permissions
 * @returns {CustomDecorator<string>} - The permission decorator
 */
export const RequirePermission = (
  ...permissions: RequiredPermission[]
): CustomDecorator<string> =>
  SetMetadata(PERMISSION_DECORATOR_KEY, permissions);
