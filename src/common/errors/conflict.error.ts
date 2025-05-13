import { HttpStatus } from '@nestjs/common';

import { CustomError } from './custom.error';

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
  /**
   * Creates a new ConflictError instance with the specified error message.
   * If no message is provided, the default message 'Conflict Exception' is used.
   *
   * @constructor
   * @param [message='Conflict Exception'] - The error message.
   */
  public constructor(message = 'Conflict Exception') {
    super(message, 'ConflictException', HttpStatus.CONFLICT);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
