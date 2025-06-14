import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WSError } from '@/common/errors';
import { ILogger, InjectLogger } from '@/modules/common/logger';

import { Role } from '@/enums';

import {
  PERMISSION_DECORATOR_KEY,
  RequiredPermission,
} from '../../permissions';
import { TCustomSocket } from '../types';

/**
 * WSPermissionGuard - Handles permission checks for WebSocket connections
 *
 * @class WSPermissionGuard
 * @implements {CanActivate}
 */
@Injectable()
export class WSPermissionGuard implements CanActivate {
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

    const client = context.switchToWs().getClient<TCustomSocket>();
    const user = client.data.user;
    if (!user) {
      this._logger.warn(`No user found for socket: ${client.id}`);
      throw new WSError('User is not authenticated', HttpStatus.UNAUTHORIZED);
      // return false;
    }
    if (user.role === Role.ADMIN) {
      this._logger.info('Socket is admin, skipping permission check', {
        data: {
          userId: user?.userId,
          socketId: client.id,
        },
      });
      return true;
    }

    // Check if user has required permissions
    const hasPermission = requiredPermissions.every((permission) => {
      const { action, resource } = permission;
      const permissionSlug = `${action.toLowerCase()}-${resource.toLowerCase().split(' ').join('-')}`;
      return user?.permissions.includes(permissionSlug);
    });

    if (hasPermission) {
      this._logger.info(
        `User ${user?.email} granted ${requiredPermissions[0]?.action} permission on ${requiredPermissions[0]?.resource}`
      );

      // Grant access and proceed to next middleware
      return true;
    } else {
      this._logger.warn(
        `User ${user?.email} denied ${requiredPermissions[0]?.action} permission on ${requiredPermissions[0]?.resource}`
      );

      // Deny access
      throw new WSError(
        'User has insufficient permissions',
        HttpStatus.FORBIDDEN
      );
      // return false;
    }
  }
}
