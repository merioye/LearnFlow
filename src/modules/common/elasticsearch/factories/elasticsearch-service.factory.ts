import { Inject, Injectable, Type } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

import { ILogger, LOGGER } from '../../logger';
import { BaseElasticsearchService } from '../services';

/**
 * Factory for creating Elasticsearch service instances
 *
 * @class ElasticsearchServiceFactory
 */
@Injectable()
export class ElasticsearchServiceFactory {
  /**
   * @param _esService - The Elasticsearch service for performing operations
   * @param _logger - Logger service for diagnostic information
   */
  public constructor(
    private readonly _esService: ElasticsearchService,
    @Inject(LOGGER) private readonly _logger: ILogger
  ) {}

  /**
   * Creates a new instance of a service
   *
   * @template T - The type of documents the service will handle
   * @template R - The type of service to create (must extend BaseElasticsearchService)
   * @param serviceType - The class of the service to instantiate
   * @param index - The name of the index this service will operate on
   * @returns A new instance of the specified service type
   */
  public create<T extends object, R extends BaseElasticsearchService<T>>(
    serviceType: Type<R>,
    index: string
  ): R {
    return new serviceType(this._esService, index, this._logger);
  }
}
