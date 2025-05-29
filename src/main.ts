import { join } from 'path';
import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { setupGracefulShutdown } from 'nestjs-graceful-shutdown';

import { AppModule } from './app.module';
import { logger, setupDevelopmentApp, setupProductionApp } from './config';
import { ENDPOINTS } from './constants';
import { Config, Environment } from './enums';
import { MetricsService } from './modules/common/metrics';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: logger,
  });

  // Store the MetricsService instance globally for use in decorators
  const metricsService = app.get(MetricsService);
  globalThis.metricsService = metricsService;

  const configService = app.get(ConfigService);
  const PORT = configService.get<number>(Config.PORT);
  const APP_DOMAIN = configService.get<string>(Config.APP_DOMAIN);
  const API_PREFIX = configService.get<string>(Config.API_PREFIX);
  const API_DEFAULT_VERSION = configService.get<string>(
    Config.API_DEFAULT_VERSION
  );
  const isProduction = configService.get(Config.NODE_ENV) === Environment.PROD;

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: API_DEFAULT_VERSION,
  });
  app.setGlobalPrefix(API_PREFIX!);
  app.useStaticAssets(join(__dirname, '..', 'public'));

  if (isProduction) {
    setupProductionApp(app, configService);
  } else {
    setupDevelopmentApp(app, configService);
  }
  setupGracefulShutdown({ app });

  await app.listen(PORT!, () => {
    logger.info(`Application is running on ${APP_DOMAIN}:${PORT}`);
    logger.info(
      `Metrics available at ${APP_DOMAIN}:${PORT}/${API_PREFIX}/v${API_DEFAULT_VERSION}/${ENDPOINTS.Metrics.Base}`
    );
  });
}

bootstrap().catch((err: unknown) => {
  logger.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
