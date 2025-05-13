import { Inject, Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { InternalServerError } from '@/common/errors';

import { ILogger, LOGGER } from '../../logger';
import { TElasticSearchHealth } from '../types';

/**
 * Service for monitoring and checking Elasticsearch health
 *
 * @class ElasticsearchHealthService
 */
@Injectable()
export class ElasticsearchHealthService {
  /**
   * @param _esService - The Elasticsearch service for performing health checks
   * @param _logger - Logger service for diagnostic information
   */
  public constructor(
    private readonly _esService: ElasticsearchService,
    @Inject(LOGGER) private readonly _logger: ILogger
  ) {}

  /**
   * Performs a comprehensive health check of the Elasticsearch cluster
   *
   * @returns Detailed information about the cluster health
   * @throws Error if the health check fails
   */
  public async checkHealth(): Promise<TElasticSearchHealth> {
    const context = {
      name: 'ElasticsearchHealthService',
      method: 'checkHealth',
    };
    try {
      // Basic cluster health check
      const health = await this._esService.cluster.health();

      // Collect additional information about the cluster
      const [nodeInfo, indexStats] = await Promise.all([
        this._esService.nodes.info(),
        this._esService.indices.stats(),
      ]);

      return {
        status: health.status,
        clusterName: health.cluster_name,
        numberOfNodes: health.number_of_nodes,
        numberOfDataNodes: health.number_of_data_nodes,
        activeShards: health.active_shards,
        activePrimaryShards: health.active_primary_shards,
        nodeInfo: {
          totalNodes: Object.keys(nodeInfo.nodes).length,
          versions: [
            ...new Set(
              Object.values(nodeInfo.nodes).map((node) => node.version)
            ),
          ],
        },
        indices: {
          // Use optional chaining and nullish coalescing to handle potential undefined values
          count: Object.keys(indexStats.indices || {}).length,
          totalDocs: indexStats._all?.total?.docs?.count || 0,
          totalSize: indexStats._all?.total?.store?.size_in_bytes || 0,
        },
      };
    } catch (error) {
      this._logger.error('Error checking Elasticsearch health:', {
        context,
        error,
      });
      throw new InternalServerError(
        `Elasticsearch health check failed: ${error instanceof Error ? error.message : JSON.stringify(error)}`
      );
    }
  }

  /**
   * Performs a simple connectivity check to the Elasticsearch cluster
   *
   * @returns True if the cluster is reachable, false otherwise
   */
  public async ping(): Promise<boolean> {
    const context = {
      name: 'ElasticsearchHealthService',
      method: 'ping',
    };
    try {
      await this._esService.ping();
      return true;
    } catch (error) {
      this._logger.error('Elasticsearch ping failed:', {
        context,
        error,
      });
      return false;
    }
  }
}
