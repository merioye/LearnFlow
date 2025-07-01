import { Module } from '@nestjs/common';

import { AuthModule } from './auth';
import { CoursesModule } from './courses';
import { HealthModule } from './health';
import {
  NotificationsModule,
  notificationsModuleConfig,
} from './notifications';
import { StorageModule } from './storage';
import { SubscriptionTiersModule } from './subscription-tiers';
import { UsersModule } from './users';
import { WebsocketsModule } from './websockets';

/**
 * The ApplicationModule is a module that contains all the api related features and
 * services.
 *
 * @module ApplicationModule
 */
@Module({
  imports: [
    HealthModule,
    AuthModule,
    UsersModule,
    StorageModule,
    WebsocketsModule,
    NotificationsModule.forRoot(notificationsModuleConfig),
    CoursesModule,
    SubscriptionTiersModule,
  ],
})
export class ApplicationModule {}
