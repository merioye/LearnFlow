import { Global, Module, OnApplicationBootstrap } from '@nestjs/common';
import { DiscoveryModule, DiscoveryService } from '@nestjs/core';

import { METRIC_COLLECTOR } from './constants';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './services';

/**
 * Global module that manages metrics collection and exposure.
 *
 * This module:
 * - Registers the `MetricsService` to handle metric operations.
 * - Discovers all classes decorated as metric collectors across the app
 *   during application bootstrap and registers their metrics.
 * - Provides a controller (`MetricsController`) to expose metrics over HTTP.
 *
 * Implements `OnApplicationBootstrap` lifecycle hook to initialize metric collectors.
 *
 * @module MetricsModule
 * @implements {OnApplicationBootstrap}
 * @global
 */
@Global()
@Module({
  imports: [DiscoveryModule],
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule implements OnApplicationBootstrap {
  public constructor(
    private readonly _metricsService: MetricsService,
    private readonly _discoveryService: DiscoveryService
  ) {}

  /**
   * Lifecycle hook that is called once the application has fully started.
   *
   * Discovers all providers marked as metric collectors using reflection metadata,
   * then calls their `registerMetrics` method to register custom metrics with
   * the `MetricsService`.
   *
   * @returns void
   */
  public onApplicationBootstrap(): void {
    // Discover all metric collectors in the application
    const providers = this._discoveryService.getProviders();
    const metricCollectors = providers.filter(
      (wrapper) =>
        wrapper.metatype &&
        Reflect.getMetadata(METRIC_COLLECTOR, wrapper.metatype)
    );
    // Register all discovered metric collectors
    for (const collector of metricCollectors) {
      const instance = collector.instance as Record<string, any>;
      if (instance && typeof instance.registerMetrics === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        instance.registerMetrics(this._metricsService);
      }
    }
  }
}
