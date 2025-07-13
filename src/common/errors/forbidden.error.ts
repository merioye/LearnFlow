import { HttpStatus } from '@nestjs/common';

import { CustomError } from './custom.error';
import { ErrorCode } from './enums';

/**
 * ForbiddenError is a custom error class that represents a Forbidden Exception.
 * It extends the CustomError class. This class is used to create instances
 * of ForbiddenError with a specified error message. If no message is provided,
 * the default message 'Action Forbidden' will be used.
 *
 * @class ForbiddenError
 * @extends CustomError
 *
 * @example
 * const error = new ForbiddenError('You are not authorized to access this resource');
 */
export class ForbiddenError extends CustomError {
  public constructor(
    message = 'Action Forbidden',
    errorCode: ErrorCode = ErrorCode.FORBIDDEN_ERROR,
    context: Record<string, any> = {}
  ) {
    super('ForbiddenError', message, errorCode, HttpStatus.FORBIDDEN, context);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}
