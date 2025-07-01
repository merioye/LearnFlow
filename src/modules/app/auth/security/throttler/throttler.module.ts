import { Global, Module } from '@nestjs/common';
import { ThrottlerModule as NestThrottlerModule } from '@nestjs/throttler';

import { ILogger, LOGGER } from '@/modules/common/logger';

import { throttlerConfig } from './constants';
import { ThrottlerRedisService } from './services';
import { RedisThrottlerStorage } from './storage';
import { TThrottlerConfig } from './types';

/**
 * Global throttler module providing Redis-based rate limiting
 *
 * @module CustomThrottlerModule
 */
@Global()
@Module({
  imports: [
    NestThrottlerModule.forRootAsync({
      inject: [LOGGER, ThrottlerRedisService],
      useFactory: (logger: ILogger, redisService: ThrottlerRedisService) => {
        return {
          throttlers: Object.keys(throttlerConfig).map((key) => ({
            name: key,
            ...throttlerConfig[key as keyof TThrottlerConfig],
          })),
          storage: new RedisThrottlerStorage(logger, redisService),
          ignoreUserAgents: [
            /health-check/i,
            /health/i,
            /monitoring/i,
            /metrics/i,
          ],
        };
      },
    }),
  ],
  providers: [ThrottlerRedisService],
  exports: [ThrottlerRedisService, NestThrottlerModule],
})
export class CustomThrottlerModule {}
