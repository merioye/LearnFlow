import { HttpStatus } from '@nestjs/common';

import { CustomError } from './custom.error';

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
  /**
   * Creates a new BadRequestError instance with the specified error message.
   * If no message is provided, the default message 'Conflict Exception' is used.
   *
   * @constructor
   * @param [message='Bad Request Exception'] - The error message.
   */
  public constructor(message = 'Bad Request Exception') {
    super(message, 'BadRequestException', HttpStatus.BAD_REQUEST);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}
