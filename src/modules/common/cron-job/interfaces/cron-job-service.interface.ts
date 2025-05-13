import { TCronJobInfo } from '../types';
import { ICronJobTask } from './cron-job-task.interface';

/**
 * Interface defining the contract for a cron job service implementation
 *
 * @interface ICronJobService
 */
export interface ICronJobService {
  /**
   * Register a task implementation for a job
   * @param name Job name to associate with the task
   * @param task Task implementation
   * @returns {void}
   */
  registerTask(name: string, task: ICronJobTask): void;

  /**
   * Get information about all registered jobs
   * @returns Array of job information with registration status
   */
  getRegisteredJobs(): TCronJobInfo[];
}
