import { METRIC_COLLECTOR } from '../constants';

/**
 * Class decorator to mark a class as a metric collector.
 *
 * Applying this decorator sets metadata on the class indicating
 * that it is a metric collector, which can be discovered and registered
 * automatically by the `MetricsModule` during application bootstrap.
 *
 * @returns A class decorator that marks the target class with metric collector metadata.
 */
export function MetricCollector(): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(METRIC_COLLECTOR, true, target);
    return target;
  };
}
