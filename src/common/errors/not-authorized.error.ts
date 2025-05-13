import { HttpStatus } from '@nestjs/common';

import { CustomError } from './custom.error';

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
  /**
   * Creates a new NotAuthorizedError instance with the specified error message.
   * If no message is provided, the default message 'Not Authorized' is used.
   *
   * @constructor
   * @param [message='Not Authorized'] - The error message.
   */
  public constructor(message = 'Not Authorized') {
    super(message, 'NotAuthorizedException', HttpStatus.UNAUTHORIZED);
    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }
}
