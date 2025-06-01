import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { Role } from '@/enums';

import { ROLES_DECORATOR_KEY } from '../constants';

/**
 * Decorator to specify required roles for a route
 *
 * @param {Role[]} roles - Array of required roles
 * @returns {CustomDecorator<string>} - The role decorator
 */
export const Roles = (...roles: Role[]): CustomDecorator<string> =>
  SetMetadata(ROLES_DECORATOR_KEY, roles);
