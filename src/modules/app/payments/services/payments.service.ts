import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
import { PaymentEntity } from '@/database';
import { BaseTypeOrmService } from '@/database/services';

import { PaymentStatus } from '../enums';

/**
 * Service class for managing payments
 * @class PaymentsService
 * @extends BaseTypeOrmService<PaymentEntity>
 */
@Injectable()
export class PaymentsService extends BaseTypeOrmService<PaymentEntity> {
  public constructor(
    @InjectDateTime() dateTime: IDateTime,
    @InjectDataSource() dataSource: DataSource
  ) {
    super(dateTime, dataSource, PaymentEntity, {
      softDelete: false,
    });
  }

  /**
   * Check if payment can be refunded
   * @param status - The status to check
   * @returns True if the payment can be refunded, false otherwise
   */
  public canBeRefunded(
    status: PaymentStatus,
    refundedAt: Date | null
  ): boolean {
    return status === PaymentStatus.COMPLETED && !refundedAt;
  }

  /**
   * Check if payment is in a final state
   * @param status - The status to check
   * @returns True if the payment is in a final state, false otherwise
   */
  public isInFinalState(status: PaymentStatus): boolean {
    return [
      PaymentStatus.COMPLETED,
      PaymentStatus.FAILED,
      PaymentStatus.CANCELLED,
      PaymentStatus.REFUNDED,
      PaymentStatus.EXPIRED,
    ].includes(status);
  }
}
