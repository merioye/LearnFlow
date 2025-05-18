import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable, of, tap } from 'rxjs';

import { ILogger, InjectLogger } from '../../logger';
import {
  CACHE_CONFIG,
  CACHE_KEY_SUFFIX_DECORATOR_KEY,
  CACHE_SERVICE,
  CACHE_TTL_DECORATOR_KEY,
  EXCLUDE_FROM_CACHE_DECORATOR_KEY,
} from '../constants';
import { ICacheService } from '../interfaces';
import { TCacheKeySuffixType, TCacheModuleOptions } from '../types';

/**
 * Cache Interceptor for automatic request caching
 * @class CustomCacheInterceptor
 * @implements {NestInterceptor}
 */
@Injectable()
export class CustomCacheInterceptor implements NestInterceptor {
  private readonly _cacheableMethods = ['GET'];

  public constructor(
    @Inject(CACHE_CONFIG) private readonly _cacheConfig: TCacheModuleOptions,
    @Inject(CACHE_SERVICE) private readonly _cacheService: ICacheService,
    @InjectLogger() private readonly _logger: ILogger,
    private readonly _reflector: Reflector
  ) {}

  /**
   * Intercepts requests to implement cache-aside pattern
   * @param {ExecutionContext} context - Request context
   * @param {CallHandler} next - Next handler in pipeline
   * @returns {Observable<any>} Observable of response data
   */
  public async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    if (!this._isCacheableRequest(context)) {
      return next.handle();
    }

    const suffix = this._getCacheSuffix(context);
    const key = await this._cacheService.generateCacheKey(context, suffix);
    const cachedData = await this._cacheService.get(key);

    if (cachedData) {
      this._logger.debug(`API Cache hit for key: ${key}`);
      return of(cachedData);
    } else {
      this._logger.debug(`API Cache miss for key: ${key}`);
    }

    const ttl = this._getTTL(context);
    return next.handle().pipe(
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      tap(async (data) => {
        await this._cacheService.set(key, data, ttl);
      })
    );
  }

  /**
   * Determines if the request should be cached
   * @param {ExecutionContext} context - Request context
   * @private
   * @returns {boolean} True if cacheable, false otherwise
   */
  private _isCacheableRequest(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const handlerExcludeFromCache = this._reflector.get<boolean>(
      EXCLUDE_FROM_CACHE_DECORATOR_KEY,
      context.getHandler()
    );
    const classExcludeFromCache = this._reflector.get<boolean>(
      EXCLUDE_FROM_CACHE_DECORATOR_KEY,
      context.getClass()
    );
    if (handlerExcludeFromCache || classExcludeFromCache) return false;

    return (
      this._cacheableMethods.includes(request.method) &&
      !request.headers['x-no-cache']
    ); // Header-based exclusion
  }

  /**
   * Retrieves cache suffix from metadata
   * @param {ExecutionContext} context - Request context
   * @private
   * @returns {string | undefined} Cache suffix if present else undefined
   */
  private _getCacheSuffix(context: ExecutionContext): string | undefined {
    try {
      const handlerKeySuffix = this._reflector.get<TCacheKeySuffixType>(
        CACHE_KEY_SUFFIX_DECORATOR_KEY,
        context.getHandler()
      );

      const classKeySuffix = this._reflector.get<TCacheKeySuffixType>(
        CACHE_KEY_SUFFIX_DECORATOR_KEY,
        context.getClass()
      );

      const keySuffix = handlerKeySuffix || classKeySuffix;
      return typeof keySuffix === 'string' ? keySuffix : keySuffix?.(context);
    } catch {
      return undefined;
    }
  }

  /**
   * Get TTL from method metadata first, then class metadata else return default provided ttl
   * @param context - Request context
   * @returns TTL (Time-to-live) in seconds
   */
  private _getTTL(context: ExecutionContext): number | undefined {
    return (
      this._reflector.get<number>(
        CACHE_TTL_DECORATOR_KEY,
        context.getHandler()
      ) ||
      this._reflector.get<number>(
        CACHE_TTL_DECORATOR_KEY,
        context.getClass()
      ) ||
      this._cacheConfig.ttl
    );
  }
}
