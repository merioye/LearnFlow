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
