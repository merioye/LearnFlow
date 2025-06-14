import { Inject } from '@nestjs/common';

import { NOTIFICATION_SERVICE } from '../constants';

/**
 * Decorator for injecting the NotificationService
 *
 * @returns {PropertyDecorator & ParameterDecorator} - The inject notification service decorator
 */
export const InjectNotificationService = (): PropertyDecorator &
  ParameterDecorator => Inject(NOTIFICATION_SERVICE);
