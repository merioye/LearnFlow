import { SetMetadata } from '@nestjs/common';

import { IS_NOTIFICATION_ENABLED_DECORATOR_KEY } from '../constants';

/**
 * Decorator to enable/disable notifications for a route
 * Set whether notifications are enabled for a route
 * @param isEnabled Whether notifications are enabled
 * @returns {ReturnType<typeof SetMetadata>} - The notification enabled decorator
 */
export const NotificationEnabled = (
  isEnabled: boolean
): ReturnType<typeof SetMetadata> =>
  SetMetadata(IS_NOTIFICATION_ENABLED_DECORATOR_KEY, isEnabled);
