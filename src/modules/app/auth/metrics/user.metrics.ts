import { Injectable } from '@nestjs/common';

import {
  MetricCollector,
  MetricsService,
  MetricType,
} from '@/modules/common/metrics';

/**
 * Collects and exposes metrics related to the Users module.
 *
 * This class is responsible for registering and updating Prometheus metrics
 * such as the number of active users and total user registrations.
 * It is decorated with `@MetricCollector` so that metrics are automatically
 * registered when the application starts.
 *
 * The metrics tracked here help provide observability into user activity and
 * registration trends, which can be used for monitoring, alerting, and analytics.
 *
 * @class UsersMetrics
 */
@Injectable()
@MetricCollector()
export class UsersMetrics {
  /**
   * Registers custom metrics for the users module.
   * This method is automatically called when the application starts.
   *
   * @param metricsService - The metrics service used to register metrics.
   * @returns {void}
   */
  public registerMetrics(metricsService: MetricsService): void {
    // Create specific metrics for the users module
    metricsService.getOrCreateMetric({
      name: 'users_active_total',
      type: MetricType.GAUGE,
      help: 'Number of active users',
    });

    metricsService.getOrCreateMetric({
      name: 'users_registration_total',
      type: MetricType.COUNTER,
      help: 'Total number of user registrations',
      labelNames: ['status'],
    });
  }

  /**
   * Updates the `users_active_total` gauge with the current number of active users.
   *
   * @param count - The current number of active users.
   * @returns {void}
   */
  public trackActiveUsers(count: number): void {
    const metricsService = globalThis.metricsService;
    if (metricsService) {
      metricsService.setGauge('users_active_total', count);
    }
  }

  /**
   * Increments the `users_registration_total` counter with the given registration status.
   *
   * @param status - The registration outcome ('success' or 'failure').
   * @returns {void}
   */
  public trackRegistration(status: 'success' | 'failure'): void {
    const metricsService = globalThis.metricsService;
    if (metricsService) {
      metricsService.incrementCounter('users_registration_total', { status });
    }
  }
}
