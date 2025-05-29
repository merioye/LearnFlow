import {
  ExecutionContext,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Request } from 'express';
import Redis from 'ioredis';

import { cacheOptions } from '@/config';
import { RedisDB } from '@/enums';

import { HashAlgorithm, IHashService, InjectHashService } from '../../hash';
import { ILogger, InjectLogger } from '../../logger';
import { ICacheService } from '../interfaces';

/**
 * Service handling Redis cache operations
 * @class RedisCacheService
 * @implements {ICacheService, OnModuleInit}
 */
@Injectable()
export class RedisCacheService
  implements ICacheService, OnModuleInit, OnModuleDestroy
{
  private readonly _client: Redis;

  public constructor(
    @InjectHashService() private readonly _hashService: IHashService,
    @InjectLogger() private readonly _logger: ILogger
  ) {
    this._client = new Redis({
      ...cacheOptions,
      db: RedisDB.API_CACHE, // Using api cache db
      // keyPrefix: 'api_cache:',
    });

    // Set up event handlers
    this._setupEventHandlers();
  }

  /**
   * Connect to Redis when module initializes
   * @returns {Promise<void>}
   */
  public async onModuleInit(): Promise<void> {
    await this.connect();
  }

  /**
   * Disconnect from Redis when module is destroyed
   * @returns {Promise<void>}
   */
  public async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  /**
   * @inheritdoc
   */
  public async connect(): Promise<void> {
    if (!this._client.status || this._client.status !== 'ready') {
      this._logger.info(
        'Waiting for API Cache client connection to be ready...'
      );
      await new Promise((resolve) => this._client.once('ready', resolve));
    }
    this._logger.info(
      `API Cache client initialized using database ${RedisDB.API_CACHE}`
    );
  }

  /**
   * @inheritdoc
   */
  public async disconnect(): Promise<void> {
    try {
      await this._client.quit();
    } catch (error) {
      this._logger.error('Failed to disconnect from API Cache:', {
        error,
      });
      throw error;
    }
  }

  /**
   * @inheritdoc
   */
  public async get<T>(key: string): Promise<T | null> {
    const data = await this._client.get(key);
    return data ? (JSON.parse(data) as T) : null;
  }

  /**
   * @inheritdoc
   */
  public async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this._client.set(key, serialized, 'EX', ttl);
    } else {
      await this._client.set(key, serialized);
    }
  }

  /**
   * @inheritdoc
   */
  public async deleteByPattern(pattern: string): Promise<void> {
    // Use scan command for production to avoid blocking with large datasets
    let cursor = '0';
    let keys: string[] = [];

    do {
      // Scan through keys in batches
      const result = await this._client.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100
      );
      cursor = result[0];

      const batchKeys = result[1];
      if (batchKeys.length > 0) {
        keys = [...keys, ...batchKeys];
      }
    } while (cursor !== '0');

    // Delete keys in batches if there are any
    if (keys.length) {
      // Delete in batches of 100 to avoid large single commands
      const batches = [];
      for (let i = 0; i < keys.length; i += 100) {
        const batch = keys.slice(i, i + 100);
        batches.push(this._client.del(...batch));
      }

      await Promise.all(batches);
    }
  }

  /**
  }

  /**
   * @inheritdoc
   */
  public async clearAll(): Promise<void> {
    await this._client.flushdb();
    this._logger.info('API Cache database cleared');
  }

  /**
   * @inheritdoc
   */
  public async generateCacheKey(
    context: ExecutionContext,
    suffix?: string
  ): Promise<string> {
    const request = context.switchToHttp().getRequest<Request>();
    const controller = context.getClass().name;
    const handler = context.getHandler().name;
    const paramsHash = await this._hashService.hash(
      JSON.stringify(request.params),
      {
        algorithm: HashAlgorithm.MD5,
      }
    );
    const queryHash = await this._hashService.hash(
      JSON.stringify(request.query),
      {
        algorithm: HashAlgorithm.MD5,
      }
    );

    return `cache:${controller}:${handler}:${paramsHash}:${queryHash}${suffix ? `:${suffix}` : ''}`;
  }

  /**
   * Set up Redis event handlers for connection monitoring
   * @returns {void}
   */
  private _setupEventHandlers(): void {
    this._client.on('error', (error: Error) =>
      this._logger.error('API Cache Client Error', { error })
    );
    this._client.on('connect', () =>
      this._logger.info('API Cache Client Connected 🚀')
    );
    this._client.on('ready', () =>
      this._logger.info('API Cache Client Ready for commands')
    );
    this._client.on('reconnecting', () =>
      this._logger.warn('API Cache Client Reconnecting...')
    );
    this._client.on('close', () =>
      this._logger.warn('API Cache Client Connection closed')
    );
  }
}
