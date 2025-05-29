import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ThrottlerGuard,
  ThrottlerRequest,
  ThrottlerStorage,
} from '@nestjs/throttler';
import { ILogger, InjectLogger } from '@/modules/common/logger';

import { TCustomRequest } from '../../../types';
import {
  THROTTLE_DEFAULT_KEY,
  THROTTLE_METADATA_KEY,
  THROTTLE_SKIP_DECORATOR_KEY,
  throttlerConfig,
} from '../constants';
import { TThrottleOptions, TThrottlerConfig } from '../types';

/**
 * Custom throttler guard with enhanced key generation and IP extraction
 * Supports different rate limits for different endpoint types
 * Automatically applies appropriate throttling based on route patterns
 *
 * @class CustomThrottlerGuard
 * @extends ThrottlerGuard
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  public constructor(
    @InjectLogger() private readonly _logger: ILogger,
    protected readonly throttlerStorage: ThrottlerStorage,
    protected readonly reflector: Reflector
  ) {
    const throttlers = Object.keys(throttlerConfig).map((key) => ({
      name: key,
      ...throttlerConfig[key as keyof TThrottlerConfig],
    }));
    super(
      {
        throttlers,
      },
      throttlerStorage,
      reflector
    );
  }

  /**
   * Determine if throttling should be skipped for this request
   * @param context - Execution context
   * @returns {Promise<boolean>} Whether to skip throttling
   */
  protected skipIfHandler(context: ExecutionContext): boolean {
    // Check for @CustomSkipThrottle decorator
    const skipThrottle = this.reflector.getAllAndOverride<
      boolean | ((req: any) => boolean)
    >(THROTTLE_SKIP_DECORATOR_KEY, [context.getHandler(), context.getClass()]);

    if (typeof skipThrottle === 'function') {
      const request = context.switchToHttp().getRequest<TCustomRequest>();
      return skipThrottle(request);
    }

    if (skipThrottle === true) {
      return true;
    }

    // Check for custom throttle decorator skipIf
    const customThrottleOptions =
      this.reflector.getAllAndOverride<TThrottleOptions>(
        THROTTLE_METADATA_KEY,
        [context.getHandler(), context.getClass()]
      );

    if (customThrottleOptions?.skipIf) {
      const request = context.switchToHttp().getRequest<TCustomRequest>();
      if (typeof customThrottleOptions.skipIf === 'function') {
        return customThrottleOptions.skipIf(request);
      }
      return customThrottleOptions.skipIf === true;
    }

    // Auto-skip for health check and monitoring endpoints
    const request = context.switchToHttp().getRequest<TCustomRequest>();
    const path = request.path;

    const skipPatterns = [
      /^\/health$/i,
      /^\/ping$/i,
      /^\/status$/i,
      /^\/metrics$/i,
      /^\/ready$/i,
      /^\/live$/i,
    ];

    return skipPatterns.some((pattern) => pattern.test(path));
  }

  /**
   * Handle rate limit exceeded scenario
   * @param throttlerRequest - Throttler request details
   */
  protected async handleRequest(
    requestProps: ThrottlerRequest
  ): Promise<boolean> {
    try {
      const canProceed = await super.handleRequest(requestProps);

      if (!canProceed) {
        const context = requestProps.context;
        const request = context.switchToHttp().getRequest<TCustomRequest>();
        const ip = this._getClientIP(request);
        const route = this._getRoute(context);

        this._logger.warn(
          `Rate limit exceeded - IP: ${ip}, Route: ${route}, Limit: ${requestProps.limit}/${requestProps.ttl}ms`
        );
      }

      return canProceed;
    } catch (error) {
      this._logger.error('Error in throttler guard', { error });
      // Fail open - allow request if throttling fails
      return true;
    }
  }

  /**
   * Generate throttling key based on request context
   * @param context - Execution context
   * @param throttlerName - Name of the throttler
   * @returns Promise<string> Throttling key
   */
  protected generateKey(
    context: ExecutionContext,
    throttlerName: string
  ): string {
    const request = context.switchToHttp().getRequest<TCustomRequest>();
    const ip = this._getClientIP(request);
    const userId = this._getUserId(request);
    const route = this._getRoute(context);

    // Create composite key for better granularity
    const keyParts = [ip, userId, route, throttlerName].filter(Boolean);
    const key = keyParts.join(':');

    this._logger.debug(`Generated throttle key: ${key}`);
    return key;
  }

  /**
   * Get throttler options, auto-determining the appropriate throttler
   * @param context - Execution context
   * @returns Throttler configuration
   */
  protected getThrottlers(context: ExecutionContext): any {
    const request = context.switchToHttp().getRequest<TCustomRequest>();
    const throttlerName = this._determineThrottlerName(context, request);

    const config = throttlerConfig[throttlerName] || throttlerConfig.default;

    this._logger.debug(
      `Using throttler: ${throttlerName} (${config.limit}/${config.ttl}ms) for path: ${request.path}`
    );

    return [
      {
        ttl: config.ttl,
        limit: config.limit,
      },
    ];
  }

  /**
   * Auto-determine throttler name based on route pattern
   * @param context - Execution context
   * @param request - Express request object
   * @returns {keyof TThrottlerConfig} Throttler name
   */
  private _determineThrottlerName(
    context: ExecutionContext,
    request: TCustomRequest
  ): keyof TThrottlerConfig {
    // Check for explicit @CustomThrottle decorator
    const explicitThrottle = this.reflector.getAllAndOverride<TThrottlerConfig>(
      THROTTLE_METADATA_KEY,
      [context.getHandler(), context.getClass()]
    );
    const path = request.path;

    // If we have custom throttle, use it
    if (explicitThrottle) {
      const throttlerName =
        Object.keys(explicitThrottle)[0] || THROTTLE_DEFAULT_KEY;
      this._logger.debug(
        `Using explicit throttler: ${throttlerName} for path: ${request.path}`
      );
      return throttlerName as keyof TThrottlerConfig;
    }

    // Auto-determine based on route patterns
    const throttlerName = Object.keys(throttlerConfig).find((key) => {
      return path.includes(key);
    });
    if (throttlerName) {
      this._logger.debug(
        `Using auto-determined throttler: ${throttlerName} for path: ${request.path}`
      );
      return throttlerName as keyof TThrottlerConfig;
    }

    // Default for everything else
    this._logger.debug(
      `Using default throttler: ${THROTTLE_DEFAULT_KEY} for path: ${request.path}`
    );
    return THROTTLE_DEFAULT_KEY;
  }

  /**
   * Extract client IP address from request
   * Handles various proxy scenarios
   * @param request - Express request object
   * @returns string Client IP address
   */
  private _getClientIP(request: TCustomRequest): string {
    const forwarded = request.headers['x-forwarded-for'] as string;
    const realIP = request.headers['x-real-ip'] as string;
    const cfConnectingIP = request.headers['cf-connecting-ip'] as string;

    if (cfConnectingIP) return cfConnectingIP;
    if (realIP) return realIP;
    if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';

    return request.socket.remoteAddress || 'unknown';
  }

  /**
   * Extract user ID from request (if authenticated)
   * @param request - Express request object
   * @returns string|null User ID or null
   */
  private _getUserId(request: TCustomRequest): number {
    const user = request.user;
    return user.userId;
  }

  /**
   * Get route pattern from execution context
   * @param context - Execution context
   * @returns string Route pattern
   */
  private _getRoute(context: ExecutionContext): string {
    const handler = context.getHandler();
    const controller = context.getClass();
    return `${controller.name}.${handler.name}`;
  }
}
