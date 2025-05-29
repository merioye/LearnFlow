import { Module } from '@nestjs/common';

import { CsrfModule } from './csrf';
import { CustomThrottlerModule } from './throttler';

/**
 * Security module providing security-related functionality
 */
@Module({
  imports: [CustomThrottlerModule, CsrfModule],
})
export class SecurityModule {}
