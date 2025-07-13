import { HttpStatus } from '@nestjs/common';

import { CustomError } from './custom.error';
import { ErrorCode } from './enums';

/**
 * InternalServerError is a custom error class that represents a Server Exception.
 * It extends the CustomError class. This class is used to create instances
 * of InternalServerError with a specified error message. If no message is provided,
 * the default message 'Internal Server Exception' will be used.
 *
 * @class InternalServerError
 * @extends CustomError
 *
 * @example
 * const error = new InternalServerError('Something went wrong');
 */
export class InternalServerError extends CustomError {
  public constructor(
    message = 'Internal Server Error',
    errorCode: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR,
    context: Record<string, any> = {}
  ) {
    super(
      'InternalServerError',
      message,
      errorCode,
      HttpStatus.INTERNAL_SERVER_ERROR,
      context
    );
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}
