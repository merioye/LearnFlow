import { Injectable } from '@nestjs/common';
import { ForbiddenError, InternalServerError } from '@/common/errors';
import { retry } from '@/common/utils';
import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
import { ILogger, InjectLogger } from '@/modules/common/logger';
import { app, credential, messaging } from 'firebase-admin';
import { App, initializeApp } from 'firebase-admin/app';
import { BatchResponse, MulticastMessage } from 'firebase-admin/messaging';
import { v4 as uuidv4 } from 'uuid';

import { InjectNotificationModuleConfig } from '../decorators';
import { NotificationMedium, NotificationPriority } from '../enums';
import { INotificationProvider } from '../interfaces';
import {
  TNotificationModuleConfig,
  TNotificationOptions,
  TNotificationRequest,
  TNotificationResult,
} from '../types';

/**
 * Push notification provider implementation using Firebase
 *
 * @class PushNotificationProvider
 * @implements {INotificationProvider}
 */
@Injectable()
export class PushNotificationProvider implements INotificationProvider {
  private _app: App;
  private _defaultOptions: TNotificationOptions;

  public constructor(
    @InjectNotificationModuleConfig()
    private readonly _moduleConfig: TNotificationModuleConfig,
    @InjectDateTime() private readonly _dateTime: IDateTime,
    @InjectLogger() private readonly _logger: ILogger
  ) {
    this._initializeFirebase();
  }

  /**
   * @inheritdoc
   */
  public canHandle(request: TNotificationRequest): boolean {
    // Provider can handle if medium is push or not specified but recipients have deviceToken
    if (request.medium === NotificationMedium.PUSH) return true;

    if (!request.medium) {
      const recipients = Array.isArray(request.recipients)
        ? request.recipients
        : [request.recipients];

      return recipients.some((recipient) => !!recipient.deviceToken);
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
    const options = { ...this._defaultOptions, ...request.options };

    try {
      if (!this._app) {
        throw new InternalServerError(
          'Push notification client not initialized'
        );
      }

      const recipients = Array.isArray(request.recipients)
        ? request.recipients
        : [request.recipients];

      const validRecipients = recipients.filter((r) => !!r.deviceToken);

      if (validRecipients.length === 0) {
        throw new ForbiddenError('No valid device tokens provided');
      }

      // Prepare the message payload
      const message: MulticastMessage = {
        tokens: validRecipients.map((r) => r.deviceToken) as string[],
        notification: {
          title: request.content.subject,
          body: request.content.body,
        },
        data: request.content.data,
        android: {
          priority:
            options.priority === NotificationPriority.HIGH
              ? NotificationPriority.HIGH
              : NotificationPriority.NORMAL,
        },
        apns: {
          payload: {
            aps: {
              sound:
                options.priority === NotificationPriority.HIGH
                  ? 'default'
                  : undefined,
              contentAvailable: true,
            },
          },
        },
      };

      // Send push notification with retry logic if enabled
      const sendPush = async (): Promise<BatchResponse> => {
        return messaging().sendEachForMulticast(message);
      };

      let providerResponse;
      let retryAttempts = 0;

      if (options.retry) {
        const { result, attempts } = await retry(
          sendPush,
          options.maxRetries || 3,
          options.retryDelay || 1000
        );
        providerResponse = result;
        retryAttempts = attempts;
      } else {
        providerResponse = await sendPush();
      }

      const success = providerResponse.failureCount === 0;

      if (providerResponse.failureCount > 0) {
        this._logger.warn(
          `${providerResponse.failureCount} push notifications failed to send`,
          {
            data: {
              notificationId,
              failures: providerResponse.responses.filter((r) => !r.success),
            },
          }
        );
      } else {
        this._logger.debug(
          `Push notifications sent successfully to ${providerResponse.successCount} devices`,
          {
            data: { notificationId },
          }
        );
      }

      return {
        success: success,
        id: notificationId,
        timestamp: this._dateTime.toUTC(this._dateTime.now()),
        medium: NotificationMedium.PUSH,
        providerResponse: {
          successCount: providerResponse.successCount,
          failureCount: providerResponse.failureCount,
          responses: providerResponse.responses,
        },
        retryAttempts,
        error: success
          ? undefined
          : `${providerResponse.failureCount} notifications failed to send`,
      };
    } catch (error) {
      this._logger.error('Failed to send push notification', {
        error,
        data: { notificationId },
      });

      return {
        success: false,
        id: notificationId,
        timestamp: this._dateTime.toUTC(this._dateTime.now()),
        medium: NotificationMedium.PUSH,
        error: (error as Error)?.message,
        retryAttempts: options.retry ? options.maxRetries : 0,
      };
    }
  }

  /**
   * Initialize Firebase Admin SDK with the config
   * @returns {void}
   */
  private _initializeFirebase(): void {
    try {
      if (!this._moduleConfig?.push?.firebaseCredentials) {
        this._logger.error('Push notification configuration is missing');
        return;
      }

      // Check if Firebase admin is already initialized
      try {
        this._app = app();
      } catch {
        // Initialize Firebase app if not already initialized
        this._app = initializeApp({
          credential: credential.cert({
            projectId: this._moduleConfig.push.firebaseCredentials.projectId,
            privateKey: this._moduleConfig.push.firebaseCredentials.privateKey,
            clientEmail:
              this._moduleConfig.push.firebaseCredentials.clientEmail,
          }),
        });
      }

      this._defaultOptions =
        this._moduleConfig.push.defaultOptions ||
        this._moduleConfig.defaultOptions ||
        {};

      this._logger.info('Firebase messaging initialized successfully');
    } catch (error) {
      this._logger.error('Error initializing Firebase messaging', { error });
    }
  }
}
