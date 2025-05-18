import { Inject } from '@nestjs/common';

import { LOGGER } from '../constants';

/**
 * Custom decorator to inject a logger instance.
 *
 * This is a shorthand for `@Inject(LOGGER)` and can be used to inject
 * a logging service or logger instance into classes for logging purposes.
 *
 * @returns A property and parameter decorator that injects the logger.
 */
export const InjectLogger = (): PropertyDecorator & ParameterDecorator =>
  Inject(LOGGER);
