import { TCacheModuleOptions } from '../cache';
import { TCronJobModuleOptions } from '../cron-job';
import { TElasticsearchModuleAsyncOptions } from '../elasticsearch';
import { TLoggerModuleOptions } from '../logger';

/**
 * Type representing the TCommonAppModuleOptions.
 *
 * @typedef TCommonAppModuleOptions
 *
 * @property {TLoggerModuleOptions} logger - The logger module options.
 * @property {TCacheModuleOptions} cache - The cache module options.
 * @property {TCronJobModuleOptions} cronJob - The cron job module options.
 */
type TCommonAppModuleOptions = {
  logger: TLoggerModuleOptions;
  cache?: TCacheModuleOptions;
  cronJob?: TCronJobModuleOptions;
  elasticSearch?: TElasticsearchModuleAsyncOptions;
};

export { TCommonAppModuleOptions };
