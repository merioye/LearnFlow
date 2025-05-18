import { logger } from '@/config';

import { MetricType } from '../enums';
import { MetricsService } from '../services';

/**
 * Decorator that records metrics for method execution
 * @param metricName Base name for the metrics
 * @param metricType Type of metric to record
 * @param labelsFactory Optional function to generate metric labels
 */
export function RecordMetric(
  metricName: string,
  _metricType: MetricType,
  labelsFactory?: (
    this: unknown,
    ...args: unknown[]
  ) => Record<string, string | number>
) {
  return function (
    _target: object,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value as (
      ...args: unknown[]
    ) => Promise<unknown>;

    descriptor.value = async function (
      this: unknown,
      ...args: unknown[]
    ): Promise<unknown> {
      const metricsService =
        (this as { metricsService?: MetricsService }).metricsService ||
        globalThis.metricsService;
      if (!metricsService) {
        logger.warn(`MetricsService not found for metric ${metricName}`);
        return (await originalMethod.apply(this, args)) as Promise<unknown>;
      }

      const start = Date.now();
      const resolvedLabels = labelsFactory
        ? (labelsFactory.apply(this, args) as Record<string, string | number>)
        : undefined;

      try {
        // Track request count
        metricsService.incrementCounter(
          `${metricName}_calls_total`,
          resolvedLabels
        );

        // Record start of execution
        metricsService.incrementCounter(
          `${metricName}_started_total`,
          resolvedLabels
        );

        // Execute the original method
        const result = (await originalMethod.apply(
          this,
          args
        )) as Promise<unknown>;

        // Record successful completion
        metricsService.incrementCounter(
          `${metricName}_succeeded_total`,
          resolvedLabels
        );

        return result;
      } catch (error) {
        // Record failures
        metricsService.incrementCounter(`${metricName}_failed_total`, {
          ...resolvedLabels,
          error: (error as Error)?.name,
        });
        throw error;
      } finally {
        // Record execution time
        const duration = Date.now() - start;
        metricsService.observeHistogram(
          `${metricName}_duration_seconds`,
          duration / 1000,
          resolvedLabels
        );
      }
    };

    return descriptor;
  };
}
