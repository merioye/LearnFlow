import { HttpStatus } from '@nestjs/common';

import { CustomError } from './custom.error';
import { ErrorCode } from './enums';

/**
 * ConflictError is a custom error class that represents a Conflict Exception.
 * It extends the CustomError class. This class is used to create instances
 * of ConflictError with a specified error message. If no message is provided,
 * the default message 'Conflict Exception' will be used.
 *
 * @class ConflictError
 * @extends CustomError
 *
 * @example
 * const error = new ConflictError('Email already in use');
 */
export class ConflictError extends CustomError {
  public constructor(
    message = 'Conflict Error',
    errorCode: ErrorCode = ErrorCode.CONFLICT_ERROR,
    context: Record<string, any> = {}
  ) {
    super('ConflictError', message, errorCode, HttpStatus.CONFLICT, context);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
