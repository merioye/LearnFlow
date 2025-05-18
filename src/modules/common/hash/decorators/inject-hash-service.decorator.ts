import { Inject } from '@nestjs/common';

import { HASH_SERVICE } from '../constants';

/**
 * Custom decorator to inject the hash service instance.
 *
 * This is a shorthand for `@Inject(HASH_SERVICE)` and can be used to
 * inject a service responsible for hashing operations, such as password hashing,
 * data integrity checks, or cryptographic functions.
 *
 * @returns A property and parameter decorator that injects the hash service.
 */
export const InjectHashService = (): PropertyDecorator & ParameterDecorator =>
  Inject(HASH_SERVICE);
