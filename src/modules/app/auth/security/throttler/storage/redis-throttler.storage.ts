import { Injectable } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';

import { ILogger } from '@/modules/common/logger';

import { ThrottlerRedisService } from '../services';

/**
 * Redis-based throttler storage implementation
 * Provides distributed rate limiting across multiple application instances
 *
 * @class RedisThrottlerStorage
 * @implements {IThrottlerStorage}
 */
@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
  private readonly _THROTTLE_PREFIX = 'throttle';
  private readonly _BLOCK_PREFIX = 'block';

  public constructor(
    private readonly _logger: ILogger,
    private readonly _redisService: ThrottlerRedisService
  ) {}

  /**
   * Increment request count for a given key
   * @param key - Throttling key (usually combination of IP, route, user)
   * @param ttl - Time to live in milliseconds
   * @param limit - Request limit
   * @param blockDuration - Block duration in milliseconds
   * @param throttlerName - Name of the throttler
   * @returns Promise with current count and remaining TTL
   */
  public async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string
  ): Promise<ThrottlerStorageRecord> {
    try {
      const client = this._redisService.getClient();
      const throttleKey = `${this._THROTTLE_PREFIX}:${throttlerName}:${key}`;
      const blockKey = `${this._BLOCK_PREFIX}:${throttlerName}:${key}`;

      // Check if key is currently blocked
      const isBlocked = await client.exists(blockKey);
      if (isBlocked) {
        const blockTtl = await client.ttl(blockKey);
        this._logger.debug(
          `Request blocked for key: ${key}, TTL: ${blockTtl}s`
        );
        return {
          totalHits: limit + 1,
          timeToExpire: blockTtl * 1000,
          isBlocked: true,
          timeToBlockExpire: blockDuration,
        };
      }

      // Use Lua script for atomic increment and TTL check
      const luaScript = `
        local current = redis.call('INCR', KEYS[1])
        local ttl = redis.call('PTTL', KEYS[1])

        if current == 1 or ttl == -1 then
          redis.call('PEXPIRE', KEYS[1], ARGV[1])
          ttl = ARGV[1]
        end

        if current > tonumber(ARGV[2]) then
          redis.call('SETEX', KEYS[2], ARGV[3], '1')
          return {current, ttl, 1}
        end

        return {current, ttl, 0}
      `;

      const result = (await client.eval(
        luaScript,
        2,
        throttleKey,
        blockKey,
        ttl.toString(),
        limit.toString(),
        Math.ceil(blockDuration / 1000).toString()
      )) as [number, number, number];

      const [totalHits, timeToExpire, blocked] = result;

      if (blocked && totalHits > limit) {
        this._logger.warn(
          `Rate limit exceeded for key: ${key}, throttler: ${throttlerName}, hits: ${totalHits}/${limit}`
        );
      } else {
        this._logger.debug(
          `Request counted for key: ${key}, throttler: ${throttlerName}, hits: ${totalHits}/${limit}`
        );
      }

      return {
        totalHits,
        timeToExpire: Math.max(timeToExpire, 0),
        isBlocked: blocked === 1,
        timeToBlockExpire: blockDuration,
      };
    } catch (error) {
      this._logger.error(
        `Failed to increment throttle for key: ${key}, throttler: ${throttlerName}`,
        { error }
      );

      // Fail open - allow request if Redis is unavailable
      return {
        totalHits: 0,
        timeToExpire: 0,
        isBlocked: false,
        timeToBlockExpire: 0,
      };
    }
  }

  /**
   * Get current request count for a key
   * @param key - Throttling key
   * @param throttlerName - Name of the throttler
   * @returns Current request count
   */
  public async get(key: string, throttlerName: string): Promise<number> {
    try {
      const client = this._redisService.getClient();
      const throttleKey = `${this._THROTTLE_PREFIX}:${throttlerName}:${key}`;
      const count = await client.get(throttleKey);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      this._logger.error(
        `Failed to get throttle count for key: ${key}, throttler: ${throttlerName}`,
        { error }
      );
      return 0;
    }
  }

  /**
   * Reset request count for a key
   * @param key - Throttling key
   * @param throttlerName - Name of the throttler
   * @returns Promise<void>
   */
  public async reset(key: string, throttlerName: string): Promise<void> {
    try {
      const client = this._redisService.getClient();
      const throttleKey = `${this._THROTTLE_PREFIX}:${throttlerName}:${key}`;
      const blockKey = `${this._BLOCK_PREFIX}:${throttlerName}:${key}`;

      await Promise.all([client.del(throttleKey), client.del(blockKey)]);

      this._logger.debug(
        `Reset throttle for key: ${key}, throttler: ${throttlerName}`
      );
    } catch (error) {
      this._logger.error(
        `Failed to reset throttle for key: ${key}, throttler: ${throttlerName}`,
        { error }
      );
    }
  }
}
