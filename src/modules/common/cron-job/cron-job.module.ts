import { DynamicModule, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import {
  CRON_JOB_GLOBAL_OPTIONS,
  CRON_JOB_SCHEDULER,
  CRON_JOB_SERVICE,
  CRON_JOBS,
} from './constants';
import { NestScheduleScheduler } from './schedulers';
import { CronJobService } from './services';
import { TCronJobModuleOptions } from './types';

/**
 * Global Cron Job Module for NestJS
 * @module CronJobModule
 */
@Module({})
export class CronJobModule {
  /**
   * Registers the CronJobModule with the provided options
   * @param options - Options to configure the cron job module
   * @returns {DynamicModule} Configured NestJS dynamic module
   */
  static register(options: TCronJobModuleOptions): DynamicModule {
    return {
      global: true,
      module: CronJobModule,
      imports: [ScheduleModule.forRoot()],
      providers: [
        {
          provide: CRON_JOB_SCHEDULER,
          useClass: NestScheduleScheduler,
        },
        {
          provide: CRON_JOBS,
          useValue: options.jobs || [],
        },
        {
          provide: CRON_JOB_GLOBAL_OPTIONS,
          useValue: options.globalOptions,
        },
        {
          provide: CRON_JOB_SERVICE,
          useClass: CronJobService,
        },
      ],
      exports: [CRON_JOB_SERVICE],
    };
  }
}
