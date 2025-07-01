import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
import { SubscriptionTierPermissionEntity } from '@/database';
import { BaseTypeOrmService } from '@/database/services';

/**
 * Service for managing subscription tier permissions
 *
 * @class SubscriptionTiersPermissionsService
 * @extends {BaseTypeOrmService}
 */
@Injectable()
export class SubscriptionTiersPermissionsService extends BaseTypeOrmService<SubscriptionTierPermissionEntity> {
  public constructor(
    @InjectDateTime() dateTime: IDateTime,
    @InjectDataSource() dataSource: DataSource
  ) {
    super(dateTime, dataSource, SubscriptionTierPermissionEntity, {
      softDelete: false,
    });
  }
}
