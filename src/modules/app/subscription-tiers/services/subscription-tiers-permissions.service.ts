import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { BaseTypeOrmService } from '@/database/services';
import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
import { DataSource } from 'typeorm';

import { SubscriptionTierPermissionEntity } from '@/database';

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
