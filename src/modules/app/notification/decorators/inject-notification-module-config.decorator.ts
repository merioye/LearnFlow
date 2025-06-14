import { Inject } from '@nestjs/common';

import { NOTIFICATION_MODULE_CONFIG } from '../constants';

/**
 * Decorator for injecting the NotificationModuleConfig
 *
 * @returns {PropertyDecorator & ParameterDecorator} - The inject notification module config decorator
 */
export const InjectNotificationModuleConfig = (): PropertyDecorator &
  ParameterDecorator => Inject(NOTIFICATION_MODULE_CONFIG);
