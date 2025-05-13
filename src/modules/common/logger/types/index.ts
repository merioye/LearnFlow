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
  debugMode: boolean;
  appName: string;
};
