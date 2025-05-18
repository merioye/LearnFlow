import path from 'path';
import { Injectable } from '@nestjs/common';
import callsites from 'callsites';
import * as cls from 'cls-hooked';
import { createLogger, format, Logger, transports } from 'winston';

import { Environment } from '@/enums';
import { CORRELATION_ID } from '@/constants';

import { ILogger } from '../interfaces';
import { TLogCaller, TLoggerModuleOptions, TLogInfo } from '../types';

// Create a namespace for storing correlation ID in AsyncLocalStorage
export const LoggerContextNamespace = cls.createNamespace('logger-context');

/**
 * Singleton of Logger using Winston library which implements the ILogger interface
 * Optimized for Filebeat/Fluentd collection and Elasticsearch storage
 * Enhanced with automatic caller context detection
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
  // Root directory to make file paths relative
  private readonly _rootDir: string;

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
    rootDir = process.cwd(),
  }: TLoggerModuleOptions) {
    const isTestingEnvironment = environment === Environment.TEST;
    const logLevel = debugMode ? 'debug' : 'info';
    this._rootDir = rootDir;

    // Common format for all transports - structured JSON for easier parsing by Filebeat/Fluentd
    const commonFormat = format.combine(
      // Add timestamp in ISO format for better Elasticsearch compatibility
      format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
      // Add error stack traces
      format.errors({ stack: true }),
      // Customize the log format for Filebeat/Fluentd
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      format.printf((info: TLogInfo) => {
        const log = {
          '@timestamp': info.timestamp,
          level: info.level,
          message: info.message,
          service: appName,
          environment,
          // Add correlation ID if available
          ...(info.correlation_id && { correlation_id: info.correlation_id }),
          // Include error stack if present
          ...(info.stack && { error_stack: info.stack }),
          // Add caller context if present
          ...(info.caller && { caller: info.caller }),
          // Add metadata if present
          ...(info.metadata && { metadata: info.metadata }),
        };
        return JSON.stringify(log);
      })
    );

    // Console format with colors for development
    const consoleFormat = format.combine(
      commonFormat,
      format.colorize({ all: true })
    );

    this._logger = createLogger({
      level: logLevel,
      transports: [
        new transports.Console({
          level: logLevel,
          silent: isTestingEnvironment,
          format: debugMode ? consoleFormat : commonFormat,
        }),
        new transports.File({
          level: 'error',
          dirname: logsDirPath,
          filename: 'error.log',
          silent: isTestingEnvironment,
          format: commonFormat,
        }),
        new transports.File({
          level: logLevel,
          dirname: logsDirPath,
          filename: 'combined.log',
          silent: isTestingEnvironment,
          format: commonFormat,
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
   * @inheritdoc
   */
  public log(message: any, metadata: any = null): void {
    const callerInfo = this._getCallerInfo();
    this._logger.info(
      this._formatMessage(message),
      this._enhanceMetadata(metadata, callerInfo)
    );
  }

  /**
   * @inheritdoc
   */
  public info(message: any, metadata: any = null): void {
    const callerInfo = this._getCallerInfo();
    this._logger.info(
      this._formatMessage(message),
      this._enhanceMetadata(metadata, callerInfo)
    );
  }

  /**
   * @inheritdoc
   */
  public debug(message: any, metadata: any = null): void {
    const callerInfo = this._getCallerInfo();
    this._logger.debug(
      this._formatMessage(message),
      this._enhanceMetadata(metadata, callerInfo)
    );
  }

  /**
   * @inheritdoc
   */
  public verbose(message: any, metadata: any = null): void {
    const callerInfo = this._getCallerInfo();
    this._logger.verbose(
      this._formatMessage(message),
      this._enhanceMetadata(metadata, callerInfo)
    );
  }

  /**
   * @inheritdoc
   */
  public error(message: any, metadata: any = null): void {
    const callerInfo = this._getCallerInfo();
    const formattedMessage =
      message instanceof Error ? message.message : this._formatMessage(message);

    const errorMetadata =
      message instanceof Error
        ? {
            ...this._enhanceMetadata(metadata, callerInfo),
            stack: message.stack,
          }
        : this._enhanceMetadata(metadata, callerInfo);

    this._logger.error(formattedMessage, errorMetadata);
  }

  /**
   * @inheritdoc
   */
  public warn(message: any, metadata: any = null): void {
    const callerInfo = this._getCallerInfo();
    this._logger.warn(
      this._formatMessage(message),
      this._enhanceMetadata(metadata, callerInfo)
    );
  }

  /**
   * Format message to string if needed
   *
   * @param data - Message to format
   * @returns Formatted message
   */
  private _formatMessage(data: any): string {
    if (data instanceof Error) {
      return data.message;
    }
    return typeof data === 'string' ? data : JSON.stringify(data);
  }

  /**
   * Add trace context to logs if available
   * This helps with distributed tracing correlation in Elasticsearch
   *
   * @param metadata - Metadata to enhance
   * @param callerInfo - Information about the caller
   * @returns Enhanced metadata with trace context
   */
  private _enhanceMetadata(
    metadata: any = null,
    callerInfo: any = null
  ): object {
    // Get correlation ID from CLS if available
    const correlationId = LoggerContextNamespace.get(CORRELATION_ID) as string;

    const traceContext = {
      ...(correlationId ? { correlation_id: correlationId } : {}),
      ...(callerInfo ? { caller: callerInfo as object } : {}),
    };

    return {
      ...traceContext,
      metadata: metadata as object,
    };
  }

  /**
   * Get information about the caller (class name, method name, file path)
   *
   * @returns Object containing caller information
   */
  private _getCallerInfo(): TLogCaller | null {
    try {
      // Get call stack information
      const sites = callsites();

      // We need to skip frames related to the logger itself
      // Index 0 is this method, 1 is the log method, 2 is the caller
      const callerSite = sites[2];

      if (!callerSite) {
        return null;
      }

      // Get file information
      const filePath = callerSite.getFileName();
      if (!filePath) {
        return null;
      }

      // Make path relative to root directory for cleaner logs
      const relativePath = path.relative(this._rootDir, filePath);

      // Get method name if available
      const methodName =
        callerSite.getMethodName() ||
        callerSite.getFunctionName() ||
        'anonymous';

      return {
        methodName,
        filePath: relativePath,
        lineNumber: callerSite.getLineNumber() || 0,
      };
    } catch {
      // Fallback if we can't get caller info
      return null;
    }
  }
}
