import { TErrorFormat } from '.';

/**
 * Type representing the response of an API endpoint.
 *
 * @typedef TApiResponseParams<T>
 *
 * @property {T} result - The result of the API endpoint, or null if the response is an error
 * @property {string} [message] - An optional descriptive information message about the operation
 * @property {number} [statusCode] - The optional HTTP status code of the response
 */
export type TApiResponseParams<T> = {
  result: T;
  message?: string;
  statusCode?: number;
};

/**
 * Type represents the structure of offset paginated query.
 *
 * @typedef TOffsetPaginatedResult
 * @template T - The type of the result of the API call.
 *
 * @property {Array<T>} items - The array of items
 * @property {number} page - The current page number
 * @property {number} limit - The number of items per page
 * @property {number} totalPages - The total number of pages
 * @property {number} totalItems - The total number of items
 */
export type TOffsetPaginatedResult<T> = {
  items: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
};

/**
 * Type represents the structure of API response for offset pagination query.
 *
 * @typedef TOffsetPaginatedApiResponse
 * @template T - The type of the result of the API call.
 *
 * @property {number} statusCode - The HTTP status code of the error
 * @property {string} message - The error message
 * @property {boolean} success - Whether the request was successful
 * @property {TOffsetPaginatedResult<T>} result - The result of the API call
 * @property {Object} errorInfo - The error information
 * @property {Array<TErrorFormat>} errors - The array of error objects
 */
export type TOffsetPaginatedApiResponse<T> = {
  statusCode: number;
  message: string;
  success: boolean;
  result: TOffsetPaginatedResult<T>;
  errorInfo: object;
  errors: Array<TErrorFormat>;
};

/**
 * Type represents the structure of cursor paginated query.
 *
 * @typedef TCursorPaginatedResult
 * @template T - The type of the result of the API call.
 *
 * @property {Array<T>} items - The array of items
 * @property {number} limit - The number of items per page
 * @property {string | null} prevCursor - The cursor to the previous page
 * @property {string | null} nextCursor - The cursor to the next page
 * @property {boolean} hasMore - Whether there is a next page
 */
export type TCursorPaginatedResult<T> = {
  items: T[];
  limit: number;
  hasMore: boolean;
  nextCursor: string | null;
  prevCursor: string | null;
};

/**
 * Type represents the structure of API response for cursor pagination query.
 *
 * @typedef TCursorPaginatedApiResponse
 * @template T - The type of the result of the API call.
 *
 * @property {number} statusCode - The HTTP status code of the error
 * @property {string} message - The error message
 * @property {boolean} success - Whether the request was successful
 * @property {TCursorPaginatedResult<T>} result - The result of the API call
 * @property {Object} errorInfo - The error information
 * @property {Array<TErrorFormat>} errors - The array of error objects
 */
export type TCursorPaginatedApiResponse<T> = {
  statusCode: number;
  message: string;
  success: boolean;
  result: TCursorPaginatedResult<T>;
  errorInfo: object;
  errors: Array<TErrorFormat>;
};
