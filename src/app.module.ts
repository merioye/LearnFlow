import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
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
import { CorrelationIdMiddleware } from './core/middlewares';
import { DatabaseModule } from './database';
import { Config } from './enums';
import { ApplicationModule } from './modules/app';
import { CsrfGuard } from './modules/app/auth/security/csrf';
import {
  CustomThrottlerGuard,
  ThrottlerRedisService,
} from './modules/app/auth/security/throttler';
import { CommonAppModule } from './modules/common';
import { CACHE_SERVICE, ICacheService } from './modules/common/cache';
import { ILogger, LOGGER } from './modules/common/logger';
import { MetricsInterceptor } from './modules/common/metrics';

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
    ConfigModule.forRoot(configOptions),
    DatabaseModule,
    GracefulShutdownModule.forRootAsync({
      inject: [
        ConfigService,
        LOGGER,
        CACHE_SERVICE,
        DataSource,
        ThrottlerRedisService,
        // ElasticsearchService,
      ],
      useFactory: (
        configService: ConfigService,
        logger: ILogger,
        cacheService: ICacheService,
        dataSource: DataSource,
        throttlerRedisService: ThrottlerRedisService
        // esService: ElasticsearchService
      ) => ({
        gracefulShutdownTimeout: configService.get<number>(
          Config.GRACEFUL_SHUTDOWN_TIMEOUT
        ),
        async cleanup(): Promise<void> {
          logger.info('Closing database connection...');
          await dataSource.destroy();
          logger.info('Database connection closed.');

          // logger.info('Closing elasticsearch connection...');
          // await esService.close();
          // logger.info('Closed elasticsearch connection...');

          logger.info('Closing API Cache connection...');
          await cacheService.disconnect();
          logger.info('API Cache connection closed.');

          logger.info('Closing Throttler Redis connection...');
          await throttlerRedisService.disconnect();
          logger.info('Throttler Redis connection closed.');
        },
      }),
    }),
    CommonAppModule.forRoot({
      logger: loggerModuleOptions,
      cache: cacheModuleOptions,
      cronJob: cronJobModuleOptions,
      enableMetrics: true,
    }),
    ApplicationModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: HttpLoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: MetricsInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe(validationPipeOptions),
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
    ExceptionHandlingStrategyFactory,
  ],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    // Apply correlation ID middleware to all routes
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
