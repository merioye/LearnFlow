import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import {
  Currency,
  PayoutMethod,
  SettlementStatus,
  TSettlementItem,
} from '@/modules/app/payments';

import { PriceTransformer } from '../utils';
import { BaseEntity } from './base';
import { PaymentEntity } from './payment.entity';
import { TeacherPaymentConfigEntity } from './teacher-payment-config.entity';
import { UserEntity } from './user.entity';

/**
 * Represents settlement of funds to vendors
 * Tracks the process of transferring net amounts to vendor accounts
 */
@Entity('tbl_payment_settlements')
@Index(['teacherId', 'status'])
@Index(['status', 'createdAt'])
export class PaymentSettlementEntity extends BaseEntity {
  @Column({
    unique: true,
    name: 'settlement_id',
    comment: 'Settlement identification (Human-readable settlement ID)',
  })
  @Index()
  settlementId: string;

  /**
   * Associated payment being settled
   */
  @ManyToOne(() => PaymentEntity, (payment) => payment.settlements, {
    nullable: false,
  })
  @JoinColumn({ name: 'payment_id' })
  payment: PaymentEntity;

  @Column({ name: 'payment_id', comment: 'Payment reference ID' })
  @Index()
  paymentId: number;

  /**
   * Teacher receiving the settlement
   */
  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'teacher_id' })
  teacher: UserEntity;

  @Column({ name: 'teacher_id', comment: 'Teacher reference ID' })
  @Index()
  teacherId: number;

  /**
   * Teacher payment configuration used for settlement
   */
  @ManyToOne(() => TeacherPaymentConfigEntity, { nullable: false })
  @JoinColumn({ name: 'teacher_config_id' })
  teacherConfig: TeacherPaymentConfigEntity;

  @Column({ name: 'teacher_config_id', comment: 'Teacher payment config ID' })
  teacherConfigId: number;

  /**
   * Settlement amounts
   */
  @Column({
    name: 'gross_amount',
    type: 'decimal',
    precision: 19,
    scale: 4,
    comment: 'Total sales amount',
    transformer: new PriceTransformer(),
  })
  grossAmount: number;

  @Column({
    name: 'commission_amount',
    type: 'decimal',
    precision: 19,
    scale: 4,
    comment: 'Admin commission amount',
    transformer: new PriceTransformer(),
  })
  commissionAmount: number;

  @Column({
    name: 'net_amount',
    type: 'decimal',
    precision: 19,
    scale: 4,
    comment: 'Amount to be paid to teacher',
    transformer: new PriceTransformer(),
  })
  netAmount: number;

  @Column({
    type: 'char',
    length: 3,
    comment: 'Currency of the settlement',
  })
  currency: Currency;

  @Column({
    name: 'commission_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    comment: 'Commission rate applied',
  })
  commissionRate: number;

  @Column({
    name: 'processing_fees',
    type: 'decimal',
    precision: 19,
    scale: 4,
    comment: 'Payment processing fees',
    transformer: new PriceTransformer(),
  })
  processingFees: number;

  @Column({
    name: 'adjustments',
    type: 'decimal',
    precision: 19,
    scale: 4,
    comment: 'Any adjustments (refunds, chargebacks)',
    transformer: new PriceTransformer(),
  })
  adjustments: number;

  @Column({
    type: 'varchar',
    comment: 'Settlement status',
    default: SettlementStatus.PENDING,
  })
  @Index()
  status: SettlementStatus;

  @Column({
    name: 'settlement_date',
    type: 'timestamp',
    comment: 'Scheduled settlement date',
  })
  @Index()
  settlementDate: Date;

  /**
   * Actual settlement processing timestamps
   */
  @Column({
    name: 'processed_at',
    type: 'timestamp',
    nullable: true,
    comment: 'When actually processed',
  })
  processedAt: Date | null;

  @Column({
    name: 'completed_at',
    type: 'timestamp',
    nullable: true,
    comment: 'When funds transferred',
  })
  completedAt: Date | null;

  @Column({
    name: 'failed_at',
    type: 'timestamp',
    nullable: true,
    comment: 'When settlement failed',
  })
  failedAt: Date | null;

  @Column({
    type: 'varchar',
    name: 'provider_transaction_id',
    nullable: true,
    comment: 'Provider transaction ID for the settlement',
  })
  providerTransactionId: string | null;

  /**
   * Settlement period
   */
  @Column({
    name: 'period_start',
    type: 'timestamp',
    comment: 'Start of the settlement period',
  })
  periodStart: Date;

  @Column({
    name: 'period_end',
    type: 'timestamp',
    comment: 'End of the settlement period',
  })
  periodEnd: Date;

  /**
   * Payout details
   */
  @Column({
    type: 'varchar',
    name: 'payout_method',
    nullable: true,
    comment: 'Payout method used',
  })
  payoutMethod: PayoutMethod | null;

  @Column({
    type: 'int',
    name: 'payout_transaction_id',
    nullable: true,
    comment: 'Payout transaction ID',
  })
  payoutTransactionId: number | null;

  @Column({
    type: 'varchar',
    name: 'payout_reference',
    nullable: true,
    comment: 'Bank reference or similar',
  })
  payoutReference: string | null;

  @Column({
    name: 'settlement_items',
    type: 'jsonb',
    nullable: true,
    comment: 'Breakdown of settlement items',
  })
  settlementItems?: TSettlementItem[] | null;

  /**
   * Error handling
   */
  @Column({
    name: 'error_message',
    type: 'text',
    nullable: true,
    comment: 'Error message',
  })
  errorMessage: string | null;

  @Column({
    name: 'retry_count',
    type: 'int',
    default: 0,
    comment: 'Number of retries',
  })
  retryCount: number;

  @Column({
    name: 'next_retry_at',
    type: 'timestamp',
    nullable: true,
    comment: 'When to retry',
  })
  nextRetryAt: Date | null;

  @Column({
    name: 'metadata',
    type: 'jsonb',
    nullable: true,
    comment: 'Additional metadata',
  })
  metadata: Record<string, any> | null;
}
