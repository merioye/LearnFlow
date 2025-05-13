import { Controller, Get, Inject } from '@nestjs/common';
import { ILogger, LOGGER } from '@/modules/common/logger';

import { ENDPOINTS } from '@/constants';

import { HealthService } from './services';
import { THealth, TPong } from './types';

/**
 * The controller responsible for handling the server health check endpoint.
 *
 * @class HealthController
 */
@Controller()
export class HealthController {
  /**
   * Creates a new HealthController instance.
   *
   * @constructor
   * @param logger - The logger to be used to log messages.
   * @param healthService - The health service which is responsible for
   *   providing the health information.
   */
  public constructor(
    @Inject(LOGGER) private readonly _logger: ILogger,
    private readonly _healthService: HealthService
  ) {}

  /**
   * The endpoint which returns the server health information.
   *
   * @returns The health information.
   */
  @Get(ENDPOINTS.Health.Get.HealthCheck)
  public async checkHealth(): Promise<THealth> {
    this._logger.info('Request for checking server health');
    return await this._healthService.health();
  }

  /**
   * The endpoint which returns the ping information about the application.
   *
   * @returns The ping information about the application.
   */
  @Get(ENDPOINTS.Health.Get.Ping)
  public async ping(): Promise<TPong> {
    this._logger.info('Received ping request to the server');
    return await this._healthService.ping();
  }
}
