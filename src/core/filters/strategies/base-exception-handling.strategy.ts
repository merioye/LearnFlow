import { Injectable } from '@nestjs/common';
import { Request } from 'express';

import { TExceptionResponseBody } from '@/types';

import { IExceptionHandlingStrategy } from '../interfaces';

/**
 * Provides a base implementation for exception handling strategies.
 *
 * @class BaseExceptionHandlingStrategy
 * @implements {IExceptionHandlingStrategy}
 */
@Injectable()
export abstract class BaseExceptionHandlingStrategy
  implements IExceptionHandlingStrategy
{
  /**
   * @inheritdoc
   */
  public abstract handleException(
    error: Error,
    request: Request,
    errorId: string,
    isProduction?: boolean
  ): TExceptionResponseBody;

  /**
   * Generates a base error response.
   *
   * @param error - The error that occurred.
   * @param request - The incoming request.
   * @param errorId - A unique identifier for this error occurrence.
   * @param statusCode - The HTTP status code for the response.
   * @param message - The error message.
   * @returns A base error response body.
   */
  protected getBaseExceptionResponse(
    error: Error,
    request: Request,
    errorId: string,
    statusCode: number,
    message: string
  ): TExceptionResponseBody {
    return {
      statusCode,
      message,
      success: false,
      errorInfo: {
        ref: errorId,
        type: error.constructor.name,
        path: request.path,
        method: request.method,
      },
      errors: [
        {
          message,
          field: '',
          location: 'server',
          stack: null,
        },
      ],
    };
  }
}
