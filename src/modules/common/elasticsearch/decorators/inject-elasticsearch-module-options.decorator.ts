import { Inject } from '@nestjs/common';

import { ELASTICSEARCH_MODULE_OPTIONS } from '../constants';

/**
 * Custom decorator to inject Elasticsearch module options.
 *
 * This is a shorthand for `@Inject(ELASTICSEARCH_MODULE_OPTIONS)` and can be used to
 * inject configuration options related to the Elasticsearch module, such as connection
 * settings, authentication, or other module-level parameters.
 *
 * @returns A property and parameter decorator that injects the Elasticsearch module options.
 */
export const InjectElasticsearchModuleOptions = (): PropertyDecorator &
  ParameterDecorator => Inject(ELASTICSEARCH_MODULE_OPTIONS);
