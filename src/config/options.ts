import { join, resolve } from 'path';
import { ValidationPipeOptions } from '@nestjs/common';
import { ConfigModuleOptions, ConfigService } from '@nestjs/config';
import { RequestValidationError } from '@/common/errors';
import { TCacheModuleOptions } from '@/modules/common/cache';
import { TCronJobModuleOptions } from '@/modules/common/cron-job';
import { TElasticsearchModuleAsyncOptions } from '@/modules/common/elasticsearch';
import { TLoggerModuleOptions, WinstonLogger } from '@/modules/common/logger';
import * as dotenv from 'dotenv';
import { RedisOptions } from 'ioredis';
import Joi from 'joi';

import { TErrorFormat } from '@/types';
import { Config, Environment } from '@/enums';
import { APP_NAME } from '@/constants';

dotenv.config({
  path: join(__dirname, `../../.env.${process.env[Config.NODE_ENV]}`),
});

const { DEV, TEST, PROD } = Environment;

/**
 * LoggerModule options
 */
export const loggerModuleOptions: TLoggerModuleOptions = {
  environment: process.env[Config.NODE_ENV] as Environment,
  logsDirPath: resolve(process.cwd(), 'logs'),
  debugMode: process.env[Config.DEBUG_MODE] == 'true',
  appName: APP_NAME,
  loki: {
    host: process.env[Config.LOKI_URL]!,
    basicAuth:
      process.env[Config.LOKI_USERNAME] +
      ':' +
      process.env[Config.LOKI_PASSWORD],
    // Production-optimized settings
    batching: true,
    interval: process.env[Config.NODE_ENV] === Environment.PROD ? 5 : 1,
    gracefulShutdown: true,
    clearOnError: false,
    timeout: 30000,
  },
};
export const logger = WinstonLogger.getInstance(loggerModuleOptions);

/**
 * ConfigModule options
 */
export const configOptions: ConfigModuleOptions = {
  isGlobal: true,
  envFilePath: join(__dirname, `../../.env.${process.env[Config.NODE_ENV]}`),
  validationSchema: Joi.object({
    PORT: Joi.number().required(),
    APP_DOMAIN: Joi.string().required(),
    NODE_ENV: Joi.string().valid(DEV, TEST, PROD).required(),
    API_PREFIX: Joi.string().required(),
    API_DEFAULT_VERSION: Joi.string().required(),
    DEBUG_MODE: Joi.boolean().required(),
    GRACEFUL_SHUTDOWN_TIMEOUT: Joi.number().required(),
    ADMIN_USER_EMAIL: Joi.string().email().required(),
    ADMIN_USER_PASSWORD: Joi.string().required(),
    SYSTEM_USER_EMAIL: Joi.string().email().required(),
    SYSTEM_USER_PASSWORD: Joi.string().required(),
    DATABASE_NAME: Joi.string().required(),
    DATABASE_URL: Joi.string().required(),
    DATABASE_SSL: Joi.boolean().required(),
    DATABASE_SSL_REJECT_UNAUTHORIZED: Joi.boolean().required(),
    DATABASE_POOL_MAX_SIZE: Joi.number().required(),
    DATABASE_POOL_MIN_SIZE: Joi.number().required(),
    DATABASE_IDLE_TIMEOUT: Joi.number().required(),
    DATABASE_CONNECTION_TIMEOUT: Joi.number().required(),
    DATABASE_MAX_RETRIES: Joi.number().required(),
    DATABASE_RETRY_DELAY: Joi.number().required(),
    DATABASE_MAX_RETRY_DELAY: Joi.number().required(),
    CACHE_HOST: Joi.string().required(),
    CACHE_PORT: Joi.number().required(),
    CACHE_PASSWORD: Joi.string().required(),
    ELASTICSEARCH_NODE: Joi.string().uri().required(),
    ELASTICSEARCH_USERNAME: Joi.string().required(),
    ELASTICSEARCH_PASSWORD: Joi.string().required(),
    ELASTICSEARCH_SSL_VERIFY: Joi.string().required(),
    AWS_ACCESS_KEY_ID: Joi.string().required(),
    AWS_SECRET_ACCESS_KEY: Joi.string().required(),
    AWS_S3_REGION: Joi.string().required(),
    AWS_S3_ENDPOINT: Joi.string().uri().required(),
    AWS_S3_BUCKET_NAME: Joi.string().required(),
    UPLOAD_FILE_URL_EXPIRATION: Joi.number().required(),
    FILE_TABLE_LOCK_TTL: Joi.number().required(),
    UNUSED_FILE_RETENTION_DAYS: Joi.number().required(),
    CSRF_SECRET: Joi.string().required(),
    CSRF_EXPIRATION_TIME: Joi.number().required(),
    CSRF_COOKIE_NAME: Joi.string().required(),
    COOKIE_PARSER_SECRET: Joi.string().required(),
    JWT_ACCESS_SECRET: Joi.string().required(),
    JWT_ACCESS_EXPIRATION_TIME: Joi.number().required(),
    JWT_REFRESH_SECRET: Joi.string().required(),
    JWT_REFRESH_EXPIRATION_TIME: Joi.number().required(),
    JWT_ISSUER: Joi.string().required(),
    JWT_AUDIENCE: Joi.string().required(),
    ALLOWED_ORIGINS: Joi.string().required(),
    BEHIND_PROXY: Joi.boolean().required(),
    THROTTLE_TTL: Joi.number().required(),
    THROTTLE_LIMIT: Joi.number().required(),
    LOKI_URL: Joi.string().uri().required(),
    LOKI_USERNAME: Joi.string().required(),
    LOKI_PASSWORD: Joi.string().required(),
    PROMETHEUS_URL: Joi.string().uri().required(),
    PROMETHEUS_USERNAME: Joi.string().required(),
    PROMETHEUS_PASSWORD: Joi.string().required(),
  }),
  validationOptions: {
    abortEarly: true,
  },
};

