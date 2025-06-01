import { Global, Module } from '@nestjs/common';

import { HttpUtilityService } from './services';

/**
 * Utility Module for NestJS providing centralized utility functionality
 * @module UtilityModule
 */
@Global()
@Module({
  providers: [HttpUtilityService],
  exports: [HttpUtilityService],
})
export class UtilityModule {}
