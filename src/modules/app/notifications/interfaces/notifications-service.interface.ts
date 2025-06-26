import { TNotificationRequest, TNotificationResult } from '../types';

/**
 * Interface for the notification service
 */
export interface INotificationsService {
  /**
   * Send a notification
   * @param request The notification request
   * @param request.recipients Recipients of the notification
   * @param request.content Notification content
   * @param request.medium Notification medium
   * @param request.options Notification options
   * @returns A promise resolving to the notification result
   */
  send(request: TNotificationRequest): Promise<TNotificationResult>;

  /**
   * Send multiple notifications in bulk
   * @param requests Array of notification requests
   * @param requests[index].recipients Recipients of the notification
   * @param requests[index].content Notification content
   * @param requests[index].medium Notification medium
   * @param requests[index].options Notification options
   * @returns A promise resolving to an array of notification results
   */
  sendBulk(requests: TNotificationRequest[]): Promise<TNotificationResult[]>;
}
