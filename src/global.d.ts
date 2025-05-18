import { MetricsService } from './modules/common/metrics';

declare global {
  // eslint-disable-next-line no-var
  var metricsService: MetricsService;
  // If you also want to type globalThis, optionally add:
  interface GlobalThis {
    metricsService: MetricsService;
  }
}
