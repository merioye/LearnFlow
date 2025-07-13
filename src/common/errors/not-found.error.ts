import { HttpStatus } from '@nestjs/common';

import { CustomError } from './custom.error';
import { ErrorCode } from './enums';

/**
 * NotFoundError class represents a Not Found Exception.
 * It extends the CustomError class. This class is used to create instances
 * of NotFoundError with a specified error message. If no message is provided,
 * the default message 'Not Found' will be used.
 *
 * @class NotFoundError
 * @extends CustomError
 *
 * @example
 * const error = new NotFoundError('Resource not found');
 */
export class NotFoundError extends CustomError {
  public constructor(
    message = 'Not Found',
    errorCode: ErrorCode = ErrorCode.NOT_FOUND_ERROR,
    context: Record<string, any> = {}
  ) {
    super('NotFoundError', message, errorCode, HttpStatus.NOT_FOUND, context);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
