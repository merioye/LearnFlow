/**
 * Type representing an error object.
 *
 * @typedef TErrorFormat
 *
 * @property {string} message - The error message
 * @property {string} field - The field name that caused the error
 * @property {string} location - The location of the error
 * @property {string | null} stack - The stack trace if the application is not in production mode, or null otherwise
 */
export type TErrorFormat = {
  message: string;
  field: string;
  location: string;
  stack: string | null;
};

/**
 * Type representing error metadata for logging purposes.
 *
 * @typedef TLoggerErrorMetadata
 *
 * @property {string} id - A UUID identifying the error
 * @property {TErrorFormat} [errors] - An optional array of error objects, each containing the following fields:
 *  - message: The error message
 *  - field: The field name that caused the error
 *  - location: The location of the error
 *  - stack: The stack trace if the application is not in production mode, or null otherwise
 * @property {string | null} stack - The stack trace if the application is not in production mode, or null otherwise
 * @property {number} statusCode - The HTTP status code of the error
 * @property {string} path - The URL path of the request that caused the error
 * @property {string} method - The HTTP method of the request that caused the error
 */
export type TLoggerErrorMetadata = {
  id: string;
  errors?: TErrorFormat[];
  stack: string | null;
  statusCode: number;
  path: string;
  method: string;
};

/**
 * Type represents the structure of the exception response body.
 *
 * @typedef TExceptionResponseBody
 *
 * @property {number} statusCode - The HTTP status code of the error
 * @property {string} message - The error message
 * @property {boolean} success - Whether the request was successful
 * @property {TErrorFormat} errorInfo - The error information
 * @property {Array<TErrorFormat>} errors - The array of error objects
 */
export type TExceptionResponseBody = {
  statusCode: number;
  message: string;
  success: false;
  errorInfo: {
    ref: string;
    type: string;
    path: string;
    method: string;
  };
  errors: Array<TErrorFormat>;
};

export * from './api-response.types';
