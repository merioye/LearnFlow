import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
import { FileTrackingEntity } from '@/database';
import { BaseTypeOrmService } from '@/database/services';

/**
 * Service class for managing files tracking
 * @class FileTrackingService
 * @extends BaseTypeOrmService<FileTrackingEntity>
 */
@Injectable()
export class FileTrackingService extends BaseTypeOrmService<FileTrackingEntity> {
  public constructor(
    @InjectDateTime() dateTime: IDateTime,
    @InjectDataSource() dataSource: DataSource
  ) {
    super(dateTime, dataSource, FileTrackingEntity, {
      softDelete: false,
    });
  }
}
