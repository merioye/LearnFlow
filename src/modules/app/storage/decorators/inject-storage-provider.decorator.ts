import { Inject } from '@nestjs/common';

import { STORAGE_PROVIDER } from '../constants';

/**
 * Custom decorator to inject the storage provider instance.
 *
 * This is a shorthand for `@Inject(STORAGE_PROVIDER)` and can be used to
 * inject the storage provider responsible for managing and executing storage operations.
 *
 * @returns A property and parameter decorator that injects the storage provider.
 */
export const InjectStorageProvider = (): PropertyDecorator &
  ParameterDecorator => Inject(STORAGE_PROVIDER);
