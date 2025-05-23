import { Module } from '@nestjs/common';

import { HealthModule } from './health';

/**
 * The ApplicationModule is a module that contains all the api related features and
 * services.
 *
 * @module ApplicationModule
 */
@Module({
  imports: [HealthModule],
})
export class ApplicationModule {}
