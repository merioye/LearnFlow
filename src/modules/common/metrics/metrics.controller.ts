import { Controller, Get, Header } from '@nestjs/common';

import { ENDPOINTS } from '@/constants';

import { MetricsService } from './services';

/**
 * Controller responsible for handling metrics-related HTTP requests.
 *
 * Provides endpoints to expose application metrics, typically for monitoring
 * tools such as Prometheus.
 *
 * @class MetricsController
 */
@Controller(ENDPOINTS.Metrics.Base)
export class MetricsController {
  public constructor(private readonly _metricsService: MetricsService) {}

  /**
   * Handles GET requests to fetch metrics as a plain text string.
   *
   * This endpoint returns metrics in a format consumable by monitoring tools,
   * such as Prometheus, with the `Content-Type` header set to `text/plain`.
   *
   * @returns A promise resolving to the metrics data as a plain text string.
   */
  @Get()
  @Header('Content-Type', 'text/plain')
  async getMetrics(): Promise<string> {
    return await this._metricsService.getMetricsAsString();
  }
}
