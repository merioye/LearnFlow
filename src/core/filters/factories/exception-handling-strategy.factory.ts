import { Injectable } from '@nestjs/common';
import { CustomError, RequestValidationError } from '@/common/errors';

import { IExceptionHandlingStrategy } from '../interfaces';
import {
  CustomExceptionHandlingStrategy,
  DefaultExceptionHandlingStrategy,
  RequestValidationExceptionHandlingStrategy,
} from '../strategies';

/**
 * Factory for creating appropriate error handling strategies.
 *
 * @class ExceptionHandlingStrategyFactory
 */
@Injectable()
export class ExceptionHandlingStrategyFactory {
  /**
   * Creates an appropriate exception handling strategy based on the type of exception.
   *
   * @param error - The error that occurred.
   * @returns An appropriate error handling strategy.
   */
  public createStrategy(error: Error): IExceptionHandlingStrategy {
    if (error instanceof CustomError) {
      return new CustomExceptionHandlingStrategy();
    }
    if (error instanceof RequestValidationError) {
      return new RequestValidationExceptionHandlingStrategy();
    }
    return new DefaultExceptionHandlingStrategy();
  }
}
