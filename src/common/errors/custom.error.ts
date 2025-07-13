import { ErrorCode } from './enums';

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
  public readonly name: string;
  public readonly errorCode: ErrorCode;
  public readonly context: Record<string, any>;
  private readonly _statusCode: number;

  /**
   * Creates a new CustomError instance with the specified
   *    error message, error name, and status code.
   *
   * @constructor
   * @param name - The name of the error.
   * @param message - The error message.
   * @param errorCode -The error code.
   * @param statusCode - The HTTP status code of the error.
   * @param context - Additional information about the error.
   */
  public constructor(
    name: string,
    message: string,
    errorCode: ErrorCode,
    statusCode: number,
    context: Record<string, any> = {}
  ) {
    super(message);
    this.name = name;
    this.errorCode = errorCode;
    this.context = context;
    this._statusCode = statusCode;

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
