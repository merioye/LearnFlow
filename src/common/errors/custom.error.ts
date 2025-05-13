/**
 * CustomError class represents a generic error with a status code.
 * It extends the built-in Error class and adds additional properties.
 *
 * @class CustomError
 * @extends Error
 *
 * @example
 * const error = new CustomError('Email already in use', 'ConflictException', HttpStatus.CONFLICT);
 */
export class CustomError extends Error {
  /**
   * Creates a new CustomError instance with the specified
   *    error message, error name, and status code.
   *
   * @constructor
   * @param message - The error message.
   * @param name - The name of the error.
   * @param statusCode - The HTTP status code of the error.
   */
  public constructor(
    message: string,
    public name: string,
    private readonly _statusCode: number
  ) {
    super(message);
    // Ensure proper prototype chain
    Object.setPrototypeOf(this, CustomError.prototype);
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * This method returns the value of the `statusCode` property
   *    of the error object.
   *
   * @returns The HTTP status code of the error.
   */
  public getStatus(): number {
    return this._statusCode;
  }
}
