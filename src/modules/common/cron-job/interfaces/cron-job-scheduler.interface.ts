import { TScheduleParams } from '../types';

/**
 * Interface defining the contract for a cron job scheduler implementation
 *
 * @interface ICronJobScheduler
 */
export interface ICronJobScheduler {
  /**
   * Schedule a new cron job
   * @param params Parameters for scheduling the job
   * @param params.name Unique identifier for the job
   * @param params.cronTime Cron pattern, Date, or interval in milliseconds
   * @param params.callback Function to execute when the job triggers
   * @param params.options Additional job configuration options
   * @returns {void}
   */
  schedule(params: TScheduleParams): void;

  /**
   * Cancel a scheduled job
   * @param name Job name
   * @returns {void}
   */
  cancel(name: string): void;

  /**
   * Get next scheduled run time for a job
   * @param name Job name
   * @returns Next run Date or undefined if not available
   */
  getNextRunOfJob(name: string): Date | undefined;
}
