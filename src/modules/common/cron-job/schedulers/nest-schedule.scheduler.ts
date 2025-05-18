import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

import { IDateTime, InjectDateTime } from '../../helper/date-time';
import { ILogger, InjectLogger } from '../../logger';
import { ICronJobScheduler } from '../interfaces';
import { TCronJobOptions, TScheduleParams } from '../types';

/**
 * Cron Job Scheduler implementation using NestJS Schedule
 *
 * @class NestScheduleScheduler
 * @implements {ICronJobScheduler}
 */
@Injectable()
export class NestScheduleScheduler implements ICronJobScheduler {
  public constructor(
    @InjectLogger() private readonly _logger: ILogger,
    @InjectDateTime() private readonly _dateTime: IDateTime,
    private readonly _schedulerRegistry: SchedulerRegistry
  ) {}

  /**
   * @inheritdoc
   */
  public schedule(params: TScheduleParams): void {
    const { name, cronTime, callback, options } = params;
    try {
      const job = new CronJob(
        cronTime,
        this._createJobCallback(name, callback, options || {}),
        this._createOnCompleteCallback(name, options || {}),
        false,
        options?.timeZone,
        options?.context
      );
      this._schedulerRegistry.addCronJob(
        name,
        job as unknown as CronJob<null, null>
      );

      const runAt = this._dateTime.format(
        this._dateTime.toUTC(job.nextDate().toJSDate()),
        'yyyy-MM-dd HH:mm:ss'
      );
      this._logger.info(
        `Scheduled job: ${name}${options?.description ? ` (${options?.description})` : ''} to run at ${runAt}`
      );

      if (options?.runOnInit) {
        job.start();
      }
    } catch (error) {
      this._logger.error(`Failed to schedule job ${name}: `, {
        error,
      });
      throw error;
    }
  }

  /**
   * @inheritdoc
   */
  public cancel(name: string): void {
    this._schedulerRegistry.deleteCronJob(name);
  }

  /**
   * @inheritdoc
   */
  public getNextRunOfJob(name: string): Date | undefined {
    try {
      const job = this._schedulerRegistry.getCronJob(name);
      return job.nextDate().toJSDate();
    } catch {
      return undefined;
    }
  }

  /**
   * Create a callback function for a job
   * @param name Job name
   * @param callback Function to execute when the job triggers
   * @param options Additional job configuration options
   * @returns {() => Promise<void>}
   */
  private _createJobCallback(
    name: string,
    callback: () => Promise<void>,
    options: TCronJobOptions
  ): () => Promise<void> {
    return async () => {
      this._logger.info(
        `Executing job: ${name}${options?.description ? ` (${options?.description})` : ''} at ${this._dateTime.format(this._dateTime.toUTC(new Date()), 'yyyy-MM-dd HH:mm:ss')}`
      );
      if (options?.timeout) {
        await this._executeWithTimeout(name, callback, options.timeout);
      } else {
        await callback();
      }
    };
  }

  /**
   * Execute a job with a timeout
   * @param name Job name
   * @param callback Function to execute when the job triggers
   * @param timeout Timeout in milliseconds
   * @returns {Promise<void>}
   */
  private async _executeWithTimeout(
    name: string,
    callback: () => Promise<void>,
    timeout: number
  ): Promise<void> {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`Job ${name} timed out after ${timeout}ms`)),
        timeout
      )
    );

    try {
      await Promise.race([callback(), timeoutPromise]);
    } catch (error) {
      this._logger.error(
        error instanceof Error ? error.message : JSON.stringify(error)
      );
      throw error;
    }
  }

  /**
   * Create a callback function to be executed when a job is completed
   * @param name Job name
   * @param options Additional job configuration options
   * @returns {() => void}
   */
  private _createOnCompleteCallback(
    name: string,
    options: TCronJobOptions
  ): () => void {
    return () => {
      if (options.runOnce) {
        this.cancel(name);
      }
      options.onComplete?.();
    };
  }
}
