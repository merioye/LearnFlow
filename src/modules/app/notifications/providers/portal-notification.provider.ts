import { Injectable } from '@nestjs/common';
import { ForbiddenError } from '@/common/errors';
import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
import { ILogger, InjectLogger } from '@/modules/common/logger';
import { v4 as uuidv4 } from 'uuid';

import { MainWSGateway, WSEvent } from '../../websockets';
import { InjectNotificationModuleConfig } from '../decorators';
import { NotificationMedium } from '../enums';
import { INotificationProvider } from '../interfaces';
import {
  TNotificationModuleConfig,
  TNotificationOptions,
  TNotificationRequest,
  TNotificationResult,
} from '../types';

/**
 * Portal notification provider implementation using Socket.io
 *
 * @class PortalNotificationProvider
 * @implements {INotificationProvider}
 */
@Injectable()
export class PortalNotificationProvider implements INotificationProvider {
  private _defaultOptions: TNotificationOptions;

  public constructor(
    @InjectNotificationModuleConfig()
    private readonly _moduleConfig: TNotificationModuleConfig,
    private readonly _mainWsGateway: MainWSGateway,
    @InjectDateTime() private readonly _dateTime: IDateTime,
    @InjectLogger() private readonly _logger: ILogger
  ) {
    this._initializePortalProvider();
  }

  /**
   * @inheritdoc
   */
  public canHandle(request: TNotificationRequest): boolean {
    // Provider can handle if medium is portal or not specified but recipients have userId
    if (request.medium === NotificationMedium.PORTAL) return true;

    if (!request.medium) {
      const recipients = Array.isArray(request.recipients)
        ? request.recipients
        : [request.recipients];

      return recipients.some((recipient) => !!recipient.userId);
    }

    return false;
  }

  /**
   * @inheritdoc
   */
  public async send(
    request: TNotificationRequest
  ): Promise<TNotificationResult> {
    const notificationId = request.options?.id || uuidv4();
    const { retry: _ } = { ...this._defaultOptions, ...request.options };

    try {
      const recipients = Array.isArray(request.recipients)
        ? request.recipients
        : [request.recipients];

      const validRecipients = recipients.filter((r) => !!r.userId);

      if (validRecipients.length === 0) {
        throw new ForbiddenError(
          'No valid user IDs provided for portal notification'
        );
      }

      // Prepare notification data
      const notification = {
        id: notificationId,
        timestamp: this._dateTime.toUTC(this._dateTime.now()),
        subject: request.content.subject,
        body: request.content.body,
        data: request.content.data,
      };

      // Track successful and failed deliveries
      const results = await Promise.all(
        validRecipients.map(async (recipient) => {
          const userId = recipient.userId as number;
          const isUserOnline = await this._mainWsGateway.isUserOnline(userId);
          if (!isUserOnline) {
            this._logger.debug(`User ${recipient.userId} not connected`);
            return { userId: recipient.userId, delivered: false };
          }

          try {
            // TODO: Enhancement: send message with acknowledgement
            this._mainWsGateway.sendToUser(
              userId,
              WSEvent.PORTAL_NOTIFICATION,
              notification
            );

            return { userId: recipient.userId, delivered: true };
          } catch (error) {
            this._logger.error(
              `Failed to send portal notification to user ${recipient.userId}`,
              { error }
            );
            return {
              userId: recipient.userId,
              delivered: false,
              error: (error as Error)?.message,
            };
          }
        })
      );

      const successCount = results.filter((r) => r.delivered).length;
      const failureCount = results.length - successCount;

      this._logger.debug(
        `Portal notifications: ${successCount} delivered, ${failureCount} failed`,
        {
          data: { notificationId },
        }
      );

      return {
        success: failureCount === 0,
        id: notificationId,
        timestamp: this._dateTime.toUTC(this._dateTime.now()),
        medium: NotificationMedium.PORTAL,
        providerResponse: {
          results,
          successCount,
          failureCount,
        },
        error:
          failureCount > 0
            ? `Failed to deliver ${failureCount} notifications`
            : undefined,
      };
    } catch (error) {
      this._logger.error('Failed to send portal notification', {
        error,
        data: {
          notificationId,
        },
      });

      return {
        success: false,
        id: notificationId,
        timestamp: this._dateTime.toUTC(this._dateTime.now()),
        medium: NotificationMedium.PORTAL,
        error: (error as Error)?.message,
      };
    }
  }

  /**
   * Initialize the portal notification provider
   * @returns {void}
   */
  private _initializePortalProvider(): void {
    try {
      if (!this._moduleConfig?.portal) {
        this._logger.warn('Portal notification configuration is missing');
        return;
      }

      this._defaultOptions =
        this._moduleConfig.portal.defaultOptions ||
        this._moduleConfig.defaultOptions ||
        {};

      this._logger.info('Portal notification provider initialized');
    } catch (error) {
      this._logger.error('Error initializing portal notification provider', {
        error,
      });
    }
  }
}
