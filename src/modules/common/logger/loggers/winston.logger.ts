import path from 'path';
import { Injectable } from '@nestjs/common';
import callsites from 'callsites';
import * as cls from 'cls-hooked';
import {
  createLogger,
  format,
  Logger,
  LoggerOptions,
  transports,
} from 'winston';
import LokiTransport from 'winston-loki';

import { Environment } from '@/enums';
import { CORRELATION_ID } from '@/constants';

import { ILogger } from '../interfaces';
import {
  TLogCaller,
  TLoggerModuleOptions,
  TLogInfo,
  TLokiConfig,
} from '../types';

// Create a namespace for storing correlation ID in AsyncLocalStorage
export const LoggerContextNamespace = cls.createNamespace('logger-context');

/**
 * Singleton of Logger using Winston library which implements the ILogger interface
 * Enhanced with automatic caller context detection and Grafana Loki integration
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
    loki,
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

    // Define the transports array
    const logTransports: LoggerOptions['transports'] = [
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
    ];

    // Add Loki transport if configuration is provided
    if (loki?.host) {
      logTransports.push(
        this._createLokiTransport(
          loki,
          appName,
          environment,
          logLevel,
          isTestingEnvironment
        )
      );
    }

    this._logger = createLogger({
      level: logLevel,
      transports: logTransports,
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

  /**
   * Creates a properly configured Loki transport for Winston
   *
   * @param lokiConfig - Loki configuration options
   * @param appName - Application name for default labels
   * @param environment - Current environment for default labels
   * @param logLevel - Configured log level
   * @param isSilent - Whether to silence the transport (e.g. in test environment)
   * @returns Configured Loki transport
   *
   * @private
   */
  private _createLokiTransport(
    lokiConfig: TLokiConfig,
    appName: string,
    environment: Environment,
    logLevel: string,
    isSilent: boolean
  ): LokiTransport {
    // Define default labels
    const defaultLabels = {
      service: appName,
      environment,
      ...lokiConfig.labels,
    };

    return new LokiTransport({
      host: lokiConfig.host,
      basicAuth: lokiConfig.basicAuth,
      labels: defaultLabels,
      json: true,
      batching: lokiConfig.batching ?? true,
      interval: lokiConfig.interval ?? 5,
      gracefulShutdown: lokiConfig.gracefulShutdown ?? true,
      clearOnError: lokiConfig.clearOnError ?? false,
      replaceTimestamp: lokiConfig.replaceTimestamp ?? true,
      format: format.combine(format.timestamp(), format.json()),
      level: logLevel,
      silent: isSilent,
      // Automatically retry on connection failures (production grade)
      timeout: lokiConfig.timeout ?? 30000,
      onConnectionError: (err): void => {
        // Log to console if Loki connection fails to prevent logging loop
        // eslint-disable-next-line no-console
        console.error(`Loki connection error: ${(err as Error)?.message}`);
      },
    });
  }
}
