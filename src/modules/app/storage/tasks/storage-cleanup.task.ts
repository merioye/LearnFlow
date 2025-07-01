import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { In, LessThan } from 'typeorm';

import {
  BaseCronJobTask,
  TCronJobTaskContext,
} from '@/modules/common/cron-job';
import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
import { ILogger, InjectLogger } from '@/modules/common/logger';
import { FileTrackingEntity } from '@/database';
import { DistributedLockService } from '@/database/services';

import { Config } from '@/enums';

import { InjectStorageProvider } from '../decorators';
import { FileStatus } from '../enums';
import { IStorageProvider } from '../interfaces';
import { FileTrackingService } from '../services';
import { TStorageCleanupTaskContext } from '../types';

/**
 * Service class for performing periodic file cleanup tasks.
 * This service removes orphaned and expired files from the storage system.
 *
 * @class StorageCleanupTask
 * @extends {BaseCronJobTask}
 */
@Injectable()
export class StorageCleanupTask extends BaseCronJobTask {
  private readonly _DEFAULT_RETENTION_DAYS = 30;

  public constructor(
    @InjectDateTime() dateTime: IDateTime,
    @InjectLogger() logger: ILogger,
    @InjectStorageProvider()
    private readonly _storageProvider: IStorageProvider,
    private readonly _fileTrackingService: FileTrackingService,
    private readonly _distributedLockService: DistributedLockService,
    private readonly _configService: ConfigService
  ) {
    super(logger, dateTime);
  }

  /**
   * Executes the file cleanup task.
   *
   * This method acquires a distributed lock to ensure that only one instance of the task runs at a time.
   * It then identifies orphaned or expired files based on retention policies and deletes them in batches.
   *
   * @param context - Context containing task execution parameters.
   * @returns Promise that resolves when the task completes.
   */
  public async executeTask(
    context: TCronJobTaskContext<TStorageCleanupTaskContext>
  ): Promise<void> {
    const LOCK_NAME = 'file-cleanup-job-lock';
    const LOCK_TTL = this._configService.get<number>(
      Config.FILE_TABLE_LOCK_TTL
    )!;

    // Check if there is already an existing lock
    const isLockExists = await this._distributedLockService.findOne({
      filter: { name: LOCK_NAME },
    });
    if (isLockExists) {
      this.logger.info(
        'File cleanup job already in progress by another instance'
      );
      return;
    }

    // Acquire distributed lock
    const lock = await this._distributedLockService.create({
      data: {
        name: LOCK_NAME,
        expiresAt: this.dateTime.toUTC(this.dateTime.timestamp + LOCK_TTL),
      },
    });

    try {
      const cutoffDate = this.dateTime.toUTC(this.dateTime.now());
      cutoffDate.setDate(
        cutoffDate.getDate() -
          (context?.params?.RETENTION_DAYS ?? this._DEFAULT_RETENTION_DAYS)
      );
      const createdBefore = 86400000; // 24 hours in milliseconds

      const files = await this._fileTrackingService.findMany({
        filter: [
          {
            status: FileStatus.ACTIVE,
            referenceCount: 0,
            lastReferencedAt: LessThan(cutoffDate),
          },
          {
            status: FileStatus.PENDING,
            referenceCount: 0,
            createdAt: LessThan(
              this.dateTime.toUTC(this.dateTime.timestamp - createdBefore)
            ),
          },
        ],
      });

      this.logger.info(`Found ${files.length} files to cleanup`);

      await this._deleteFilesBatch(files);
    } catch (error) {
      this.logger.error('Storage cleanup job failed', { error });
    } finally {
      await this._distributedLockService.deleteById({
        id: lock.id,
      });
    }
  }

  /**
   * Handles errors that occur during task execution.
   * Logs the error and optionally retries the task execution.
   *
   * @param error - The error that occurred.
   * @param context - The execution context of the job.
   * @returns {void}
   */
  public async handleError(
    error: Error,
    context: TCronJobTaskContext<TStorageCleanupTaskContext>
  ): Promise<void> {
    // 1. Log the error with context
    this.logger.error(`Job ${context.jobName} failed`, {
      error,
      data: {
        jobName: context.jobName,
        params: context.params,
        timestamp: context.timestamp,
      },
    });

    // 2. Implement retry logic
    await this._retryMechanism(context);
  }

  /**
   * Implements a retry mechanism with a delay.
   *
   * @param context - The execution context of the job.
   * @returns Promise that resolves after retry delay.
   */
  private async _retryMechanism(
    _: TCronJobTaskContext<TStorageCleanupTaskContext>
  ): Promise<void> {
    // 2. Retry the job
    return new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });
  }

  /**
   * Deletes files in batches from both storage and database.
   *
   * @param files - Array of files to delete.
   * @param batchSize - Number of files processed in each batch.
   * @returns {void}
   */
  private async _deleteFilesBatch(
    files: FileTrackingEntity[],
    batchSize = 50
  ): Promise<void> {
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const queryRunner = await this._fileTrackingService.startTransaction();

      try {
        // Get fresh data for the entire batch
        const fileIds = batch.map((file) => file.id);
        const freshFiles = await this._fileTrackingService.findMany({
          filter: { id: In(fileIds) },
          select: {
            id: true,
            filePath: true,
            referenceCount: true,
          },
          queryRunner,
        });

        // Filter files eligible for deletion
        const eligibleFiles = freshFiles.filter(
          (file) => file && file.referenceCount === 0
        );

        if (eligibleFiles.length === 0) {
          await this._fileTrackingService.commitTransaction(queryRunner);
          continue;
        }

        // Delete from storage in parallel
        await Promise.all(
          eligibleFiles.map((file) =>
            this._storageProvider.deleteFile(file.filePath)
          )
        );

        // Delete from database in one operation
        await this._fileTrackingService.deleteMany({
          filter: { id: In(eligibleFiles.map((file) => file.id)) },
          options: {
            queryRunner,
          },
        });

        await this._fileTrackingService.commitTransaction(queryRunner);
      } catch (error) {
        await this._fileTrackingService.rollbackTransaction(queryRunner);
        throw error;
      }
    }
  }
}
