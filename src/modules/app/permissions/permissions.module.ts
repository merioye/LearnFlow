import { Module } from '@nestjs/common';

import { PermissionsController } from './permissions.controller';
import {
  PermissionGroupsService,
  PermissionsService,
  UserPermissionsService,
} from './services';

/**
 * This module handles permission-related functionality, including services for managing permissions,
 * permission groups, and their relationships with user entities.
 *
 * @module PermissionsModule
 */
@Module({
  controllers: [PermissionsController],
  providers: [
    PermissionsService,
    PermissionGroupsService,
    UserPermissionsService,
  ],
  exports: [UserPermissionsService],
})
export class PermissionsModule {}
