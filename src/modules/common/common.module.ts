import { DynamicModule } from '@nestjs/common';

import { CacheModule } from './cache';
import { CronJobModule } from './cron-job';
import { ElasticsearchModule } from './elasticsearch';
import { HelperModule } from './helper';
import { LoggerModule } from './logger';
import { MetricsModule } from './metrics';
import { TCommonAppModuleOptions } from './types';

/**
 * The CommonAppModule is a module that contains all the common features and services
 * that are being used by the application.
 *
 * @module CommonAppModule
 */
export class CommonAppModule {
  /**
   * Configures the CommonAppModule for the application.
   *
   * @static
   * @param options - The options for the CommonAppModule.
   * @returns The DynamicModule for the CommonAppModule.
   */
  public static forRoot({
    logger,
    cache,
    cronJob,
    elasticSearch,
    enableMetrics,
  }: TCommonAppModuleOptions): DynamicModule {
    return {
      module: CommonAppModule,
      imports: [
        HelperModule,
        LoggerModule.forRoot(logger),
        ...(cache ? [CacheModule.register(cache)] : []),
        ...(cronJob ? [CronJobModule.register(cronJob)] : []),
        ...(elasticSearch
          ? [ElasticsearchModule.registerAsync(elasticSearch)]
          : []),
        ...(enableMetrics ? [MetricsModule] : []),
      ],
    };
  }
}
