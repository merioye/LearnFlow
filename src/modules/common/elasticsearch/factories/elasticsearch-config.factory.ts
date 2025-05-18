import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { IndicesIndexSettings } from '@elastic/elasticsearch/lib/api/types';

import { ILogger, InjectLogger } from '../../logger';
import { TElasticsearchIndexConfig } from '../types';

/**
 * Factory service for managing Elasticsearch indices
 * Provides methods for creating, updating, and deleting indices
 *
 * @class ElasticsearchConfigFactory
 */
@Injectable()
export class ElasticsearchConfigFactory {
  /**
   * @param _esService - The Elasticsearch service for performing operations
   * @param _logger - Logger service for diagnostic information
   */
  public constructor(
    private readonly _esService: ElasticsearchService,
    @InjectLogger() private readonly _logger: ILogger
  ) {}

  /**
   * Creates an Elasticsearch index if it doesn't exist
   *
   * @param config - The configuration for the index including mappings and settings
   * @returns A promise that resolves when the index is created or confirmed to exist
   * @throws Error if the index creation fails
   */
  public async createIndex(config: TElasticsearchIndexConfig): Promise<void> {
    const { index, mappings, settings, aliases } = config;

    try {
      // Check if index exists
      const indexExists = await this._esService.indices.exists({
        index,
      });

      if (!indexExists) {
        // Create index with provided configuration
        await this._esService.indices.create({
          index,
          mappings,
          ...(aliases && { aliases }),
          settings: settings || {
            number_of_shards: 1,
            number_of_replicas: 1,
            'index.mapping.total_fields.limit': 2000,
            'index.max_result_window': 50000,
          },
          // body: {
          //   mappings,
          //   settings: settings || {
          //     number_of_shards: 1,
          //     number_of_replicas: 1,
          //     'index.mapping.total_fields.limit': 2000,
          //     'index.max_result_window': 50000,
          //   },
          //   ...(aliases && { aliases }),
          // },
        });

        this._logger.info(`Index ${index} created successfully`);
      } else {
        this._logger.info(`Index ${index} already exists`);

        // Optionally update mappings if index exists
        // Uncomment if you want to update existing mappings, but be cautious in production
        await this._esService.indices.putMapping({
          index,
          body: mappings as Record<string, unknown>,
        });
        this._logger.info(`Index ${index} mappings updated`);
      }
    } catch (error) {
      this._logger.error(`Error creating/checking index ${index}:`, {
        error,
      });
      throw error;
    }
  }

  /**
   * Updates the mappings of an existing index
   *
   * @param index - The name of the index to update
   * @param mappings - The new mappings to apply
   * @returns A promise that resolves when the mappings are updated
   * @throws Error if the mapping update fails
   */
  public async updateMappings(
    index: string,
    mappings: Record<string, unknown>
  ): Promise<void> {
    try {
      await this._esService.indices.putMapping({
        index,
        body: mappings,
      });
      this._logger.info(`Index ${index} mappings updated successfully`);
    } catch (error) {
      this._logger.error(`Error updating mappings for index ${index}:`, {
        error,
      });
      throw error;
    }
  }

  /**
   * Updates the settings of an existing index
   *
   * @param index - The name of the index to update
   * @param settings - The new settings to apply
   * @returns A promise that resolves when the settings are updated
   * @throws Error if the settings update fails
   */
  public async updateSettings(
    index: string,
    settings: IndicesIndexSettings
  ): Promise<void> {
    try {
      await this._esService.indices.putSettings({
        index,
        settings,
        // body: settings,
      });
      this._logger.info(`Index ${index} settings updated successfully`);
    } catch (error) {
      this._logger.error(`Error updating settings for index ${index}:`, {
        error,
      });
      throw error;
    }
  }

  /**
   * Deletes an Elasticsearch index
   *
   * @param index - The name of the index to delete
   * @returns A promise that resolves when the index is deleted
   * @throws Error if the deletion fails
   */
  public async deleteIndex(index: string): Promise<void> {
    try {
      await this._esService.indices.delete({ index });
      this._logger.info(`Index ${index} deleted successfully`);
    } catch (error) {
      this._logger.error(`Error deleting index ${index}:`, {
        error,
      });
      throw error;
    }
  }
}
