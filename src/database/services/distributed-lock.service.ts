import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
import { DataSource } from 'typeorm';

import { DistributedLockEntity } from '../entities';
import { BaseTypeOrmService } from './base-typeorm.service';

/**
 * Service class for managing distributed locks
 * @class DistributedLockService
 * @extends BaseTypeOrmService<DistributedLockEntity>
 */
@Injectable()
export class DistributedLockService extends BaseTypeOrmService<DistributedLockEntity> {
  public constructor(
    @InjectDateTime() dateTime: IDateTime,
    @InjectDataSource() dataSource: DataSource
  ) {
    super(dateTime, dataSource, DistributedLockEntity, {
      softDelete: false,
    });
  }
}
