import { TNotificationRequest, TNotificationResult } from '../types';

/**
 * Interface for notification provider strategy
 */
export interface INotificationProvider {
  /**
   * Send a notification through this provider
   * @param request The notification request
   * @param request.recipients Recipients of the notification
   * @param request.content Notification content
   * @param request.medium Notification medium
   * @param request.options Notification options
   * @returns A promise resolving to the notification result
   */
  send(request: TNotificationRequest): Promise<TNotificationResult>;

  /**
   * Check if this provider can handle the given notification request
   * @param request The notification request to check
   * @param request.recipients Recipients of the notification
   * @param request.content Notification content
   * @param request.medium Notification medium
   * @param request.options Notification options
   * @returns Boolean indicating if this provider can handle the request
   */
  canHandle(request: TNotificationRequest): boolean;
}
