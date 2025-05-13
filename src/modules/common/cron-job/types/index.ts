import { CronJobStatus } from '../enums';

/**
 * Options for configuring cron job behavior
 */
export type TCronJobOptions = {
  /**
   * Timezone for the cron execution
   * @example 'Europe/Paris'
   */
  timeZone?: string;
  /**
   * Run the job only once
   * @default false
   */
  runOnce?: boolean;
  /**
   * Timeout in milliseconds after which the job will be canceled
   */
  timeout?: number;
  /**
   * Human-readable description of the job
   */
  description?: string;
  /**
   * Callback to execute when the job completes successfully
   */
  onComplete?: () => void;
  /**
   * Run the job immediately when created
   * @default false
   */
  runOnInit?: boolean;
};

/**
 * Configuration for individual cron jobs
 */
export type TCronJobConfig = TCronJobOptions & {
  /**
   * Unique identifier for the job
   */
  name: string;
  /**
   * Schedule configuration (cron pattern, Date)
   */
  schedule: string | Date;
  /**
   * Context data passed to the task execution
   */
  context?: Record<string, any>;
};

/**
 * Configuration options for the CronModule
 */
export type TCronJobModuleOptions = {
  /**
   * List of cron job configurations
   */
  jobs: TCronJobConfig[];
  /**
   * Global options applied to all jobs
   */
  globalOptions?: Partial<TCronJobOptions>;
};

/**
 * Parameters for scheduling a cron job
 */
export type TScheduleParams = {
  name: string;
  cronTime: string | Date;
  callback: () => Promise<void>;
  options?: TCronJobConfig;
};

/**
 * Context for the task execution
 */
export type TCronJobTaskContext<T = any> = {
  jobName: string;
  timestamp: Date;
  params?: T;
};

/**
 * State of a cron job
 */
export type TCronJobState = {
  /**
   * Current status of the job
   */
  status: CronJobStatus;
  /**
   * Last error encountered during execution
   */
  lastError?: string;
  /**
   * Last execution time
   */
  lastExecution?: Date;
  /**
   * Number of times the job has been executed
   */
  executionCount: number;
  /**
   * Number of times the job has encountered an error
   */
  errorCount: number;
};

/**
 * Information about a cron job
 */
export type TCronJobInfo = TCronJobConfig &
  TCronJobState & {
    /**
     * Whether the task implementation is registered
     */
    isTaskRegistered: boolean;
    /**
     * Next scheduled run time (if available)
     */
    nextRun?: Date;
  };
