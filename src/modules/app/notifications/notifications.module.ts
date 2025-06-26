import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { DATE_TIME, IDateTime } from '@/modules/common/helper/date-time';
import { ILogger, LOGGER } from '@/modules/common/logger';

import { MainWSGateway } from '../websockets';
import { NOTIFICATION_MODULE_CONFIG, NOTIFICATION_SERVICE } from './constants';
import {
  EmailNotificationProvider,
  PortalNotificationProvider,
  PushNotificationProvider,
  SmsNotificationProvider,
} from './providers';
import { NotificationsService } from './services';
import { TNotificationModuleConfig } from './types';

/**
 * Main notification module definition
 *
 * @module NotificationsModule
 */
@Global()
@Module({})
export class NotificationsModule {
  /**
   * Register the notification module with static configuration
   * @param config Module configuration
   * @returns Dynamic module
   */
  public static forRoot(config: TNotificationModuleConfig): DynamicModule {
    return {
      module: NotificationsModule,
      providers: this._createProviders(config),
      exports: [NOTIFICATION_SERVICE],
    };
  }

  /**
   * Create all providers needed for the module
   * @param config Module configuration
   * @returns Array of providers
   */
  private static _createProviders(
    config: TNotificationModuleConfig
  ): Provider[] {
    return [
      { provide: NOTIFICATION_MODULE_CONFIG, useValue: config },
      EmailNotificationProvider,
      SmsNotificationProvider,
      PushNotificationProvider,
      {
        provide: PortalNotificationProvider,
        useFactory: (
          moduleConfig: TNotificationModuleConfig,
          mainWsGateway: MainWSGateway,
          dateTime: IDateTime,
          logger: ILogger
        ): PortalNotificationProvider => {
          return new PortalNotificationProvider(
            moduleConfig,
            mainWsGateway,
            dateTime,
            logger
          );
        },
        inject: [NOTIFICATION_MODULE_CONFIG, MainWSGateway, DATE_TIME, LOGGER],
      },
      {
        provide: NOTIFICATION_SERVICE,
        useFactory: (
          logger: ILogger,
          dateTime: IDateTime,
          emailProvider: EmailNotificationProvider,
          smsProvider: SmsNotificationProvider,
          pushProvider: PushNotificationProvider,
          portalProvider: PortalNotificationProvider
        ): NotificationsService => {
          const service = new NotificationsService(config, logger, dateTime);

          // Register all available providers
          service.registerProvider(emailProvider);
          service.registerProvider(smsProvider);
          service.registerProvider(pushProvider);
          service.registerProvider(portalProvider);

          return service;
        },
        inject: [
          LOGGER,
          DATE_TIME,
          EmailNotificationProvider,
          SmsNotificationProvider,
          PushNotificationProvider,
          PortalNotificationProvider,
        ],
      },
    ];
  }
}
