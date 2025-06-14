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

import { ROLES_DECORATOR_KEY } from '../../auth/constants';
import { TCustomSocket } from '../types';

/**
 * WSRolesGuard - Role-based access control for WebSocket events
 *
 * @class WSRolesGuard
 * @implements {CanActivate}
 */
@Injectable()
export class WSRolesGuard implements CanActivate {
  public constructor(
    @InjectLogger() private readonly _logger: ILogger,
    private readonly _reflector: Reflector
  ) {}

  /**
   * Check if request can be activated based on user role
   * @param {ExecutionContext} context - Execution context
   * @returns {boolean} Whether the request can be activated
   */
  public canActivate(context: ExecutionContext): boolean {
    // Get required roles from metadata
    const requiredRoles = this._reflector.getAllAndOverride<Role[]>(
      ROLES_DECORATOR_KEY,
      [context.getHandler(), context.getClass()]
    );
    if (!requiredRoles || requiredRoles.length === 0) {
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
      this._logger.info('Socket is admin, skipping role check', {
        data: {
          userId: user.userId,
          socketId: client.id,
        },
      });
      return true;
    }

    // Check if user has required role
    const hasRequiredRole = requiredRoles.some((role) => role === user.role);
    if (!hasRequiredRole) {
      this._logger.warn(
        `Socket does not have required roles: ${requiredRoles.join(', ')}`,
        {
          data: {
            userId: user.userId,
            socketId: client.id,
          },
        }
      );

      // Deny access
      throw new WSError(
        'User has insufficient permissions',
        HttpStatus.FORBIDDEN
      );
      // return false;
    }

    // Grant access and proceed to next middleware
    return true;
  }
}
