import { TApiResponseParams, TErrorFormat } from '@/types';

/**
 * Class that represents the API response.
 *
 * This class is used to handle the API response in a standardized way.
 * It includes the result of the API call, error messages, the response message, a success flag indicating
 * if the API call was successful or not, and the status code of the response.
 *
 * @class ApiResponse
 * @template T - The type of the result of the API call.
 *
 * @example
 * const response = new ApiResponse({ result: { name: 'John Doe' } });
 */
export class ApiResponse<T> {
  public readonly errors: TErrorFormat[] = [];
  // The error (if any) information for debugging.
  public readonly errorInfo = {};
  // The result of the API call.
  public readonly result: T;
  public readonly message: string;
  // A flag indicating if the API call was successful or not.
  public readonly success: boolean;
  public readonly statusCode: number;

  /**
   * Creates a new ApiResponse instance with the specified result, message, and status code.
   *
   * @constructor
   * @param params - The parameters to use to create the ApiResponse instance.
   */
  public constructor({
    result,
    message = 'Success',
    statusCode = 200,
  }: TApiResponseParams<T>) {
    this.result = result;
    this.statusCode = statusCode;
    this.message = message;
    this.success = statusCode < 400;
  }
}
