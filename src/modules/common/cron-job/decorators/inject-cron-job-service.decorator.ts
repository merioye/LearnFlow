import { Inject } from '@nestjs/common';

import { CRON_JOB_SERVICE } from '../constants';

/**
 * Custom decorator to inject the cron job service instance.
 *
 * This is a shorthand for `@Inject(CRON_JOB_SERVICE)` and can be used to
 * inject the service that handles the registration, execution, and management
 * of cron jobs within the application.
 *
 * @returns A property and parameter decorator that injects the cron job service.
 */
export const InjectCronJobService = (): PropertyDecorator &
  ParameterDecorator => Inject(CRON_JOB_SERVICE);
