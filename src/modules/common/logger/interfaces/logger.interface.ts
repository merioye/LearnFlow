/**
 * Interface defining the methods of the logger
 *
 *
 * @interface ILogger
 *
 * @method log - Logs a message
 * @method info - Logs an informational message
 * @method debug - Logs a debug message
 * @method error - Logs an error message
 * @method verbose - An Optional method that logs a verbose message
 * @method warn - An Optional method that logs a warning message
 */
export interface ILogger {
  /**
   * Logs a message
   *
   * @param message - Message to log
   * @param metadata - Optional extra metadata
   * @returns {void}
   */
  log(message: any, ...optionalParams: any[]): void;

  /**
   * Logs an informational message
   *
   * @param message - Message to log
   * @param metadata - Optional extra metadata
   * @returns {void}
   */
  info(message: any, ...optionalParams: any[]): void;

  /**
   * Logs a debug message
   *
   * @param message - Message to log
   * @param metadata - Optional extra metadata
   * @returns {void}
   */
  debug(message: any, ...optionalParams: any[]): void;

  /**
   * Logs a message at verbose level
   *
   * @param - Message message to log
   * @param metadata - Optional extra metadata
   * @returns {void}
   */
  error(message: any, ...optionalParams: any[]): void;

  /**
   * Logs an error message
   *
   * @param message - Message to log
   * @param metadata - Optional extra metadata
   * @returns {void}
   */
  verbose(message: any, ...optionalParams: any[]): void;

  /**
   * Logs a warning message
   *
   * @param message - Message to log
   * @param metadata - Optional extra metadata
   * @returns {void}
   */
  warn(message: any, ...optionalParams: any[]): void;
}
