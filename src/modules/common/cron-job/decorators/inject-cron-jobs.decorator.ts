import { Inject } from '@nestjs/common';

import { CRON_JOBS } from '../constants';

/**
 * Custom decorator to inject the list of registered cron jobs.
 *
 * This is a shorthand for `@Inject(CRON_JOBS)` and can be used to
 * inject an array or collection of cron job definitions that are
 * registered within the application.
 *
 * Useful for dynamically managing or iterating over all available cron jobs.
 *
 * @returns A property and parameter decorator that injects the registered cron jobs.
 */
export const InjectCronJobs = (): PropertyDecorator & ParameterDecorator =>
  Inject(CRON_JOBS);
