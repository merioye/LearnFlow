import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ILogger, InjectLogger } from '@/modules/common/logger';
import Redis from 'ioredis';

import { cacheOptions } from '@/config';
import { RedisDB } from '@/enums';

import { WSNamespace } from '../enums';
import { TSocketConnectionData } from '../types';

/**
 * RedisService - Handles all Redis operations for WebSocket connections
 * Provides centralized connection management, namespace/room operations,
 * and socket state persistence across multiple instances
 *
 * @class RedisService
 * @implements {OnModuleDestroy, OnModuleInit}
 */
@Injectable()
export class WSRedisService implements OnModuleDestroy, OnModuleInit {
  private readonly _client: Redis;
  private readonly _CONNECTION_TTL = 86400; // 1 day

  public constructor(@InjectLogger() private readonly _logger: ILogger) {
    this._client = new Redis({
      ...cacheOptions,
      db: RedisDB.WEBSOCKET,
      keyPrefix: 'ws:',
    });

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
   * Cleanup on module destroy
   * @returns {Promise<void>}
   */
  public async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  /**
   * Get Redis client instance
   * @returns Redis client
   */
  public getClient(): Redis {
    return this._client;
  }

  /**
   * Establish Redis connection with retry logic and event handlers
   * @returns {void}
   */
  public async connect(): Promise<void> {
    if (!this._client.status || this._client.status !== 'ready') {
      this._logger.info(
        'Waiting for websocket redis client connection to be ready...'
      );
      await new Promise((resolve) => this._client.once('ready', resolve));
    }
    this._logger.info(
      `Websocket redis client initialized using database ${RedisDB.WEBSOCKET}`
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
        this._logger.info('Websocket redis connection closed gracefully');
      }
    } catch (error) {
      this._logger.error('Error closing websocket redis connection', {
        error,
      });
    }
  }

  /**
   * Store socket connection information
   * @param socketId - Socket ID
   * @param userId - User ID
   * @param metadata - Additional socket metadata
   */
  public async storeSocketConnection(
    socketId: string,
    userId: number,
    metadata: Omit<TSocketConnectionData, 'userId'>
  ): Promise<void> {
    const key = `connections:${socketId}`;
    const data: TSocketConnectionData = {
      userId,
      ...metadata,
    };

    await this._client.setex(key, this._CONNECTION_TTL, JSON.stringify(data));

    // Maintain user -> socket mapping
    await this._client.sadd(`user:${userId}:sockets`, socketId);

    this._logger.debug(
      `Stored socket connection: ${socketId} for user: ${userId}`
    );
  }

  /**
   * Remove socket connection
   * @param socketId - Socket ID to remove
   */
  public async removeSocketConnection(socketId: string): Promise<void> {
    const connectionData = await this.getSocketConnection(socketId);

    if (connectionData) {
      await this._client.srem(
        `user:${connectionData.userId}:sockets`,
        socketId
      );
    }

    await this._client.del(`connections:${socketId}`);
    this._logger.debug(`Removed socket connection: ${socketId}`);
  }

  /**
   * Get socket connection information
   * @param socketId - Socket ID
   * @returns Connection data or null
   */
  public async getSocketConnection(
    socketId: string
  ): Promise<TSocketConnectionData | null> {
    const key = `connections:${socketId}`;
    const data = await this._client.get(key);
    return data ? (JSON.parse(data) as TSocketConnectionData) : null;
  }

  /**
   * Get all socket IDs for a user
   * @param userId - User ID
   * @returns Array of socket IDs
   */
  public async getUserSockets(userId: number): Promise<string[]> {
    return this._client.smembers(`user:${userId}:sockets`);
  }

  /**
   * Add socket to a room
   * @param socketId - Socket ID
   * @param room - Room name
   * @param namespace - Namespace (optional)
   */
  public async addToRoom(
    socketId: string,
    room: string,
    namespace = WSNamespace.DEFAULT
  ): Promise<void> {
    const key = `rooms:${namespace}:${room}`;
    await this._client.sadd(key, socketId);
    await this._client.expire(key, this._CONNECTION_TTL);
  }

  /**
   * Remove socket from a room
   * @param socketId - Socket ID
   * @param room - Room name
   * @param namespace - Namespace (optional)
   */
  public async removeFromRoom(
    socketId: string,
    room: string,
    namespace = WSNamespace.DEFAULT
  ): Promise<void> {
    const key = `rooms:${namespace}:${room}`;
    await this._client.srem(key, socketId);
  }

  /**
   * Get all sockets in a room
   * @param room - Room name
   * @param namespace - Namespace (optional)
   * @returns Array of socket IDs
   */
  public async getRoomSockets(
    room: string,
    namespace = WSNamespace.DEFAULT
  ): Promise<string[]> {
    const key = `rooms:${namespace}:${room}`;
    return this._client.smembers(key);
  }

  /**
   * Store message for delivery guarantee
   * @param messageId - Unique message ID
   * @param message - Message data
   * @param ttl - Time to live in seconds
   */
  public async storeMessage<T = any>(
    messageId: string,
    message: T,
    ttl = this._CONNECTION_TTL
  ): Promise<void> {
    const key = `messages:${messageId}`;
    await this._client.setex(key, ttl, JSON.stringify(message));
  }

  /**
   * Get stored message
   * @param messageId - Message ID
   * @returns Message data or null
   */
  public async getMessage<T = any>(messageId: string): Promise<T | null> {
    const key = `messages:${messageId}`;
    const data = await this._client.get(key);
    return data ? (JSON.parse(data) as T) : null;
  }

  /**
   * Remove stored message
   * @param messageId - Message ID
   */
  public async removeMessage(messageId: string): Promise<void> {
    const key = `messages:${messageId}`;
    await this._client.del(key);
  }

  /**
   * Set up Redis event handlers for connection monitoring
   * @returns {void}
   */
  private _setupEventHandlers(): void {
    this._client.on('connect', () => {
      this._logger.info('Redis connection established');
    });

    this._client.on('ready', () => {
      this._logger.info('Redis client ready');
    });

    this._client.on('error', (error: Error) => {
      this._logger.error('Redis connection error', { error });
    });

    this._client.on('close', () => {
      this._logger.warn('Redis connection closed');
    });

    this._client.on('reconnecting', () => {
      this._logger.log('Redis client reconnecting...');
    });
  }
}
