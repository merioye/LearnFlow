import { HttpStatus } from '@nestjs/common';

import { CustomError } from './custom.error';

/**
 * WSError class represents a WebSocket Exception.
 * It extends the CustomError class. This class is used to create instances
 * of WSError with a specified error message. If no message is provided,
 * the default message 'WebSocket Exception' will be used.
 *
 * @class WSError
 * @extends CustomError
 *
 * @example
 * const error = new WSError('WebSocket Exception', HttpStatus.BAD_REQUEST);
 *
 */
export class WSError extends CustomError {
  /**
   * Creates a new WSError instance with the specified error message.
   * If no message is provided, the default message 'WebSocket Exception' is used.
   *
   * @constructor
   * @param [message='WebSocket Exception'] - The error message.
   * @param [status=HttpStatus.BAD_REQUEST] - The HTTP status code.
   */
  public constructor(
    message = 'WebSocket Exception',
    status = HttpStatus.BAD_REQUEST
  ) {
    super(message, 'WSException', status);
    Object.setPrototypeOf(this, WSError.prototype);
  }
}
