import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
import { PaymentTransactionEntity } from '@/database';
import { BaseTypeOrmService } from '@/database/services';

import { PaymentStatus } from '../enums';

/**
 * Service class for managing payment transactions
 * @class PaymentTransactionsService
 * @extends BaseTypeOrmService<PaymentTransactionEntity>
 */
@Injectable()
export class PaymentTransactionsService extends BaseTypeOrmService<PaymentTransactionEntity> {
  public constructor(
    @InjectDateTime() dateTime: IDateTime,
    @InjectDataSource() dataSource: DataSource
  ) {
    super(dateTime, dataSource, PaymentTransactionEntity, {
      softDelete: false,
    });
  }

  /**
   * Check if transaction was successful
   * @param status - The status to check
   * @returns True if the transaction was successful, false otherwise
   */
  public isSuccessful(status: PaymentStatus): boolean {
    return status === PaymentStatus.COMPLETED;
  }

  /**
   * Check if transaction failed
   * @param status - The status to check
   * @returns True if the transaction failed, false otherwise
   */
  public isFailed(status: PaymentStatus): boolean {
    return [
      PaymentStatus.FAILED,
      PaymentStatus.CANCELLED,
      PaymentStatus.EXPIRED,
    ].includes(status);
  }

  /**
   * Get processing duration in a human-readable format
   * @param processingDurationMs - The processing duration in milliseconds
   * @returns The processing duration in a human-readable format
   */
  public getProcessingDuration(processingDurationMs: number): string {
    if (!processingDurationMs) return 'N/A';

    if (processingDurationMs < 1000) {
      return `${processingDurationMs}ms`;
    } else if (processingDurationMs < 60000) {
      return `${(processingDurationMs / 1000).toFixed(1)}s`;
    } else {
      return `${(processingDurationMs / 60000).toFixed(1)}m`;
    }
  }
}
