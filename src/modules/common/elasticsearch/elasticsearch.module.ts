import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { ElasticsearchModule as NestElasticsearchModule } from '@nestjs/elasticsearch';

import { ELASTICSEARCH_MODULE_OPTIONS } from './constants';
import {
  ElasticsearchConfigFactory,
  ElasticsearchServiceFactory,
} from './factories';
import { ElasticsearchHealthService } from './services';
import {
  TElasticsearchModuleAsyncOptions,
  TElasticsearchModuleOptions,
} from './types';

/**
 * Module providing Elasticsearch integration for NestJS applications
 * Supports both synchronous and asynchronous configuration
 *
 * @module ElasticsearchModule
 * @global
 */
@Global()
@Module({})
export class ElasticsearchModule {
  /**
   * Registers the module with static configuration
   *
   * @param options - The Elasticsearch client options
   * @returns A dynamic module configuration
   */
  public static register(options: TElasticsearchModuleOptions): DynamicModule {
    return {
      module: ElasticsearchModule,
      imports: [NestElasticsearchModule.register(options)],
      providers: [
        {
          provide: ELASTICSEARCH_MODULE_OPTIONS,
          useValue: options,
        },
        ElasticsearchConfigFactory,
        ElasticsearchServiceFactory,
        ElasticsearchHealthService,
      ],
      exports: [
        NestElasticsearchModule,
        ElasticsearchConfigFactory,
        ElasticsearchServiceFactory,
        ElasticsearchHealthService,
        ELASTICSEARCH_MODULE_OPTIONS,
      ],
    };
  }

  /**
   * Registers the module with asynchronous configuration
   *
   * @param options - The asynchronous configuration options
   * @returns A dynamic module configuration
   */
  public static registerAsync(
    options: TElasticsearchModuleAsyncOptions
  ): DynamicModule {
    return {
      module: ElasticsearchModule,
      imports: [
        ...(options.imports || []),
        NestElasticsearchModule.registerAsync({
          imports: options.imports,
          useFactory: options.useFactory,
          inject: options.inject,
        }),
      ],
      providers: [
        this._createAsyncOptionsProvider(options),
        ElasticsearchConfigFactory,
        ElasticsearchServiceFactory,
        ElasticsearchHealthService,
      ],
      exports: [
        NestElasticsearchModule,
        ElasticsearchConfigFactory,
        ElasticsearchServiceFactory,
        ElasticsearchHealthService,
        ELASTICSEARCH_MODULE_OPTIONS,
      ],
    };
  }

  /**
   * Creates a provider for async module options
   *
   * @param options - The asynchronous configuration options
   * @returns A provider configuration
   */
  private static _createAsyncOptionsProvider(
    options: TElasticsearchModuleAsyncOptions
  ): Provider {
    return {
      provide: ELASTICSEARCH_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };
  }
}
