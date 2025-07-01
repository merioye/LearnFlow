import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { IDateTime } from '@/modules/common/helper/date-time';
import { ILogger } from '@/modules/common/logger';

import { NotificationMedium } from '../enums';
import { INotificationProvider, INotificationsService } from '../interfaces';
import {
  TNotificationModuleConfig,
  TNotificationOptions,
  TNotificationRequest,
  TNotificationResult,
} from '../types';

/**
 * Main notifications service implementation
 *
 * @class NotificationsService
 * @implements {INotificationsService}
 */
@Injectable()
export class NotificationsService implements INotificationsService {
  private readonly _defaultOptions: TNotificationOptions;
  private readonly _providers: INotificationProvider[] = [];

  public constructor(
    private readonly _moduleConfig: TNotificationModuleConfig,
    private readonly _logger: ILogger,
    private readonly _dateTime: IDateTime
  ) {
    this._defaultOptions = this._moduleConfig.defaultOptions || {};
  }

  /**
   * Register a notification provider
   * @param provider The provider to register
   * @returns this instance for method chaining
   */
  public registerProvider(
    provider: INotificationProvider
  ): NotificationsService {
    this._providers.push(provider);
    this._logger.info(`Registered provider: ${provider.constructor.name}`);
    return this;
  }

  /**
   * Send a notification
   * @param request Notification request
   * @returns Promise resolving to notification result
   */
  public async send(
    request: TNotificationRequest
  ): Promise<TNotificationResult> {
    const provider = this._findProvider(request);

    if (!provider) {
      const notificationId = request.options?.id || uuidv4();
      this._logger.error('No provider found for notification request', {
        data: { notificationId, medium: request.medium },
      });

      return {
        success: false,
        id: notificationId,
        timestamp: this._dateTime.toUTC(this._dateTime.now()),
        medium: request.medium || ('unknown' as NotificationMedium),
        error: 'No suitable notification provider found for the request',
      };
    }

    try {
      // Apply default options if not provided
      if (!request.options) {
        request.options = { ...this._defaultOptions };
      } else {
        request.options = { ...this._defaultOptions, ...request.options };
      }

      this._logger.debug(
        `Sending notification using ${provider.constructor.name}`,
        {
          data: { id: request.options.id, medium: request.medium },
        }
      );

      return await provider.send(request);
    } catch (error) {
      const notificationId = request.options?.id || uuidv4();

      this._logger.error('Error sending notification', {
        error,
        data: {
          notificationId,
          medium: request.medium,
        },
      });

      return {
        success: false,
        id: notificationId,
        timestamp: this._dateTime.toUTC(this._dateTime.now()),
        medium:
          request.medium ||
          (provider.constructor.name
            .toLowerCase()
            .replace('notificationprovider', '') as NotificationMedium),
        error: (error as Error)?.message,
      };
    }
  }

  /**
   * Send multiple notifications in bulk
   * @param requests Array of notification requests
   * @returns Promise resolving to array of notification results
   */
  public async sendBulk(
    requests: TNotificationRequest[]
  ): Promise<TNotificationResult[]> {
    return Promise.all(requests.map((request) => this.send(request)));
  }

  /**
   * Find an appropriate provider for the notification
   * @param request Notification request
   * @returns The provider that can handle the request or undefined
   */
  private _findProvider(
    request: TNotificationRequest
  ): INotificationProvider | undefined {
    return this._providers.find((provider) => provider.canHandle(request));
  }
}
