import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
import { RefundRequestEntity } from '@/database';
import { BaseTypeOrmService } from '@/database/services';

/**
 * Service class for managing refund requests
 * @class RefundRequestsService
 * @extends BaseTypeOrmService<RefundRequestEntity>
 */
@Injectable()
export class RefundRequestsService extends BaseTypeOrmService<RefundRequestEntity> {
  public constructor(
    @InjectDateTime() dateTime: IDateTime,
    @InjectDataSource() dataSource: DataSource
  ) {
    super(dateTime, dataSource, RefundRequestEntity, {
      softDelete: false,
    });
  }
}
