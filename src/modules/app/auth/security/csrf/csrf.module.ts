import { Global, Module } from '@nestjs/common';

import { CsrfController } from './csrf.controller';
import { CsrfGuard } from './guards';
import { CsrfService } from './services';

/**
 * Global module providing CSRF protection functionality
 *
 * @module CsrfModule
 */
@Global()
@Module({
  controllers: [CsrfController],
  providers: [CsrfService, CsrfGuard],
  exports: [CsrfService, CsrfGuard],
})
export class CsrfModule {}
