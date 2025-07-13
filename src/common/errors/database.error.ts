import { HttpStatus } from '@nestjs/common';

import { CustomError } from './custom.error';
import { ErrorCode } from './enums';

/**
 * DatabaseError is a custom error class that represents a Database Exception.
 * It extends the CustomError class. This class is used to create instances
 * of DatabaseError with a specified error message. If no message is provided,
 * the default message 'Database Exception' will be used.
 *
 * @class DatabaseError
 * @extends CustomError
 *
 * @example
 * const error = new DatabaseError('Operation failed');
 */
export class DatabaseError extends CustomError {
  public constructor(
    message = 'Database Error',
    errorCode: ErrorCode = ErrorCode.DATABASE_ERROR,
    context: Record<string, any> = {}
  ) {
    super(
      'DatabaseError',
      message,
      errorCode,
      HttpStatus.INTERNAL_SERVER_ERROR,
      context
    );
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}
