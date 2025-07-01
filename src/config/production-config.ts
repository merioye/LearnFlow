/* eslint-disable quotes */
// Production security configurations for NestJS application

import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { TCustomRequest } from '@/modules/app/auth';

import { Config } from '@/enums';

export function setupProductionApp(
  app: NestExpressApplication,
  configService: ConfigService
): NestExpressApplication {
  // Configure body parser with size limits
  app.use(
    bodyParser.json({
      limit: '2mb',
      verify: (req: TCustomRequest, _res, buf) => {
        // Store raw body for webhook verification if needed
        req.rawBody = buf;
      },
    })
  );
  app.use(
    bodyParser.urlencoded({
      limit: '2mb',
      extended: true,
    })
  );

  // Set up secure cookies
  app.use(cookieParser(configService.get(Config.COOKIE_PARSER_SECRET)));

  // Set up Helmet for security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'same-site' },
      crossOriginOpenerPolicy: { policy: 'same-origin' },
    })
  );

  // Enable compression
  app.use(compression());

  // Enable trust proxy for secure cookies behind reverse proxy
  if (configService.get(Config.BEHIND_PROXY) === true) {
    app.enableCors({
      origin:
        configService.get<string>(Config.ALLOWED_ORIGINS)?.split(',') || false,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      optionsSuccessStatus: 204,
    });

    app.set('trust proxy', 1);
  }

  return app;
}
