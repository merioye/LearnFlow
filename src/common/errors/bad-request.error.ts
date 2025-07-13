import { HttpStatus } from '@nestjs/common';

import { CustomError } from './custom.error';
import { ErrorCode } from './enums';

/**
 * BadRequestError is a custom error class that represents a Bad Request Exception.
 * It extends the CustomError class. This class is used to create instances
 * of BadRequestError with a specified error message. If no message is provided,
 * the default message 'Bad Request Exception' will be used.
 *
 * @class BadRequestError
 * @extends CustomError
 *
 * @example
 * const error = new BadRequestError('Invalid input data');
 */
export class BadRequestError extends CustomError {
  public constructor(
    message = 'Bad Request Error',
    errorCode: ErrorCode = ErrorCode.BAD_REQUEST_ERROR,
    context: Record<string, any> = {}
  ) {
    super(
      'BadRequestError',
      message,
      errorCode,
      HttpStatus.BAD_REQUEST,
      context
    );
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}
