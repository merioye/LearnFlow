import { Injectable, OnModuleInit } from '@nestjs/common';

import { CORRELATION_ID } from '@/constants';

import { IDateTime, InjectDateTime } from '../../helper/date-time';
import { ILogger, InjectLogger, LoggerContextNamespace } from '../../logger';
import {
  InjectCronJobGlobalOptions,
  InjectCronJobs,
  InjectCronJobScheduler,
} from '../decorators';
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
    @InjectLogger()
    private readonly _logger: ILogger,
    @InjectDateTime()
    private readonly _dateTime: IDateTime,
    @InjectCronJobScheduler()
    private readonly _jobScheduler: ICronJobScheduler,
    @InjectCronJobs()
    private readonly _jobs: TCronJobConfig[],
    @InjectCronJobGlobalOptions()
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
    if (this._tasks.has(name)) {
      this._logger.warn(
        `Task ${name} is already registered. Overwriting existing task.`
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
    if (!this._tasks.has(job.name)) {
      this._logger.error(
        `Task ${job.name} not registered. Job will not be scheduled.`
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
    return async () => {
      // Generate a correlation ID for this job execution
      const correlationId = this._generateCorrelationId(name);

      // Run the job execution within the CLS namespace context
      await LoggerContextNamespace.runPromise(async () => {
        // Set the correlation ID in the namespace
        LoggerContextNamespace.set(CORRELATION_ID, correlationId);

        const task = this._tasks.get(name);
        if (!task) {
          this._logger.error(`Task ${name} not found`);
          return;
        }

        const state = this._jobStateMap.get(name) || {
          status: CronJobStatus.ACTIVE,
          executionCount: 0,
          errorCount: 0,
        };

        try {
          state.lastExecution = this._dateTime.toUTC(this._dateTime.now());

          // Log job execution
          this._logger.info(`Starting cron job execution: ${name}`, {
            jobName: name,
          });

          // Pass both context, job metadata and correlation ID
          await task.execute({
            jobName: name,
            timestamp: this._dateTime.toUTC(this._dateTime.now()),
            params: { ...context, [CORRELATION_ID]: correlationId },
          });

          // Update state on success
          state.status = CronJobStatus.ACTIVE;
          state.executionCount++;

          // Log successful completion
          this._logger.info(`Completed cron job execution: ${name}`, {
            jobName: name,
          });
        } catch (error) {
          // Update state on error
          state.status = CronJobStatus.ERROR;
          state.lastError = error as Error;
          state.errorCount++;

          this._logger.error(`Job ${name} execution failed: `, {
            error,
          });
          if (task.onError) {
            await task.onError(error as Error, {
              jobName: name,
              timestamp: this._dateTime.toUTC(this._dateTime.now()),
              params: { ...context, [CORRELATION_ID]: correlationId },
            });
          }
        }
        this._jobStateMap.set(name, state);
      });
    };
  }

  /**
   * Generates a correlation ID for a cron job
   *
   * @param {string} jobName - The name of the job
   * @returns {string} - Generated correlation ID
   */
  private _generateCorrelationId(jobName: string): string {
    return `cron-${jobName}-${this._dateTime.timestamp.toString(36)}-${Math.random().toString(36).substring(2)}`;
  }
}
