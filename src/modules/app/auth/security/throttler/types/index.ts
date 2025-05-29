export type TThrottlerConfigOptions = {
  ttl: number;
  limit: number;
};

export type TThrottlerConfig = {
  /**
   * Rate limiting configuration for overall application endpoints
   */
  api: TThrottlerConfigOptions;
  /**
   * Rate limiting configuration for endpoints which does not have explicitly defined configuration
   */
  default: TThrottlerConfigOptions;
  /**
   * Explicit Rate limiting configuration for auth endpoints
   */
  auth: TThrottlerConfigOptions;
  /**
   * Explicit Rate limiting configuration for upload endpoints
   */
  storage: TThrottlerConfigOptions;
};

/**
 * Options for the custom throttle decorator
 */
export type TThrottleOptions = {
  /**
   * Name of the throttler
   */
  name?: string;
  /**
   * Custom ttl for endpoint
   */
  ttl?: number;
  /**
   * Custom limit for endpoint
   */
  limit?: number;
  /**
   * Conditional function to determine whether to skip the throttling check for this request or not
   */
  skipIf?: (request: any) => boolean;
  /**
   * Custom error message
   */
  message?: string;
};
