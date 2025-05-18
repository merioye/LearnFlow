import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { catchError, Observable, tap } from 'rxjs';

import { IDateTime, InjectDateTime } from '../../helper/date-time';
import { MetricsService } from '../services';

/**
 * Interceptor that records HTTP metrics.
 *
 * This interceptor is used to record metrics for HTTP requests,
 * including request counts, response times, and error responses.
 *
 * @class MetricsInterceptor
 * @implements {NestInterceptor}
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  public constructor(
    private readonly _metricsService: MetricsService,
    @InjectDateTime() private readonly _dateTime: IDateTime
  ) {}

  /**
   * Intercepts incoming HTTP requests to record metrics including request counts,
   * response durations, and response status codes.
   *
   * This method:
   * - Normalizes the request path (removing query parameters and replacing numeric IDs with placeholders).
   * - Increments a counter for total HTTP requests.
   * - Measures and records response duration in seconds.
   * - Counts HTTP responses by status code.
   * - Handles errors by recording error responses and durations.
   *
   * @param context Execution context providing details about the current request.
   * @param next The next handler in the request pipeline.
   * @returns An observable of the request handling result.
   */
  public intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, path } = request;
    const startTime = this._dateTime.timestamp;

    // Normalize the path by removing query parameters and variable IDs
    const normalizedPath = this._normalizePath(path);

    // Increment the request counter
    this._metricsService.incrementCounter('http_requests_total', {
      method,
      path: normalizedPath,
    });

    return next.handle().pipe(
      tap(() => {
        const responseTime = this._dateTime.timestamp - startTime;
        const response = context.switchToHttp().getResponse<Response>();
        const statusCode = response.statusCode;

        // Record response time
        this._metricsService.observeHistogram(
          'http_request_duration_seconds',
          responseTime / 1000,
          {
            method,
            path: normalizedPath,
            status: statusCode.toString(),
          }
        );

        // Count responses by status code
        this._metricsService.incrementCounter('http_responses_total', {
          method,
          path: normalizedPath,
          status: statusCode.toString(),
        });
      }),
      catchError((error) => {
        const responseTime = this._dateTime.timestamp - startTime;
        const statusCode =
          (error as { status: number })?.status ||
          HttpStatus.INTERNAL_SERVER_ERROR;

        // Record response time for errors
        this._metricsService.observeHistogram(
          'http_request_duration_seconds',
          responseTime / 1000,
          {
            method,
            path: normalizedPath,
            status: statusCode.toString(),
          }
        );

        // Count error responses
        this._metricsService.incrementCounter('http_responses_total', {
          method,
          path: normalizedPath,
          status: statusCode.toString(),
        });

        throw error;
      })
    );
  }

  /**
   * Normalizes an HTTP request path by:
   * - Removing any query parameters.
   * - Replacing numeric path segments with a placeholder `:id`.
   *
   * This helps aggregate metrics for routes with variable IDs.
   *
   * @param path The original request path.
   * @returns The normalized path string.
   */
  private _normalizePath(path: string): string {
    // Remove query parameters
    const pathWithoutQuery = path.split('?')[0] ?? '';

    // Replace numeric IDs with placeholders
    return pathWithoutQuery.replace(/\/\d+/g, '/:id');
  }
}
