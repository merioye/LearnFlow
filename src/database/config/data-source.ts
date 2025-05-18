import { join } from 'path';
// import { CACHE_TTL_DURATION } from '@/modules/common/cache';
import * as dotenv from 'dotenv';
// import Redis from 'ioredis';
import { DataSource, DataSourceOptions } from 'typeorm';

// import { cacheOptions, logger } from '@/config';
import { Config } from '@/enums';

dotenv.config({
  path: join(__dirname, `../../../.env.${process.env[Config.NODE_ENV]}`),
});

// const cacheClient = new Redis({
//   ...cacheOptions,
//   db: RedisDB.ORM_CACHE, // Using orm cache db
// });

// cacheClient.on('error', (err) =>
//   logger.error('Database Cache Client Error', { error: err })
// );
// cacheClient.on('connect', () =>
//   logger.info('Database Cache Client Connected 🚀')
// );
// cacheClient.on('ready', () =>
//   logger.info('Database Cache Client Ready for commands')
// );
// cacheClient.on('reconnecting', () =>
//   logger.warn('Database Cache Client Reconnecting...')
// );
// cacheClient.on('close', () =>
//   logger.warn('Database Cache Client Connection closed')
// );

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env[Config.DATABASE_URL],
  database: process.env[Config.DATABASE_NAME],
  synchronize: false,
  logging: false,
  migrationsRun: false,
  migrationsTableName: 'tbl_migrations',
  entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*.{ts,.js}'],
  subscribers: [],
  // cache: {
  //   type: 'ioredis',
  //   tableName: 'tbl_query_cache_results',
  //   duration: CACHE_TTL_DURATION.VOLATILE,
  //   options: cacheClient,
  // },

  // Production-level connection management
  ssl:
    process.env[Config.DATABASE_SSL] == 'true'
      ? {
          rejectUnauthorized:
            process.env[Config.DATABASE_SSL_REJECT_UNAUTHORIZED] != 'false',
        }
      : false,
  // Connection pooling
  extra: {
    // Maximum number of clients the pool should contain
    max: parseInt(process.env[Config.DATABASE_POOL_MAX_SIZE]!, 10),
    // Minimum number of idle clients to keep in the pool
    min: parseInt(process.env[Config.DATABASE_POOL_MIN_SIZE]!, 10),
    // Maximum time (in milliseconds) that a client can stay idle before being removed
    idleTimeoutMillis: parseInt(process.env[Config.DATABASE_IDLE_TIMEOUT]!, 10),
    // Maximum time (in milliseconds) to wait for a client to become available
    connectionTimeoutMillis: parseInt(
      process.env[Config.DATABASE_CONNECTION_TIMEOUT]!,
      10
    ),
  },
};

export const AppDataSource = new DataSource(dataSourceOptions);
