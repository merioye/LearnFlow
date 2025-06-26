import { Global, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { WSExceptionsFilter } from '@/core/filters';
import { WSLoggingInterceptor } from '@/core/interceptors';
import { ILogger, LOGGER } from '@/modules/common/logger';

import { MainWSGateway } from './gateways';
import { WSAccessTokenGuard, WSPermissionGuard, WSRolesGuard } from './guards';
import { WSRedisService } from './services';

/**
 * WebSocketsModule - Main module for WebSocket functionality
 * Configures all WebSocket-related services and providers
 *
 * @module WebSocketsModule
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
      useFactory: (logger: ILogger): WSExceptionsFilter =>
        new WSExceptionsFilter(logger),
      inject: [LOGGER],
    },
  ],
  exports: [WSRedisService, MainWSGateway],
})
export class WebsocketsModule {}
