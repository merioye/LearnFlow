import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { RequestValidationError } from '@/common/errors';

import { TExceptionResponseBody } from '@/types';

import { BaseExceptionHandlingStrategy } from './base-exception-handling.strategy';

/**
 * Handles RequestValidationError instances.
 *
 * @class RequestValidationExceptionHandlingStrategy
 * @extends BaseExceptionHandlingStrategy
 */
@Injectable()
export class RequestValidationExceptionHandlingStrategy extends BaseExceptionHandlingStrategy {
  /**
   * @inheritdoc
   */
  public handleException(
    error: RequestValidationError,
    request: Request,
    errorId: string
  ): TExceptionResponseBody {
    const response = this.getBaseExceptionResponse(
      error,
      request,
      errorId,
      error.getStatus(),
      error.message
    );
    response.errors = error.errors.map((error) => {
      return {
        ...error,
        message: error.message,
      };
    });
    return response;
  }
}
