import { Module } from '@nestjs/common';

import { AuthModule } from './auth';
import { HealthModule } from './health';
import { StorageModule } from './storage';
import { UsersModule } from './users';

/**
 * The ApplicationModule is a module that contains all the api related features and
 * services.
 *
 * @module ApplicationModule
 */
@Module({
  imports: [HealthModule, AuthModule, UsersModule, StorageModule],
})
export class ApplicationModule {}
