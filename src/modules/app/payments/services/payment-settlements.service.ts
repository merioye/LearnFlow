import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
import { PaymentSettlementEntity } from '@/database';
import { BaseTypeOrmService } from '@/database/services';

/**
 * Service class for managing payment settlements
 * @class PaymentSettlementsService
 * @extends BaseTypeOrmService<PaymentSettlementEntity>
 */
@Injectable()
export class PaymentSettlementsService extends BaseTypeOrmService<PaymentSettlementEntity> {
  public constructor(
    @InjectDateTime() dateTime: IDateTime,
    @InjectDataSource() dataSource: DataSource
  ) {
    super(dateTime, dataSource, PaymentSettlementEntity, {
      softDelete: false,
    });
  }
}
