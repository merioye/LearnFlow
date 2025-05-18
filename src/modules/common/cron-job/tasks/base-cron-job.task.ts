import { Injectable } from '@nestjs/common';

import { CORRELATION_ID } from '@/constants';

import { IDateTime } from '../../helper/date-time';
import { ILogger, LoggerContextNamespace } from '../../logger';
import { ICronJobTask } from '../interfaces';

/**
 * Base class for cron job tasks that supports correlation ID
 *
 * @class BaseCronJobTask
 * @implements {ICronJobTask}
 */
@Injectable()
export abstract class BaseCronJobTask implements ICronJobTask {
  public constructor(
    protected readonly logger: ILogger,
    protected readonly dateTime: IDateTime
  ) {}

  /**
   * Execute the task
   * @param context - Execution context with job info and parameters
   * @returns {Promise<void>}
   */
  public async execute(context: {
    jobName: string;
    timestamp: Date;
    params: Record<string, any>;
  }): Promise<void> {
    // Ensure we're running in the context of the correlation ID
    // This is a safety measure in case the task is called outside of the CronJobService
    const correlationId =
      (context.params[CORRELATION_ID] as string) ||
      (LoggerContextNamespace.get(CORRELATION_ID) as string) ||
      `cron-${context.jobName}-fallback-${this.dateTime.timestamp.toString(36)}`;

    return LoggerContextNamespace.runPromise(async () => {
      // Set the correlation ID in the namespace
      LoggerContextNamespace.set(CORRELATION_ID, correlationId);

      this.logger.debug(`Starting task execution for ${context.jobName}`, {
        jobName: context.jobName,
      });

      try {
        // Call the task implementation
        await this.executeTask(context);

        this.logger.debug(`Completed task execution for ${context.jobName}`, {
          jobName: context.jobName,
        });
      } catch (error) {
        this.logger.error(`Task execution failed for ${context.jobName}`, {
          jobName: context.jobName,
          error,
        });
        throw error;
      }
    });
  }

  /**
   * Task implementation to be provided by subclasses
   * @param context - Execution context with job info and parameters
   * @returns {Promise<void>}
   */
  protected abstract executeTask(context: {
    jobName: string;
    timestamp: Date;
    params: Record<string, any>;
  }): Promise<void>;

  /**
   * Handle errors that occur during task execution
   * @param error - The error that occurred
   * @param context - Execution context with job info and parameters
   * @returns {Promise<void>}
   */
  public async onError(
    error: Error,
    context: {
      jobName: string;
      timestamp: Date;
      params: Record<string, any>;
    }
  ): Promise<void> {
    this.logger.error(`Error handler called for ${context.jobName}`, {
      jobName: context.jobName,
      error,
    });

    // Call the task-specific error handler if implemented
    if (this.handleError) {
      await this.handleError(error, context);
    }
  }

  /**
   * Task-specific error handler to be optionally implemented by subclasses
   * @param error - The error that occurred
   * @param context - Execution context with job info and parameters
   * @returns {Promise<void>}
   */
  protected handleError?(
    error: Error,
    context: {
      jobName: string;
      timestamp: Date;
      params: Record<string, any>;
    }
  ): Promise<void>;
}
