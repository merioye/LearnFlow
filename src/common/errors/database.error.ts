import { HttpStatus } from '@nestjs/common';

import { CustomError } from './custom.error';

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
  /**
   * Creates a new DatabaseError instance with the specified error message.
   * If no message is provided, the default message 'Database Exception' is used.
   *
   * @constructor
   * @param [message='Database Exception'] - The error message.
   */
  public constructor(message = 'Database Exception') {
    super(message, 'DatabaseException', HttpStatus.INTERNAL_SERVER_ERROR);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}
