import { HttpStatus } from '@nestjs/common';

import { TErrorFormat } from '@/types';

import { ErrorCode } from './enums';

/**
 * RequestValidationError class represents a validation failed exception.
 * It is thrown when the request body validation fails.
 * It extends the built-in Error class and adds additional properties.
 *
 * @class RequestValidationError
 * @extends Error
 *
 * @example
 * const error = new RequestValidationError(errors);
 */
export class RequestValidationError extends Error {
  public readonly name = 'RequestValidationError';
  public readonly errorCode: ErrorCode;
  public readonly context: Record<string, any>;
  public readonly errors: TErrorFormat[];
  /**
   * The HTTP status code of the error.
   */
  private readonly _statusCode = HttpStatus.BAD_REQUEST;

  public constructor(
    errors: TErrorFormat[],
    errorCode: ErrorCode = ErrorCode.REQUEST_VALIDATION_ERROR,
    context: Record<string, any> = {}
  ) {
    super('Validation Failed Error');
    this.errors = errors;
    this.errorCode = errorCode;
    this.context = context;

    // Ensure proper prototype chain
    Object.setPrototypeOf(this, RequestValidationError.prototype);
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * This method returns the value of the `statusCode` property
   *    of the error object.
   *
   * @returns The HTTP status code of the error.
   */
  public getStatus(): number {
    return this._statusCode;
  }
}
