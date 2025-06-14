import { Global, Inject, Module } from '@nestjs/common';
import { CRON_JOB_SERVICE, ICronJobService } from '@/modules/common/cron-job';

import { CronJobTask } from '@/enums';

import { STORAGE_PROVIDER } from './constants';
import { FileTrackingService } from './services';
import { S3StorageProvider } from './storage-providers';
import { StorageController } from './storage.controller';
import { StorageCleanupTask } from './tasks';

/**
 * The StorageModule is responsible for managing the storage operations within the application.
 * It integrates the necessary controllers and services to handle storage-related operations.
 *
 * @module StorageModule
 */
@Global()
@Module({
  controllers: [StorageController],
  providers: [
    {
      provide: STORAGE_PROVIDER,
      useClass: S3StorageProvider,
    },
    FileTrackingService,
    StorageCleanupTask,
  ],
  exports: [FileTrackingService],
})
export class StorageModule {
  public constructor(
    @Inject(CRON_JOB_SERVICE)
    private readonly _cronJobService: ICronJobService,
    private readonly _storageCleanupTask: StorageCleanupTask
  ) {
    // Register tasks
    this._cronJobService.registerTask(
      CronJobTask.STORAGE_CLEANUP,
      this._storageCleanupTask
    );
  }
}
