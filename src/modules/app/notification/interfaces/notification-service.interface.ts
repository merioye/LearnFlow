import { TNotificationRequest, TNotificationResult } from '../types';

/**
 * Interface for the notification service
 */
export interface NotificationServiceInterface {
  /**
   * Send a notification
   * @param request The notification request
   * @returns A promise resolving to the notification result
   */
  send(request: TNotificationRequest): Promise<TNotificationResult>;

  /**
   * Send multiple notifications in bulk
   * @param requests Array of notification requests
   * @returns A promise resolving to an array of notification results
   */
  sendBulk(requests: TNotificationRequest[]): Promise<TNotificationResult[]>;
}
