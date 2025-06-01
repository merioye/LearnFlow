import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Config } from '@/enums';

import { dataSourceOptions } from './config';
import { DatabaseHealthService, DistributedLockService } from './services';

/**
 * The `DatabaseModule` is a global module that provides and exports the `DatabaseHealthService`.
 * This module is decorated with `@Global`, making it available throughout the application
 * without needing to import it in each module.
 *
 * @module DatabaseModule
 * @global
 * @provider {DatabaseHealthService} Provides the DatabaseHealthService for database health checks.
 * @export {DatabaseHealthService} Exports the DatabaseHealthService to be used in other modules.
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          ...dataSourceOptions,
          keepConnectionAlive: true, // Keeps connections open for faster subsequent requests
          // Reconnection mechanism
          retryAttempts: configService.get<number>(Config.DATABASE_MAX_RETRIES),
          retryDelay: configService.get<number>(Config.DATABASE_RETRY_DELAY),
        };
      },
    }),
  ],
  providers: [DatabaseHealthService, DistributedLockService],
  exports: [DatabaseHealthService, DistributedLockService],
})
export class DatabaseModule {}
