import { Injectable } from '@nestjs/common';
// import { ElasticsearchHealthService } from '@/modules/common/elasticsearch';
import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';

import { DatabaseHealthService } from '@/database';

import { THealth, TPong } from '../types';

/**
 * The service responsible for providing health information about the application.
 *
 * @class HealthService
 */
@Injectable()
export class HealthService {
  public constructor(
    // private readonly _esHealthService: ElasticsearchHealthService,
    private readonly _dbHealthService: DatabaseHealthService,
    @InjectDateTime() private readonly _dateTime: IDateTime
  ) {}
  /**
   * Returns the health information about the application.
   *
   * @returns The health information about the application.
   */
  public async health(): Promise<THealth> {
    return {
      server: {
        message: 'Server is up and running...',
        status: 'OK',
      },
      database: await this._dbHealthService.checkHealth(),
      // elasticSearch: await this._esHealthService.checkHealth(),
    };
  }

  /**
   * Returns the ping information about the application.
   *
   * @returns The ping information about the application.
   */
  public async ping(): Promise<TPong> {
    return {
      database: {
        available: await this._dbHealthService.ping(),
        timestamp: this._dateTime.toUTC(this._dateTime.now()),
      },
      // elasticSearch: {
      //   available: await this._esHealthService.ping(),
      //   timestamp: this._dateTime.toUTC(this._dateTime.now()),
      // },
    };
  }
}
