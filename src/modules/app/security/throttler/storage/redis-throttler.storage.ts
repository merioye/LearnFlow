// import { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';
// import { CACHE_TTL_DURATION } from '@/modules/common/cache';
// import { ILogger } from '@/modules/common/logger';
// import Redis from 'ioredis';

// import { cacheOptions } from '@/config';
// import { RedisDB } from '@/enums';

// import { IThrottlerStorage } from '../interfaces';

// /**
//  * Redis-based throttler storage for distributed deployments
//  * Allows rate limiting to work properly across multiple application instances
//  *
//  * @class RedisThrottlerStorage
//  * @implements {IThrottlerStorage}
//  */
// export class RedisThrottlerStorage implements IThrottlerStorage {
//   private readonly _client: Redis;

//   public constructor(private readonly _logger: ILogger) {
//     this._client = new Redis({
//       ...cacheOptions,
//       db: RedisDB.REQ_THROTTLE, // Using request throttling db
//     });

//     // Error handling
//     this._client.on('error', (err) =>
//       this._logger.error('Throttler storage Client Error', err)
//     );
//     this._client.on('connect', () =>
//       this._logger.info('Throttler storage Client Connected 🚀')
//     );
//     this._client.on('ready', () =>
//       this._logger.info('Throttler storage Client Ready for commands')
//     );
//     this._client.on('reconnecting', () =>
//       this._logger.warn('Throttler storage Client Reconnecting...')
//     );
//     this._client.on('close', () =>
//       this._logger.warn('Throttler storage Client Connection closed')
//     );
//   }

//   /**
//    * @inheritdoc
//    */
//   public async increment(key: string): Promise<ThrottlerStorageRecord> {
//     try {
//       // Atomically increment the counter and get the new value
//       const value = await this._client.incr(key);

//       // Set expiration on first increment
//       if (value === 1) {
//         await this._client.expire(key, CACHE_TTL_DURATION.VOLATILE);
//       }

//       // Get the TTL for the key
//       const ttl = await this._client.ttl(key);

//       return {
//         totalHits: value,
//         timeToExpire: ttl * 1000, // Convert to milliseconds
//       };
//     } catch (error) {
//       this._logger.error(
//         `Error incrementing throttler storage for key ${key}: `,
//         error
//       );

//       // Fall back to allowing the request if Redis fails
//       return {
//         totalHits: 0,
//         timeToExpire: 0,
//       };
//     }
//   }

//   /**
//    * @inheritdoc
//    */
//   public async getRecord(key: string): Promise<ThrottlerStorageRecord> {
//     try {
//       // Get the current counter value
//       const value = await this._client.get(key);
//       if (!value) {
//         return {
//           totalHits: 0,
//           timeToExpire: 0,
//         };
//       }

//       // Get the TTL for the key
//       const ttl = await this._client.ttl(key);

//       return {
//         totalHits: parseInt(value, 10),
//         timeToExpire: ttl * 1000, // Convert to milliseconds
//       };
//     } catch (error) {
//       this._logger.error(
//         `Error getting throttler storage record for key ${key}: `,
//         error
//       );

//       // Fall back to allowing the request if Redis fails
//       return {
//         totalHits: 0,
//         timeToExpire: 0,
//       };
//     }
//   }

//   /**
//    * @inheritdoc
//    */
//   public async reset(key: string): Promise<void> {
//     try {
//       await this._client.del(key);
//     } catch (error) {
//       this._logger.error(
//         `Error resetting throttler storage record for key ${key}: `,
//         error
//       );
//     }
//   }
// }
