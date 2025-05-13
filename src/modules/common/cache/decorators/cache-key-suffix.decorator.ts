import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { CACHE_KEY_SUFFIX_DECORATOR_KEY } from '../constants';
import { TCacheKeySuffixType } from '../types';

/**
 * Decorator to define cache key suffix generation
 * @param {TCacheKeySuffixType} keySuffix - Key suffix or function to generate suffix
 * @returns {CustomDecorator<string>}
 */
export const CacheKeySuffix = (
  keySuffix: TCacheKeySuffixType
): CustomDecorator<string> =>
  SetMetadata(CACHE_KEY_SUFFIX_DECORATOR_KEY, keySuffix);
