import { Global, Module } from '@nestjs/common';

import { HASH_SERVICE } from './constants';
import { CryptoHashService } from './services';

/**
 * Hash Module for NestJS providing centralized hashing functionality
 * @module HashModule
 */
@Global()
@Module({
  providers: [
    {
      provide: HASH_SERVICE,
      useClass: CryptoHashService,
    },
  ],
  exports: [HASH_SERVICE],
})
export class HashModule {}
