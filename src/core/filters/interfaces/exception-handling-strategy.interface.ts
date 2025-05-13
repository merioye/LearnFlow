import { Request } from 'express';

import { TExceptionResponseBody } from '@/types';

/**
 * Defines the contract for error handling strategies.
 *
 * @interface IExceptionHandlingStrategy
 */
export interface IExceptionHandlingStrategy {
  /**
   * Handles an error and generates an appropriate error response.
   *
   * @param error - The error that occurred.
   * @param request - The incoming request.
   * @param errorId - A unique identifier for this error occurrence.
   * @param isProduction - Whether the application is running in production mode.
   * @returns An exception response body.
   */
  handleException(
    error: Error,
    request: Request,
    errorId: string,
    isProduction?: boolean
  ): TExceptionResponseBody;
}
