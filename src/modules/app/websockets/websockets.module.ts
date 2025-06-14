import { Global, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { WSExceptionsFilter } from '@/core/filters';
import { WSLoggingInterceptor } from '@/core/interceptors';
import { ILogger, LOGGER } from '@/modules/common/logger';

import { MainWSGateway } from './gateways';
import { WSAccessTokenGuard, WSPermissionGuard, WSRolesGuard } from './guards';
import { WSRedisService } from './services';

/**
 * WebSocketModule - Main module for WebSocket functionality
 * Configures all WebSocket-related services and providers
 *
 * @module WebSocketModule
 */
@Global()
@Module({
  providers: [
    WSRedisService,
    WSAccessTokenGuard,
    WSRolesGuard,
    WSPermissionGuard,
    WSLoggingInterceptor,
    MainWSGateway,
    {
      provide: APP_FILTER,
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      useFactory: (logger: ILogger) => new WSExceptionsFilter(logger),
      inject: [LOGGER],
    },
  ],
  exports: [WSRedisService, MainWSGateway],
})
export class WebsocketsModule {}
