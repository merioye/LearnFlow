import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { DATE_TIME, IDateTime } from '../../helper/date-time';
import { ILogger, LOGGER } from '../../logger';
import {
  CRON_JOB_GLOBAL_OPTIONS,
  CRON_JOB_SCHEDULER,
  CRON_JOBS,
} from '../constants';
import { CronJobStatus } from '../enums';
import {
  ICronJobScheduler,
  ICronJobService,
  ICronJobTask,
} from '../interfaces';
import {
  TCronJobConfig,
  TCronJobInfo,
  TCronJobOptions,
  TCronJobState,
} from '../types';

type TCronJobStateWithLastError = Omit<TCronJobState, 'lastError'> & {
  lastError?: Error;
};

/**
 * Service for managing and executing cron jobs
 *
 * @class CronJobService
 * @implements {ICronJobService, OnModuleInit}
 */
@Injectable()
export class CronJobService implements ICronJobService, OnModuleInit {
  /**
   * Map of registered tasks
   * @private
   */
  private _tasks = new Map<string, ICronJobTask>();

  /**
   * Map of job states
   * @private
   */
  private _jobStateMap = new Map<string, TCronJobStateWithLastError>();

  public constructor(
    @Inject(LOGGER)
    private readonly _logger: ILogger,
    @Inject(DATE_TIME)
    private readonly _dateTime: IDateTime,
    @Inject(CRON_JOB_SCHEDULER)
    private readonly _jobScheduler: ICronJobScheduler,
    @Inject(CRON_JOBS)
    private readonly _jobs: TCronJobConfig[],
    @Inject(CRON_JOB_GLOBAL_OPTIONS)
    private readonly _globalOptions?: Partial<TCronJobOptions>
  ) {}

  /**
   * Initialize the cron jobs on module initialization
   * @returns {void}
   */
  public onModuleInit(): void {
    this._initializeJobs();
  }

  /**
   * @inheritdoc
   */
  public registerTask(name: string, task: ICronJobTask): void {
    const context = {
      name: 'CronJobService',
      method: 'registerTask',
    };

    if (this._tasks.has(name)) {
      this._logger.warn(
        `Task ${name} is already registered. Overwriting existing task.`,
        { context }
      );
    }
    this._tasks.set(name, task);
  }

  /**
   * @inheritdoc
   */
  public getRegisteredJobs(): TCronJobInfo[] {
    return this._jobs.map((job) => {
      const state = this._jobStateMap.get(job.name) || {
        status: CronJobStatus.INACTIVE,
        executionCount: 0,
        errorCount: 0,
      };
      const isRegistered = this._tasks.has(job.name);

      return {
        ...job,
        isTaskRegistered: isRegistered,
        status: isRegistered ? state.status : CronJobStatus.INACTIVE,
        nextRun: this._jobScheduler.getNextRunOfJob(job.name),
        lastExecution: state.lastExecution,
        lastError: state.lastError?.message,
        executionCount: state.executionCount,
        errorCount: state.errorCount,
      };
    });
  }

  /**
   * Initialize the cron jobs
   * @returns {void}
   */
  private _initializeJobs(): void {
    this._jobs.forEach((job) => this._scheduleJob(job));
  }

  /**
   * Schedule a job
   * @param job Job configuration
   * @returns {void}
   */
  private _scheduleJob(job: TCronJobConfig): void {
    const context = {
      name: 'CronJobService',
      method: '_scheduleJob',
    };

    if (!this._tasks.has(job.name)) {
      this._logger.error(
        `Task ${job.name} not registered. Job will not be scheduled.`,
        { context }
      );
      return;
    }

    const mergedOptions: TCronJobConfig = {
      ...this._globalOptions,
      ...job,
    };

    try {
      this._jobScheduler.schedule({
        name: job.name,
        cronTime: job.schedule,
        callback: this._createJobExecutor(job.name, mergedOptions.context),
        options: mergedOptions,
      });
    } catch (error) {
      this._logger.error(`Failed to schedule job ${job.name}: `, {
        context,
        error,
      });
    }
  }

  /**
   * Create a job executor
   * @param name Job name
   * @param context Context for the job
   * @returns {() => Promise<void>}
   */
  private _createJobExecutor(
    name: string,
    context: Record<string, any> = {}
  ): () => Promise<void> {
    const loggerContext = {
      name: 'CronJobService',
      method: '_createJobExecutor',
    };

    return async () => {
      const task = this._tasks.get(name);
      if (!task) {
        this._logger.error(`Task ${name} not found`, {
          context: loggerContext,
        });
        return;
      }

      const state = this._jobStateMap.get(name) || {
        status: CronJobStatus.ACTIVE,
        executionCount: 0,
        errorCount: 0,
      };

      try {
        state.lastExecution = this._dateTime.toUTC(this._dateTime.now());
        // Pass both context and job metadata
        await task.execute({
          jobName: name,
          timestamp: this._dateTime.toUTC(this._dateTime.now()),
          params: context,
        });

        // Update state on success
        state.status = CronJobStatus.ACTIVE;
        state.executionCount++;
      } catch (error) {
        // Update state on error
        state.status = CronJobStatus.ERROR;
        state.lastError = error as Error;
        state.errorCount++;

        this._logger.error(`Job ${name} execution failed: `, {
          context,
          error,
        });
        if (task.onError) {
          await task.onError(error as Error, {
            jobName: name,
            timestamp: this._dateTime.toUTC(this._dateTime.now()),
            params: context,
          });
        }
      }
      this._jobStateMap.set(name, state);
    };
  }
}
