import { HttpStatus } from '@nestjs/common';

import { CustomError } from './custom.error';

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
  /**
   * Creates a new ForbiddenError instance with the specified error message.
   * If no message is provided, the default message 'Action Forbidden' is used.
   *
   * @constructor
   * @param [message='Action Forbidden'] - The error message.
   */
  public constructor(message = 'Action Forbidden') {
    super(message, 'ForbiddenException', HttpStatus.FORBIDDEN);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}
