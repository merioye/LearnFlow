import { TThrottlerConfig } from '../types';

export const throttlerConfig: TThrottlerConfig = {
  default: {
    ttl: 60000, // 1 minute
    limit: 100, // 100 requests
  },
  auth: {
    ttl: 900000, // 15 minutes
    limit: 5, // 5 attempts
  },
  api: {
    ttl: 60000, // 1 minute
    limit: 1000, // 1000 requests
  },
  storage: {
    ttl: 3600000, // 1 hour
    limit: 100, // 10 uploads
  },
};

export const THROTTLE_DEFAULT_KEY = 'default';
export const THROTTLE_SKIP_IF_DECORATOR_KEY = 'throttle:skipIf';
export const THROTTLE_MESSAGE_DECORATOR_KEY = 'throttle:message';
export const THROTTLE_SKIP_DECORATOR_KEY = 'throttle:skip';
export const THROTTLE_USE_DECORATOR_KEY = 'throttle:use';
export const THROTTLE_METADATA_KEY = 'throttle:metadata';
