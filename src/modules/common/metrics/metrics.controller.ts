import { Controller, Get, Header } from '@nestjs/common';
import { Public } from '@/modules/app/auth/decorators/public.decorator';

import { ENDPOINTS } from '@/constants';

import { ILogger, InjectLogger } from '../logger';
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
  public constructor(
    private readonly _metricsService: MetricsService,
    @InjectLogger() private readonly _logger: ILogger
  ) {}

  /**
   * Handles GET requests to fetch metrics as a plain text string.
   *
   * This endpoint returns metrics in a format consumable by monitoring tools,
   * such as Prometheus, with the `Content-Type` header set to `text/plain`.
   *
   * @returns A promise resolving to the metrics data as a plain text string.
   */
  @Get()
  @Public()
  @Header('Content-Type', 'text/plain')
  async getMetrics(): Promise<string> {
    this._logger.info('Request to fetch application metrics...');
    return await this._metricsService.getMetricsAsString();
  }
}
