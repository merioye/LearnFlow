import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { TCustomRequest } from '@/modules/app/auth';
import { DATE_TIME, IDateTime } from '@/modules/common/helper/date-time';
import { ILogger, LOGGER } from '@/modules/common/logger';
import { Observable, tap } from 'rxjs';

/**
 * Interceptor for logging HTTP requests and responses
 *
 * @class HttpLoggingInterceptor
 * @implements {NestInterceptor}
 */
@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  public constructor(
    @Inject(LOGGER) private readonly _logger: ILogger,
    @Inject(DATE_TIME) private readonly _dateTime: IDateTime
  ) {}

  /**
   * Intercepts HTTP requests and responses for logging
   *
   * @param {ExecutionContext} context - The execution context
   * @param {CallHandler} next - The next handler in the chain
   * @returns {Observable<any>} - Observable of the response
   */
  public intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<any> {
    const req = context.switchToHttp().getRequest<TCustomRequest>();
    const { method, url, ip } = req;
    const userAgent = req.headers['user-agent'] || '';
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      this._generateCorrelationId();
    const loggerContext = {
      name: 'HttpLoggingInterceptor',
      method: 'intercept',
    };

    req.correlationId = correlationId;

    const startTime = this._dateTime.timestamp;
    this._logger.info(
      `[${correlationId}] ${method} ${url} - IP: ${ip} - UserAgent: ${userAgent}`,
      {
        context: loggerContext,
      }
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const endTime = this._dateTime.timestamp;
          this._logger.info(
            `[${correlationId}] ${method} ${url} - ${endTime - startTime}ms - Success`,
            { context: loggerContext }
          );
        },
        error: (error: Error) => {
          const endTime = this._dateTime.timestamp;
          this._logger.error(
            `[${correlationId}] ${method} ${url} - ${endTime - startTime}ms - Error: ${error?.message}`,
            { context: loggerContext, stack: error?.stack }
          );
        },
      })
    );
  }

  /**
   * Generates a correlation ID
   *
   * @returns {string} - Generated correlation ID
   */
  private _generateCorrelationId(): string {
    return (
      this._dateTime.timestamp.toString(36) +
      Math.random().toString(36).substring(2)
    );
  }
}
