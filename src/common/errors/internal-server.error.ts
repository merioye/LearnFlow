import { HttpStatus } from '@nestjs/common';

import { CustomError } from './custom.error';

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
  /**
   * Creates a new InternalServerError instance with the specified error message.
   * If no message is provided, the default message 'Internal Server Exception' is used.
   *
   * @constructor
   * @param message - The error message.
   */
  public constructor(message = 'Internal Server Exception') {
    super(message, 'InternalServerException', HttpStatus.INTERNAL_SERVER_ERROR);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}
