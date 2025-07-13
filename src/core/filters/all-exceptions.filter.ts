import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { RequestValidationError } from '@/common/errors';
import { ILogger, InjectLogger } from '@/modules/common/logger';

import { TLoggerErrorMetadata } from '@/types';
import { Config, Environment } from '@/enums';

import { ExceptionHandlingStrategyFactory } from './factories';

/**
 * Global exception filter that catches all unhandled exceptions in the application.
 *
 * @class AllExceptionsFilter
 * @implements {ExceptionFilter}
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  /**
   * @constructor
   * @param logger - Service for logging errors.
   * @param httpAdapterHost - Provides access to the underlying HTTP server.
   * @param configService - Provides access to application configuration.
   * @param exceptionHandlingStrategyFactory - Factory for creating exception handling strategies.
   */
  public constructor(
    @InjectLogger() private readonly _logger: ILogger,
    private readonly _httpAdapterHost: HttpAdapterHost,
    private readonly _configService: ConfigService,
    private readonly _exceptionHandlingStrategyFactory: ExceptionHandlingStrategyFactory
  ) {}

  /**
   * Catches and handles all unhandled exceptions in the application.
   *
   * @param exception - The unhandled exception.
   * @param host - Provides methods for accessing the underlying platform-specific request/response objects.
   */
  public catch(exception: Error, host: ArgumentsHost): void {
    const { httpAdapter } = this._httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const errorId = uuidv4();
    const isProduction =
      this._configService.get<Environment>(Config.NODE_ENV) ===
      Environment.PROD;

    const strategy =
      this._exceptionHandlingStrategyFactory.createStrategy(exception);
    const responseBody = strategy.handleException(
      exception,
      request,
      errorId,
      isProduction
    );

    const metadata: TLoggerErrorMetadata = {
      id: errorId,
      stack: exception?.stack || null,
      statusCode: responseBody.statusCode,
      path: request.path,
      method: request.method,
      errorCode: responseBody.errorInfo.errorCode,
      context: responseBody.errorInfo.context,
    };

    if (exception instanceof RequestValidationError) {
      metadata.errors = exception?.errors.map((error) => ({
        ...error,
        message: error.message,
      }));
    }

    const message = exception.message;
    this._logger.error(message, { meta: metadata });

    httpAdapter.reply(ctx.getResponse(), responseBody, responseBody.statusCode);
  }
}
