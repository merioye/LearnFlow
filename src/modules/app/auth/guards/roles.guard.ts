import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ForbiddenError, NotAuthorizedError } from '@/common/errors';
import { ILogger, InjectLogger } from '@/modules/common/logger';

import { Role } from '@/enums';

import { ROLES_DECORATOR_KEY } from '../constants';
import { TCustomRequest } from '../types';

/**
 * Role-based authorization guard
 * @class RolesGuard
 * @implements {CanActivate}
 */
@Injectable()
export class RolesGuard implements CanActivate {
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

    const { user } = context.switchToHttp().getRequest<TCustomRequest>();
    if (!user) {
      this._logger.warn('No user found in the request');
      throw new NotAuthorizedError('User is not authenticated');
    }
    if (user.role === Role.ADMIN) {
      this._logger.info('User is admin, skipping role check');
      return true;
    }

    // Check if user has required role
    const hasRequiredRole = requiredRoles.some((role) => role === user.role);

    if (!hasRequiredRole) {
      this._logger.warn(
        `User ${user.email} does not have required roles: ${requiredRoles.join(', ')}`
      );

      // Deny access
      throw new ForbiddenError('User has insufficient permissions');
    }

    // Grant access and proceed to next middleware
    return true;
  }
}
