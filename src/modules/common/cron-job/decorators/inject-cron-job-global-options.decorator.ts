import { Inject } from '@nestjs/common';

import { CRON_JOB_GLOBAL_OPTIONS } from '../constants';

/**
 * Custom decorator to inject global options for cron jobs.
 *
 * This is a shorthand for `@Inject(CRON_JOB_GLOBAL_OPTIONS)` and can be used to
 * inject configuration options into class constructors or properties that manage
 * scheduled/cron jobs across the application.
 *
 * @returns A property and parameter decorator that injects the cron job global options.
 */
export const InjectCronJobGlobalOptions = (): PropertyDecorator &
  ParameterDecorator => Inject(CRON_JOB_GLOBAL_OPTIONS);
