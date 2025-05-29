import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ILogger, InjectLogger } from '@/modules/common/logger';
import Redis from 'ioredis';

import { cacheOptions } from '@/config';
import { RedisDB } from '@/enums';

/**
 * Redis service providing connection management and health checking
 * Implements proper connection handling for cluster mode applications
 *
 * @class ThrottlerRedisService
 * @implements {OnModuleInit, OnModuleDestroy}
 */
@Injectable()
export class ThrottlerRedisService implements OnModuleInit, OnModuleDestroy {
  private readonly _client: Redis;
  private _isConnected = false;

  public constructor(@InjectLogger() private readonly _logger: ILogger) {
    const options = {
      ...cacheOptions,
      db: RedisDB.REQ_THROTTLE,
      keyPrefix: 'rate_limit:',
    };

    this._client = new Redis(options);

    // Set up event handlers
    this._setupEventHandlers();
  }

  /**
   * Initialize Redis connection on module startup
   * @returns {Promise<void>}
   */
  public async onModuleInit(): Promise<void> {
    await this.connect();
  }

  /**
   * Clean up Redis connection on module shutdown
   * @returns {Promise<void>}
   */
  public async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  /**
   * Get Redis client instance
   * @returns Redis client
   * @throws Error if client is not connected
   */
  public getClient(): Redis {
    if (!this._isConnected || !this._client) {
      throw new Error('Throttler redis client not connected');
    }
    return this._client;
  }

  /**
   * Check if Redis is connected and healthy
   * @returns Promise<boolean> Connection status
   */
  public async isHealthy(): Promise<boolean> {
    try {
      if (!this._client || !this._isConnected) {
        return false;
      }

      const result = await this._client.ping();
      return result === 'PONG';
    } catch (error) {
      this._logger.error('Throttler redis client health check failed', {
        error,
      });
      return false;
    }
  }

  /**
   * Establish Redis connection with retry logic and event handlers
   * @returns {void}
   */
  public async connect(): Promise<void> {
    if (!this._client.status || this._client.status !== 'ready') {
      this._logger.info(
        'Waiting for throttler redis client connection to be ready...'
      );
      await new Promise((resolve) => this._client.once('ready', resolve));
    }
    this._logger.info(
      `Throttler redis client initialized using database ${RedisDB.REQ_THROTTLE}`
    );
  }

  /**
   * Gracefully disconnect from Redis
   * @returns {Promise<void>}
   */
  public async disconnect(): Promise<void> {
    try {
      if (this._client) {
        await this._client.quit();
        this._isConnected = false;
        this._logger.log('Throttler redis client connection closed gracefully');
      }
    } catch (error) {
      this._logger.error('Error closing throttler redis client connection', {
        error,
      });
    }
  }

  /**
   * Set up Redis event handlers for connection monitoring
   * @returns {void}
   */
  private _setupEventHandlers(): void {
    this._client.on('connect', () => {
      this._isConnected = true;
      this._logger.info('Throttler redis client connected');
    });

    this._client.on('ready', () => {
      this._logger.info('Throttler redis client ready for commands');
    });

    this._client.on('error', (error: Error) => {
      this._isConnected = false;
      this._logger.error('Throttler redis client error', { error });
    });

    this._client.on('close', () => {
      this._isConnected = false;
      this._logger.warn('Throttler redis client connection closed');
    });

    this._client.on('reconnecting', () => {
      this._logger.log('Throttler redis client reconnecting...');
    });
  }
}
