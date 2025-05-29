// import { Injectable, OnModuleDestroy } from '@nestjs/common';
// import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
// import { ILogger, InjectLogger } from '@/modules/common/logger';
// import Redis from 'ioredis';

// import { cacheOptions } from '@/config';
// import { RedisDB } from '@/enums';

// import { TSocketConnectionData } from '../types';

// /**
//  * RedisService - Handles all Redis operations for WebSocket connections
//  * Provides centralized connection management, namespace/room operations,
//  * and socket state persistence across multiple instances
//  *
//  * @class RedisService
//  * @implements {OnModuleDestroy}
//  */
// @Injectable()
// export class RedisService implements OnModuleDestroy {
//   private _client: Redis;

//   public constructor(
//     @InjectLogger() private readonly _logger: ILogger,
//     @InjectDateTime() private readonly _dateTime: IDateTime
//   ) {
//     this._client = new Redis({
//       ...cacheOptions,
//       db: RedisDB.WEBSOCKET,
//       keyPrefix: 'ws:',
//     });

//     // Set up event handlers
//     this._setupEventHandlers();
//   }

//   /**
//    * Set up Redis event handlers for connection monitoring
//    * @returns {void}
//    */
//   private _setupEventHandlers(): void {
//     this._client.on('connect', () => {
//       this._logger.info('Redis connection established');
//     });

//     this._client.on('ready', () => {
//       this._logger.info('Redis client ready');
//     });

//     this._client.on('error', (error: Error) => {
//       this._logger.error('Redis connection error', { error });
//     });

//     this._client.on('close', () => {
//       this._logger.warn('Redis connection closed');
//     });

//     this._client.on('reconnecting', () => {
//       this._logger.log('Redis client reconnecting...');
//     });
//   }

//   /**
//    * Cleanup on module destroy
//    * @returns {Promise<void>}
//    */
//   public async onModuleDestroy(): Promise<void> {
//     if (this._client) {
//       await this._client.quit();
//       this._logger.info('Redis connection closed');
//     }
//   }

//   /**
//    * Get Redis client instance
//    * @returns Redis client
//    */
//   public getClient(): Redis {
//     return this._client;
//   }

//   /**
//    * Store socket connection information
//    * @param socketId - Socket ID
//    * @param userId - User ID
//    * @param metadata - Additional socket metadata
//    */
//   public async storeSocketConnection(
//     socketId: string,
//     userId: number,
//     metadata: Record<string, any> = {}
//   ): Promise<void> {
//     const key = `connections:${socketId}`;
//     const data: TSocketConnectionData = {
//       userId,
//       connectedAt: this._dateTime.toUTC(this._dateTime.now()),
//       ...metadata,
//     };

//     await this._client.setex(key, 3600, JSON.stringify(data)); // 1 hour TTL

//     // Maintain user -> socket mapping
//     await this._client.sadd(`user:${userId}:sockets`, socketId);

//     this._logger.debug(
//       `Stored socket connection: ${socketId} for user: ${userId}`
//     );
//   }

//   /**
//    * Remove socket connection
//    * @param socketId - Socket ID to remove
//    */
//   public async removeSocketConnection(socketId: string): Promise<void> {
//     const connectionData = await this.getSocketConnection(socketId);

//     if (connectionData) {
//       await this._client.srem(
//         `user:${connectionData.userId}:sockets`,
//         socketId
//       );
//     }

//     await this._client.del(`connections:${socketId}`);
//     this._logger.debug(`Removed socket connection: ${socketId}`);
//   }

//   /**
//    * Get socket connection information
//    * @param socketId - Socket ID
//    * @returns Connection data or null
//    */
//   public async getSocketConnection(
//     socketId: string
//   ): Promise<TSocketConnectionData | null> {
//     const key = `connections:${socketId}`;
//     const data = await this._client.get(key);
//     return data ? (JSON.parse(data) as TSocketConnectionData) : null;
//   }

//   /**
//    * Get all socket IDs for a user
//    * @param userId - User ID
//    * @returns Array of socket IDs
//    */
//   public async getUserSockets(userId: string): Promise<string[]> {
//     return this._client.smembers(`user:${userId}:sockets`);
//   }

//   /**
//    * Add socket to a room
//    * @param socketId - Socket ID
//    * @param room - Room name
//    * @param namespace - Namespace (optional)
//    */
//   public async addToRoom(
//     socketId: string,
//     room: string,
//     namespace = 'default'
//   ): Promise<void> {
//     const key = `rooms:${namespace}:${room}`;
//     await this._client.sadd(key, socketId);
//     await this._client.expire(key, 3600); // 1 hour TTL
//   }

//   /**
//    * Remove socket from a room
//    * @param socketId - Socket ID
//    * @param room - Room name
//    * @param namespace - Namespace (optional)
//    */
//   public async removeFromRoom(
//     socketId: string,
//     room: string,
//     namespace = 'default'
//   ): Promise<void> {
//     const key = `rooms:${namespace}:${room}`;
//     await this._client.srem(key, socketId);
//   }

//   /**
//    * Get all sockets in a room
//    * @param room - Room name
//    * @param namespace - Namespace (optional)
//    * @returns Array of socket IDs
//    */
//   public async getRoomSockets(
//     room: string,
//     namespace = 'default'
//   ): Promise<string[]> {
//     const key = `rooms:${namespace}:${room}`;
//     return this._client.smembers(key);
//   }

//   /**
//    * Store message for delivery guarantee
//    * @param messageId - Unique message ID
//    * @param message - Message data
//    * @param ttl - Time to live in seconds
//    */
//   public async storeMessage<T = any>(
//     messageId: string,
//     message: T,
//     ttl = 3600
//   ): Promise<void> {
//     const key = `messages:${messageId}`;
//     await this._client.setex(key, ttl, JSON.stringify(message));
//   }

//   /**
//    * Get stored message
//    * @param messageId - Message ID
//    * @returns Message data or null
//    */
//   public async getMessage<T = any>(messageId: string): Promise<T | null> {
//     const key = `messages:${messageId}`;
//     const data = await this._client.get(key);
//     return data ? (JSON.parse(data) as T) : null;
//   }

//   /**
//    * Remove stored message
//    * @param messageId - Message ID
//    */
//   async removeMessage(messageId: string): Promise<void> {
//     const key = `messages:${messageId}`;
//     await this._client.del(key);
//   }
// }
