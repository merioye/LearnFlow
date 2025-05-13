import { ExecutionContext } from '@nestjs/common';

export interface ICacheService {
  /**
   * Connects to the API cache database
   * @returns {Promise<void>}
   */
  connect(): Promise<void>;

  /**
   * Disconnects from the API cache database
   * @returns {Promise<void>}
   */
  disconnect(): Promise<void>;

  /**
   * Stores data in API cache with optional TTL
   * @param {string} key - Cache key to store
   * @param {any} value - Data to cache
   * @param {number} [ttl] - Optional time-to-live in seconds
   * @returns {Promise<void>}
   */
  set(key: string, value: any, ttl?: number): Promise<void>;

  /**
   * Retrieves API cached data by key
   * @template T - Expected return type
   * @param {string} key - Cache key to retrieve
   * @returns {Promise<T | null>} Cached data or null if not found
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Deletes API cache entries matching a pattern
   * @param {string} pattern - glob-style pattern
   * @returns {Promise<void>}
   */
  deleteByPattern(pattern: string): Promise<void>;

  /**
   * Clears entire API cache database
   * @returns {Promise<void>}
   */
  clearAll(): Promise<void>;

  /**
   * Generates a consistent API cache key based on request context
   * @param {ExecutionContext} context - NestJS execution context
   * @param {string} [suffix] - Optional key suffix
   * @returns {Promise<string>} Generated cache key in format: cache:Controller:Handler:ParamsHash:QueryHash:Suffix
   * @example
   * // Returns 'cache:ProductsController:getProduct:abc123:def456:eng'
   * generateCacheKey(context);
   */
  generateCacheKey(context: ExecutionContext, suffix?: string): Promise<string>;
}
