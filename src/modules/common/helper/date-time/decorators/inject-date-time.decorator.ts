import { Inject } from '@nestjs/common';

import { DATE_TIME } from '../constants';

/**
 * Custom decorator to inject a date-time adapter instance.
 *
 * This is a shorthand for `@Inject(DATE_TIME_ADAPTER)` and can be used to
 * inject an abstraction for date and time operations, such as formatting,
 * parsing, or timezone management.
 *
 * @returns A property and parameter decorator that injects the date-time adapter.
 */
export const InjectDateTime = (): PropertyDecorator & ParameterDecorator =>
  Inject(DATE_TIME);
