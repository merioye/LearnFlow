import { Injectable } from '@nestjs/common';
import { ForbiddenError, InternalServerError } from '@/common/errors';
import { retry } from '@/common/utils';
import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
import { ILogger, InjectLogger } from '@/modules/common/logger';
import twilio from 'twilio';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import { v4 as uuidv4 } from 'uuid';

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
 * SMS notification provider implementation using Twilio
 *
 * @class SmsNotificationProvider
 * @implements {INotificationProvider}
 */
@Injectable()
export class SmsNotificationProvider implements INotificationProvider {
  private _client: twilio.Twilio;
  private _defaultFrom: string;
  private _defaultOptions: TNotificationOptions;

  public constructor(
    @InjectNotificationModuleConfig()
    private readonly _moduleConfig: TNotificationModuleConfig,
    @InjectDateTime() private readonly _dateTime: IDateTime,
    @InjectLogger() private readonly _logger: ILogger
  ) {
    this._initializeClient();
  }

  /**
   * @inheritdoc
   */
  public canHandle(request: TNotificationRequest): boolean {
    // Provider can handle if medium is sms or not specified but recipients have phoneNumber
    if (request.medium === NotificationMedium.SMS) return true;

    if (!request.medium) {
      const recipients = Array.isArray(request.recipients)
        ? request.recipients
        : [request.recipients];

      return recipients.some((recipient) => !!recipient.phoneNumber);
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
      if (!this._client) {
        throw new InternalServerError('SMS client not initialized');
      }

      const recipients = Array.isArray(request.recipients)
        ? request.recipients
        : [request.recipients];

      const validRecipients = recipients.filter((r) => !!r.phoneNumber);

      if (validRecipients.length === 0) {
        throw new ForbiddenError('No valid phone numbers provided');
      }

      // For SMS, we need to send individual messages to each recipient
      const sendPromises = validRecipients.map((recipient) => {
        const sendSms = async (): Promise<MessageInstance> => {
          return this._client.messages.create({
            body: request.content.body,
            from: this._defaultFrom,
            to: recipient.phoneNumber!,
          });
        };

        if (options.retry) {
          return retry(
            sendSms,
            options.maxRetries || 3,
            options.retryDelay || 1000
          );
        }

        return sendSms().then((result) => ({ result, attempts: 0 }));
      });

      const results = await Promise.all(sendPromises);

      // Log successful sends
      results.forEach((result, index) => {
        this._logger.debug(
          `SMS sent to ${validRecipients[index]?.phoneNumber}`,
          {
            data: {
              notificationId,
              messageSid: result.result.sid,
            },
          }
        );
      });

      return {
        success: true,
        id: notificationId,
        timestamp: this._dateTime.toUTC(this._dateTime.now()),
        medium: NotificationMedium.SMS,
        providerResponse: results.map((r) => r.result),
        retryAttempts: Math.max(...results.map((r) => r.attempts)),
      };
    } catch (error) {
      this._logger.error('Failed to send SMS notification', {
        error,
        data: {
          notificationId,
        },
      });

      return {
        success: false,
        id: notificationId,
        timestamp: this._dateTime.toUTC(this._dateTime.now()),
        medium: NotificationMedium.SMS,
        error: (error as Error)?.message,
        retryAttempts: options.retry ? options.maxRetries : 0,
      };
    }
  }

  /**
   * Initialize the Twilio client with the config
   * @returns {void}
   */
  private _initializeClient(): void {
    try {
      if (
        !this._moduleConfig?.sms?.accountSid ||
        !this._moduleConfig?.sms?.authToken ||
        !this._moduleConfig?.sms?.defaultFrom
      ) {
        this._logger.error('SMS configuration is missing');
        return;
      }

      this._client = twilio(
        this._moduleConfig.sms.accountSid,
        this._moduleConfig.sms.authToken
      );
      this._defaultFrom = this._moduleConfig.sms.defaultFrom;
      this._defaultOptions =
        this._moduleConfig.sms.defaultOptions ||
        this._moduleConfig.defaultOptions ||
        {};

      this._logger.info('SMS client initialized successfully');
    } catch (error) {
      this._logger.error('Error initializing SMS client', { error });
    }
  }
}
