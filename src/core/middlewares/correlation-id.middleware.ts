import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';

import { TCustomRequest } from '@/modules/app/auth';
import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
import { LoggerContextNamespace } from '@/modules/common/logger';

import { CORRELATION_ID } from '@/constants';

/**
 * Middleware to set correlation ID for all requests
 * This ensures correlation ID is available even outside of HTTP context
 *
 * @class CorrelationIdMiddleware
 * @implements {NestMiddleware}
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  public constructor(@InjectDateTime() private readonly _dateTime: IDateTime) {}

  public use(req: TCustomRequest, res: Response, next: NextFunction): void {
    // Use existing correlation ID from header or generate a new one
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      this._generateCorrelationId();

    // Set correlation ID in the request
    req[CORRELATION_ID] = correlationId;

    // Set correlation ID in response header
    res.setHeader('x-correlation-id', correlationId);

    // Run the rest of the request in the context of the correlation ID
    LoggerContextNamespace.run(() => {
      LoggerContextNamespace.set(CORRELATION_ID, correlationId);
      next();
    });
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
