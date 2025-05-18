import { Inject } from '@nestjs/common';

import { ELASTICSEARCH_INDEX_CONFIG } from '../constants';

/**
 * Custom decorator to inject the Elasticsearch index configuration.
 *
 * This is a shorthand for `@Inject(ELASTICSEARCH_INDEX_CONFIG)` and can be used
 * to inject index-related settings such as index names, mappings, or lifecycle policies
 * into services or modules that interact with Elasticsearch.
 *
 * @returns A property and parameter decorator that injects the Elasticsearch index configuration.
 */
export const InjectElasticsearchIndexConfig = (): PropertyDecorator &
  ParameterDecorator => Inject(ELASTICSEARCH_INDEX_CONFIG);
