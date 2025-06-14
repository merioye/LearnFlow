// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { ForbiddenError, InternalServerError } from '@/common/errors';
// import { retry } from '@/common/utils';
// import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
// import { ILogger, InjectLogger } from '@/modules/common/logger';
// import * as nodemailer from 'nodemailer';
// import { v4 as uuidv4 } from 'uuid';

// import { InjectNotificationModuleConfig } from '../decorators';
// import { NotificationMedium } from '../enums';
// import { INotificationProvider } from '../interfaces';
// import {
//   TNotificationModuleConfig,
//   TNotificationOptions,
//   TNotificationRequest,
//   TNotificationResult,
// } from '../types';

// /**
//  * Email notification provider implementation using nodemailer
//  *
//  * @class EmailNotificationProvider
//  * @implements {INotificationProvider}
//  */
// @Injectable()
// export class EmailNotificationProvider implements INotificationProvider {
//   private _transporter: nodemailer.Transporter;
//   private _defaultFrom: string;
//   private _defaultOptions: TNotificationOptions;

//   public constructor(
//     @InjectNotificationModuleConfig()
//     private readonly _moduleConfig: TNotificationModuleConfig,
//     @InjectDateTime() private readonly _dateTime: IDateTime,
//     @InjectLogger() private readonly _logger: ILogger,
//     private readonly _configService: ConfigService
//   ) {
//     this._initializeTransporter();
//   }

//   /**
//    * @inheritdoc
//    */
//   public canHandle(request: TNotificationRequest): boolean {
//     // Provider can handle if medium is email or not specified but recipients have email
//     if (request.medium === NotificationMedium.EMAIL) return true;

//     if (!request.medium) {
//       const recipients = Array.isArray(request.recipients)
//         ? request.recipients
//         : [request.recipients];

//       return recipients.some((recipient) => !!recipient.email);
//     }

//     return false;
//   }

//   /**
//    * @inheritdoc
//    */
//   public async send(
//     request: TNotificationRequest
//   ): Promise<TNotificationResult> {
//     const notificationId = request.options?.id || uuidv4();
//     const options = { ...this._defaultOptions, ...request.options };

//     try {
//       if (!this._transporter) {
//         throw new InternalServerError('Email transporter not initialized');
//       }

//       const recipients = Array.isArray(request.recipients)
//         ? request.recipients
//         : [request.recipients];

//       const validRecipients = recipients.filter((r) => !!r.email);

//       if (validRecipients.length === 0) {
//         throw new ForbiddenError('No valid email recipients provided');
//       }

//       // Build the email options
//       const mailOptions = {
//         from: this._defaultFrom,
//         to: validRecipients.map((r) => r.email).join(','),
//         subject: request.content.subject,
//         text: request.content.body,
//         html: request.content.html || request.content.body,
//         attachments: request.content.attachments,
//       };

//       // Send email with retry logic if enabled
//       const sendWithRetry = async () => {
//         const result = await this._transporter.sendMail(mailOptions);
//         this._logger.debug(`Email sent: ${result.messageId}`, {
//           data: { notificationId, recipients: mailOptions.to },
//         });
//         return result;
//       };

//       let providerResponse;
//       let retryAttempts = 0;

//       if (options.retry) {
//         const { result, attempts } = await retry(
//           sendWithRetry,
//           options.maxRetries || 3,
//           options.retryDelay || 1000
//         );
//         providerResponse = result;
//         retryAttempts = attempts;
//       } else {
//         providerResponse = await sendWithRetry();
//       }

//       return {
//         success: true,
//         id: notificationId,
//         timestamp: new Date(),
//         medium: NotificationMedium.EMAIL,
//         providerResponse,
//         retryAttempts,
//       };
//     } catch (error) {
//       this._logger.error(
//         `Failed to send email notification: ${error.message}`,
//         {
//           error: error.stack,
//           notificationId,
//         }
//       );

//       return {
//         success: false,
//         id: notificationId,
//         timestamp: this._dateTime.toUTC(this._dateTime.timestamp),
//         medium: NotificationMedium.EMAIL,
//         error: error.message,
//         retryAttempts: options.retry ? options.maxRetries : 0,
//       };
//     }
//   }

//   /**
//    * Initialize the nodemailer transporter with the config
//    * @returns {void}
//    */
//   private _initializeTransporter(): void {
//     try {
//       if (!this._moduleConfig?.email?.transport) {
//         this._logger.error('Email transport configuration is missing');
//         return;
//       }

//       this._transporter = nodemailer.createTransport(
//         this._moduleConfig.email.transport
//       );
//       this._defaultFrom =
//         this._moduleConfig.email.defaultFrom || 'noreply@example.com';
//       this._defaultOptions =
//         this._moduleConfig.email.defaultOptions ||
//         this._moduleConfig.defaultOptions ||
//         {};

//       // Verify the transporter
//       this._transporter
//         .verify()
//         .then(() => this._logger.info('Email transporter is ready'))
//         .catch((err: unknown) =>
//           this._logger.error('Failed to initialize email transporter', {
//             error: err,
//           })
//         );
//     } catch (error) {
//       this._logger.error('Error initializing email transporter', { error });
//     }
//   }
// }
