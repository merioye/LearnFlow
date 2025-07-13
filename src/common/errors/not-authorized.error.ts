import { HttpStatus } from '@nestjs/common';

import { CustomError } from './custom.error';
import { ErrorCode } from './enums';

/**
 * NotAuthorizedError is a custom error class that represents a Not Authorized Exception.
 * It extends the CustomError class. This class is used to create instances
 * of NotAuthorizedError with a specified error message. If no message is provided,
 * the default message 'Not Authorized' will be used.
 *
 * @class NotAuthorizedError
 * @extends CustomError
 *
 * @example
 * const error = new NotAuthorizedError('You are not authorized to access this resource');
 */
export class NotAuthorizedError extends CustomError {
  public constructor(
    message = 'Not Authorized',
    errorCode: ErrorCode = ErrorCode.NOT_AUTHORIZED_ERROR,
    context: Record<string, any> = {}
  ) {
    super(
      'NotAuthorizedError',
      message,
      errorCode,
      HttpStatus.UNAUTHORIZED,
      context
    );
    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }
}
