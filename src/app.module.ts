import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { GracefulShutdownModule } from 'nestjs-graceful-shutdown';
import { DataSource } from 'typeorm';

import {
  cacheModuleOptions,
  configOptions,
  cronJobModuleOptions,
  loggerModuleOptions,
  validationPipeOptions,
} from './config';
import { AllExceptionsFilter } from './core/filters';
import { ExceptionHandlingStrategyFactory } from './core/filters/factories';
import { HttpLoggingInterceptor } from './core/interceptors';
import { DatabaseModule } from './database';
import { Config } from './enums';
import { ApplicationModule } from './modules/app';
import { CommonAppModule } from './modules/common';
import { CACHE_SERVICE, ICacheService } from './modules/common/cache';
import { ILogger, LOGGER } from './modules/common/logger';

/**
 * The application module
 *
 * This module is the entry point of the application. It initializes the imported modules
 * and providers.
 *
 * @module AppModule
 *
 */
@Module({
  imports: [
    // ThrottlerModule.forRootAsync(throttlerModuleOptions),
    ConfigModule.forRoot(configOptions),
    DatabaseModule,
    GracefulShutdownModule.forRootAsync({
      inject: [ConfigService, LOGGER, CACHE_SERVICE, DataSource],
      useFactory: (
        configService: ConfigService,
        logger: ILogger,
        cacheService: ICacheService,
        dataSource: DataSource
      ) => ({
        gracefulShutdownTimeout: configService.get<number>(
          Config.GRACEFUL_SHUTDOWN_TIMEOUT
        ),
        async cleanup(): Promise<void> {
          logger.info('Closing database connection...');
          await dataSource.destroy();
          logger.info('Database connection closed.');

          logger.info('Closing API Cache connection...');
          await cacheService.disconnect();
          logger.info('API Cache connection closed.');
        },
      }),
    }),
    CommonAppModule.forRoot({
      logger: loggerModuleOptions,
      cache: cacheModuleOptions,
      cronJob: cronJobModuleOptions,
    }),
    ApplicationModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: HttpLoggingInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe(validationPipeOptions),
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
    ExceptionHandlingStrategyFactory,
  ],
})
export class AppModule {}
