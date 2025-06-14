import { TNotificationRequest, TNotificationResult } from '../types';

/**
 * Interface for notification provider strategy
 */
export interface INotificationProvider {
  /**
   * Send a notification through this provider
   * @param request The notification request
   * @returns A promise resolving to the notification result
   */
  send(request: TNotificationRequest): Promise<TNotificationResult>;

  /**
   * Check if this provider can handle the given notification request
   * @param request The notification request to check
   * @returns Boolean indicating if this provider can handle the request
   */
  canHandle(request: TNotificationRequest): boolean;
}
