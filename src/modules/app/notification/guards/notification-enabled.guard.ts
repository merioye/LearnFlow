import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IS_NOTIFICATION_ENABLED_DECORATOR_KEY } from '../constants';

/**
 * Guard to check if notification is enabled for a route
 *
 * @class NotificationEnabledGuard
 * @implements {CanActivate}
 */
@Injectable()
export class NotificationEnabledGuard implements CanActivate {
  public constructor(private readonly _reflector: Reflector) {}

  /**
   * Check if notification is enabled for a route
   *
   * @param context - Execution context
   * @returns boolean indicating if notification is enabled
   */
  public canActivate(context: ExecutionContext): boolean {
    const isNotificationEnabled = this._reflector.getAllAndOverride<boolean>(
      IS_NOTIFICATION_ENABLED_DECORATOR_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (isNotificationEnabled === undefined) {
      return true; // If not specified, allow by default
    }

    return isNotificationEnabled;
  }
}