/**
 * ValidationPipe options
 */
export const validationPipeOptions: ValidationPipeOptions = {
  whitelist: true,
  transform: true,
  validateCustomDecorators: true,
  forbidNonWhitelisted: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
  exceptionFactory: (errors) => {
    const formatedErrors = errors?.map((error): TErrorFormat => {
      const message = Object.values(error.constraints || {})[0];
      return {
        message: message || 'Invalid value',
        field: error.property,
        location: 'body',
        stack: null,
      };
    });
    throw new RequestValidationError(formatedErrors);
  },
};

/**
 * CacheModule options
 */
export const cacheModuleOptions: TCacheModuleOptions = {};

/**
 * CronJobModule options
 */
export const cronJobModuleOptions: TCronJobModuleOptions = {
  jobs: [],
};

export const cacheOptions: RedisOptions = {
  host: process.env[Config.CACHE_HOST],
  port: Number(process.env[Config.CACHE_PORT]),
  password: process.env[Config.CACHE_PASSWORD]!,

  // Connection configuration
  connectTimeout: 10000, // 10 seconds
  maxRetriesPerRequest: 3,
  family: 4,
  retryStrategy: (times) => {
    const delay = Math.min(times * 200, 3000); // Exponential backoff with 3s max
    logger.debug(
      `Retrying Cache client connection in ${delay}ms (attempt ${times})`
    );
    return delay;
  },
  // Command execution timeout
  commandTimeout: 5000, // 5 seconds

  // Production tuning
  enableReadyCheck: true,
  autoResubscribe: true,
  autoResendUnfulfilledCommands: true,

  // Connection pool (for clustering if needed)
  // Only needed if you use Redis Cluster
  // maxRetriesPerRequest: 5,
  // enableOfflineQueue: true
} as const;

export const elasticSearchModuleOptions: TElasticsearchModuleAsyncOptions = {
  useFactory: (configService: ConfigService) => ({
    node: configService.get<string>(Config.ELASTICSEARCH_NODE),
    auth: {
      username: configService.get<string>(Config.ELASTICSEARCH_USERNAME)!,
      password: configService.get<string>(Config.ELASTICSEARCH_PASSWORD)!,
    },
    maxRetries: 10,
    requestTimeout: 60000,
    pingTimeout: 3000,
    sniffOnStart: true,
    ssl: {
      rejectUnauthorized: configService.get<boolean>(
        Config.ELASTICSEARCH_SSL_VERIFY
      ),
    },
  }),
  inject: [ConfigService],
};
