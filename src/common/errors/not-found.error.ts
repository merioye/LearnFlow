import { HttpStatus } from '@nestjs/common';

import { CustomError } from './custom.error';

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
  /**
   * Creates a new NotFoundError instance with the specified error message.
   * If no message is provided, the default message 'Not Found' is used.
   *
   * @constructor
   * @param [message='Not Found'] - The error message.
   */
  public constructor(message = 'Not Found') {
    super(message, 'NotFoundException', HttpStatus.NOT_FOUND);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
