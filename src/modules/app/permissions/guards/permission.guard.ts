import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ForbiddenError, NotAuthorizedError } from '@/common/errors';
import { ILogger, InjectLogger } from '@/modules/common/logger';

import { Role } from '@/enums';

import { TCustomRequest } from '../../auth';
import { PERMISSION_DECORATOR_KEY } from '../constants';
import { RequiredPermission } from '../types';

/**
 * Guard to check if the user has the required permissions
 *
 * @class PermissionGuard
 * @implements {CanActivate}
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  public constructor(
    @InjectLogger() private readonly _logger: ILogger,
    private readonly _reflector: Reflector
  ) {}

  /**
   * Checks if the user has the required permissions
   * @param {ExecutionContext} context - The execution context
   * @returns {boolean} - True if the user has the required permissions, false otherwise
   */
  public canActivate(context: ExecutionContext): boolean {
    // Get required permissions from metadata
    const requiredPermissions = this._reflector.getAllAndOverride<
      RequiredPermission[]
    >(PERMISSION_DECORATOR_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions || !requiredPermissions.length) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<TCustomRequest>();
    if (!user) {
      this._logger.warn('User not found in the request');
      throw new NotAuthorizedError('User is not authenticated');
    }
    if (user.role === Role.ADMIN) {
      this._logger.info('User is admin, skipping permission check');
      return true;
    }

    // Check if user has required permissions
    const hasPermission = requiredPermissions.every((permission) => {
      const { action, resource } = permission;
      const permissionSlug = `${action.toLowerCase()}-${resource.toLowerCase().split(' ').join('-')}`;
      return user.permissions.includes(permissionSlug);
    });

    if (hasPermission) {
      this._logger.info(
        `User ${user.email} granted ${requiredPermissions[0]?.action} permission on ${requiredPermissions[0]?.resource}`
      );

      // Grant access and proceed to next middleware
      return true;
    } else {
      this._logger.warn(
        `User ${user.email} denied ${requiredPermissions[0]?.action} permission on ${requiredPermissions[0]?.resource}`
      );

      // Deny access
      throw new ForbiddenError('User has insufficient permissions');
    }
  }
}
