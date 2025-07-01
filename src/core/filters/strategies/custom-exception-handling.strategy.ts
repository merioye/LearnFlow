import { Injectable } from '@nestjs/common';
import { Request } from 'express';

import { CustomError } from '@/common/errors';

import { TExceptionResponseBody } from '@/types';

import { BaseExceptionHandlingStrategy } from './base-exception-handling.strategy';

/**
 * Handles CustomError instances.
 *
 * @class CustomErrorHandlingStrategy
 * @extends BaseExceptionHandlingStrategy
 */
@Injectable()
export class CustomExceptionHandlingStrategy extends BaseExceptionHandlingStrategy {
  /**
   * @inheritdoc
   */
  public handleException(
    error: CustomError,
    request: Request,
    errorId: string
  ): TExceptionResponseBody {
    return this.getBaseExceptionResponse(
      error,
      request,
      errorId,
      error.getStatus(),
      error.message
    );
  }
}
