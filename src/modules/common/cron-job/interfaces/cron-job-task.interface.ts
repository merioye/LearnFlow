import { TCronJobTaskContext } from '../types';

/**
 * Interface representing a cron job task to be implemented by consumers
 *
 * @interface ICronJobTask
 * @template T - Type of the task context
 */
export interface ICronJobTask<T = any> {
  /**
   * Executes the task.

   *
   * @param context - Context containing task execution parameters.
   * @returns Promise that resolves when the task completes.
   */
  execute(context: TCronJobTaskContext<T>): Promise<void>;

  /**
   * Handles errors that occur during task execution.
   *
   * @param error - The error that occurred.
   * @param context - The execution context of the job.
   * @returns {void}
   */
  onError?(error: Error, context: TCronJobTaskContext<T>): Promise<void>;
}
