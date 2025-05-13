// Development configurations for NestJS application

import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';

import { Config } from '@/enums';

export function setupDevelopmentApp(
  app: NestExpressApplication,
  configService: ConfigService
): NestExpressApplication {
  // Set up secure cookies
  app.use(cookieParser(configService.get(Config.COOKIE_PARSER_SECRET)));

  // Enable CORS for development - typically needed for separate frontend servers
  app.enableCors({
    origin: true, // Allow all origins in development
    credentials: true, // Important for cookies to work cross-origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    optionsSuccessStatus: 204,
  });

  return app;
}
