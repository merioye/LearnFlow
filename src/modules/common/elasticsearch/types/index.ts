import { ModuleMetadata } from '@nestjs/common';
import { ClientOptions } from '@elastic/elasticsearch';
import {
  AggregationsAggregate,
  AggregationsAggregationContainer,
  BulkOperationType,
  BulkResponseItem,
  HealthStatus,
  IndicesAlias,
  IndicesIndexSettings,
  MappingTypeMapping,
  QueryDslQueryContainer,
  SearchHighlight,
  Sort,
} from '@elastic/elasticsearch/lib/api/types';

/**
 * Configuration options for the Elasticsearch module
 * Extends the Elasticsearch client options from @elastic/elasticsearch
 */
export type TElasticsearchModuleOptions = ClientOptions;

/**
 * Asynchronous configuration options for the Elasticsearch module
 * Allows for dynamic configuration and dependency injection
 */
export type TElasticsearchModuleAsyncOptions = Pick<
  ModuleMetadata,
  'imports'
> & {
  /**
   * Factory function that returns the module options
   * @param args - Arguments injected by the 'inject' array
   * @returns Module options or Promise of module options
   */
  useFactory: (
    ...args: any
  ) => Promise<TElasticsearchModuleOptions> | TElasticsearchModuleOptions;

  /**
   * Optional array of providers to be injected into the factory function
   */
  inject?: any[];
};

/**
 * Configuration for an Elasticsearch index
 * Defines the structure and behavior of the index
 */
export type TElasticsearchIndexConfig = {
  /**
   * Name of the index
   */
  index: string;

  /**
   * Field mappings for the index
   * Defines how documents and their fields are stored and indexed
   */
  mappings: MappingTypeMapping;

  /**
   * Optional index settings
   * Controls index behavior like number of shards, replicas, analyzers, etc.
   */
  settings?: IndicesIndexSettings;

  /**
   * Optional index aliases
   * Provides alternative names for the index
   */
  aliases?: Record<string, IndicesAlias>;
};

/**
 * Type for queryable fields in search parameters
 */
export type TElasticsearchQuery = {
  [key: string]: unknown;
};

/**
 * Type for sort options in search parameters
 */
export type TElasticsearchSort =
  | Record<string, unknown>
  | Array<Record<string, unknown>>;

/**
 * Type for highlight options in search parameters
 */
export type TElasticsearchHighlightOptions = {
  fields?: Record<string, unknown>;
  pre_tags?: string[];
  post_tags?: string[];
  fragment_size?: number;
  number_of_fragments?: number;
  [key: string]: unknown;
};

/**
 * Parameters for Elasticsearch search operations
 * Provides a strongly-typed interface for search functionality
 */
export type TElasticsearchSearchParams = {
  /**
   * The search query in Elasticsearch DSL format
   */
  // query?: TElasticsearchQuery;
  query?: QueryDslQueryContainer;

  /**
   * Starting offset for pagination (zero-based)
   */
  from?: number;

  /**
   * Maximum number of results to return
   */
  size?: number;

  /**
   * Sort criteria for the results
   */
  // sort?: TElasticsearchSort;
  sort?: Sort;

  /**
   * Field selection for the returned documents
   * Can be an array of field names or a boolean
   */
  _source?: string[] | boolean;

  /**
   * Aggregations to perform on the search results
   */
  // aggs?: Record<string, unknown>;
  aggs?: Record<string, AggregationsAggregationContainer>;

  /**
   * Highlighting configuration for matched terms
   */
  // highlight?: TElasticsearchHighlightOptions;
  highlight?: SearchHighlight;
};

/**
 * Generic type for search result hits
 */
export type TElasticsearchSearchHit<T> = {
  /**
   * The source document
   */
  _source: T;

  /**
   * The document ID
   */
  _id: string;

  /**
   * The relevance score
   */
  _score: number;

  /**
   * Optional highlight results
   */
  highlight?: Record<string, string[]>;
};

/**
 * Generic type for search results
 */
export type TElasticsearchSearchResult<T> = {
  /**
   * Array of matched documents
   */
  hits: Array<TElasticsearchSearchHit<T>>;

  /**
   * Total number of matching documents
   */
  total: number;

  /**
   * Optional aggregation results
   */
  aggregations?: Record<string, AggregationsAggregate>;
};

/**
 * Type for bulk indexing results
 */
export type TBulkIndexResult = {
  /**
   * Whether the operation was successful
   */
  success: boolean;

  /**
   * Number of successfully processed documents
   */
  count: number;

  /**
   * Optional array of operation results
   */
  items?: Partial<Record<BulkOperationType, BulkResponseItem>>[];

  /**
   * Time taken to process the bulk operation in milliseconds
   */
  took?: number;
};

/**
 * Detailed health information about the Elasticsearch cluster
 */
export type TElasticSearchHealth = {
  /**
   * Overall health status of the cluster
   */
  status: HealthStatus;

  /**
   * Name of the Elasticsearch cluster
   */
  clusterName: string;

  /**
   * Total number of nodes in the cluster
   */
  numberOfNodes: number;

  /**
   * Number of data nodes in the cluster
   */
  numberOfDataNodes: number;

  /**
   * Number of active shards
   */
  activeShards: number;

  /**
   * Number of active primary shards
   */
  activePrimaryShards: number;

  /**
   * Information about the nodes in the cluster
   */
  nodeInfo: {
    /**
     * Total number of nodes
     */
    totalNodes: number;

    /**
     * Array of distinct Elasticsearch versions running in the cluster
     */
    versions: string[];
  };

  /**
   * Information about the indices in the cluster
   */
  indices: {
    /**
     * Total number of indices
     */
    count: number;

    /**
     * Total number of documents across all indices
     */
    totalDocs: number;

    /**
     * Total storage size of all indices in bytes
     */
    totalSize: number;
  };
};
