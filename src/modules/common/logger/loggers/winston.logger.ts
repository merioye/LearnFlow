import { Injectable } from '@nestjs/common';
import { createLogger, format, Logger, transports } from 'winston';

import { Environment } from '@/enums';

import { ILogger } from '../interfaces';
import { TLoggerModuleOptions } from '../types';

/**
 * Singleton of Logger using Winston library which implements the ILogger interface
 *
 * @class WinstonLogger
 * @implements {ILogger}
 *
 * @example
 * const logger = WinstonLogger.getInstance();
 * logger.log('info', 'Hello, World!');
 */
@Injectable()
export class WinstonLogger implements ILogger {
  // Singleton logger instance
  private static _instance: WinstonLogger;
  // Winston logger
  private readonly _logger: Logger;
  private readonly _customFormat = {
    console: format.printf(
      ({ timestamp, level, stack, message, metadata }: any) => {
        let logMessage = `${timestamp} [${level}]: ${stack || message}`;

        // Handle metadata if present
        if (metadata) {
          logMessage += ` ${JSON.stringify(metadata)}`;
        }

        return logMessage;
      }
    ),
  };

  /**
   * Private constructor to create a singleton from within the class.
   * It cannot be instantiated outside of the class
   *
   * @constructor
   * @param options - Logger module options
   */
  private constructor({
    environment,
    logsDirPath,
    debugMode,
    appName,
  }: TLoggerModuleOptions) {
    const isTestingEnvironment = environment === Environment.TEST;
    const logLevel = debugMode ? 'debug' : 'info';

    this._logger = createLogger({
      level: logLevel,
      defaultMeta: {
        application: appName,
      },
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.json()
      ),
      transports: [
        new transports.Console({
          level: logLevel,
          silent: isTestingEnvironment,
          format: format.combine(
            format.colorize(),
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.errors({ stack: true }),
            this._customFormat.console
          ),
        }),
        new transports.File({
          level: 'error',
          dirname: logsDirPath,
          filename: 'error.log',
          silent: isTestingEnvironment,
        }),
        new transports.File({
          level: logLevel,
          dirname: logsDirPath,
          filename: 'combined.log',
          silent: isTestingEnvironment,
        }),
      ],
    });
  }

  /**
   * Get the singleton instance of the logger
   *
   * @static
   * @param options - logger module options
   * @returns logger instance
   */
  public static getInstance(options: TLoggerModuleOptions): WinstonLogger {
    if (!WinstonLogger._instance) {
      WinstonLogger._instance = new WinstonLogger(options);
    }
    return WinstonLogger._instance;
  }

  /**
   * Format message to string
   *
   * @param data - Message to format
   * @returns Formatted message
   */
  private _stringify(data: any): string {
    return typeof data === 'string' ? data : JSON.stringify(data);
  }

  /**
   * @inheritdoc
   */
  public log(message: any, metadata: any = null): void {
    this._logger.log('info', this._stringify(message), {
      metadata: metadata as object,
    });
  }

  /**
   * @inheritdoc
   */
  public info(message: any, metadata: any = null): void {
    this._logger.info(this._stringify(message), {
      metadata: metadata as object,
    });
  }

  /**
   * @inheritdoc
   */
  public debug(message: any, metadata: any = null): void {
    this._logger.debug(this._stringify(message), {
      metadata: metadata as object,
    });
  }

  /**
   * @inheritdoc
   */
  public verbose(message: any, metadata: any = null): void {
    this._logger.verbose(this._stringify(message), {
      metadata: metadata as object,
    });
  }

  /**
   * @inheritdoc
   */
  public error(message: any, metadata: any = null): void {
    this._logger.error(this._stringify(message), {
      metadata: metadata as object,
    });
  }

  /**
   * @inheritdoc
   */
  public warn(message: any, metadata: any = null): void {
    this._logger.warn(this._stringify(message), {
      metadata: metadata as object,
    });
  }
}
