import { Environment } from '@/enums';

/**
 * Type representing the TLoggerModuleOptions.
 *
 * @typedef TLoggerModuleOptions
 *
 * @property {Environment} environment - The environment in which the application is running.
 * @property {string} logsDirPath - The path to the directory where logs will be stored.
 * @property {string} appName - The name of the application
 */
export type TLoggerModuleOptions = {
  environment: Environment;
  logsDirPath: string;
  rootDir?: string;
  debugMode: boolean;
  appName: string;
  /**
   * Optional Loki configuration for log aggregation
   * If provided, logs will be sent to Grafana Loki
   */
  loki?: TLokiConfig;
};

export type TLogInfo = {
  timestamp: string;
  level: string;
  message: string;
  correlation_id?: string;
  caller?: TLogCaller;
  stack?: string;
  metadata?: Record<string, any>;
};

export type TLogCaller = {
  methodName: string;
  filePath: string;
  lineNumber: number;
};

/**
 * Configuration options for Grafana Loki transport
 */
export type TLokiConfig = {
  /**
   * Loki server URL (e.g., http://loki:3100)
   */
  host: string;

  /**
   * Optional basic authentication in format "username:password"
   */
  basicAuth?: string;

  /**
   * Custom labels to attach to every log entry
   * These help with filtering and querying in Grafana
   */
  labels?: Record<string, string>;

  /**
   * Whether to batch log messages before sending to Loki (recommended for production)
   * @default true
   */
  batching?: boolean;

  /**
   * How often to send batched logs (in seconds)
   * @default 5
   */
  interval?: number;

  /**
   * Whether to flush pending logs on process termination
   * @default true
   */
  gracefulShutdown?: boolean;

  /**
   * Whether to clear the queue on connection error
   * @default false - Keep logs and retry
   */
  clearOnError?: boolean;

  /**
   * Whether to use Loki's timestamp instead of Winston's
   * @default true
   */
  replaceTimestamp?: boolean;

  /**
   * Connection timeout in milliseconds
   * @default 30000 (30 seconds)
   */
  timeout?: number;
};
