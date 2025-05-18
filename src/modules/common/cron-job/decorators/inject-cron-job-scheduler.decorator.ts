import { Inject } from '@nestjs/common';

import { CRON_JOB_SCHEDULER } from '../constants';

/**
 * Custom decorator to inject the cron job scheduler instance.
 *
 * This is a shorthand for `@Inject(CRON_JOB_SCHEDULER)` and can be used to
 * inject the scheduler responsible for managing and executing cron jobs.
 *
 * @returns A property and parameter decorator that injects the cron job scheduler.
 */
export const InjectCronJobScheduler = (): PropertyDecorator &
  ParameterDecorator => Inject(CRON_JOB_SCHEDULER);
