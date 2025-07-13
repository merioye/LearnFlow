import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import {
  Currency,
  PaymentProvider,
  PaymentStatus,
  ProviderTransactionType,
} from '@/modules/app/payments';

import { PriceTransformer } from '../utils';
import { BaseEntity } from './base';
import { PaymentEntity } from './payment.entity';

/**
 * Represents individual transaction attempts for a payment
 * Tracks the detailed transaction history and provider interactions
 */
@Entity('tbl_payment_transactions')
@Index(['paymentId', 'createdAt'])
@Index(['status', 'createdAt'])
export class PaymentTransactionEntity extends BaseEntity {
  /**
   * Associated payment
   */
  @ManyToOne(() => PaymentEntity, (payment) => payment.transactions, {
    nullable: false,
  })
  @JoinColumn({ name: 'payment_id' })
  payment: PaymentEntity;

  @Column({ name: 'payment_id' })
  @Index()
  paymentId: number;

  @Column({
    type: 'varchar',
    name: 'transaction_type',
    length: 50,
    comment: 'Transaction type (attempt, refund, capture, etc.)',
  })
  @Index()
  transactionType: ProviderTransactionType;

  @Column({
    type: 'varchar',
    comment: 'Payment provider used for this transaction',
  })
  @Index()
  provider: PaymentProvider;

  @Column({
    type: 'varchar',
    name: 'provider_transaction_id',
    nullable: true,
    comment: 'Provider-specific transaction ID',
  })
  @Index()
  providerTransactionId: string | null;

  @Column({
    type: 'decimal',
    precision: 19,
    scale: 4,
    comment: 'Transaction amount in standard currency unit',
    transformer: new PriceTransformer(),
  })
  amount: number;

  @Column({
    type: 'char',
    length: 3,
    comment: 'Currency code',
  })
  currency: Currency;

  @Column({
    type: 'varchar',
    comment: 'Transaction status',
    default: PaymentStatus.PENDING,
  })
  @Index()
  status: PaymentStatus;

  @Column({
    name: 'request_payload',
    type: 'jsonb',
    nullable: true,
    comment: 'Request payload sent to provider',
  })
  requestPayload: Record<string, any> | null;

  @Column({
    name: 'response_payload',
    type: 'jsonb',
    nullable: true,
    comment: 'Response received from provider',
  })
  responsePayload: Record<string, any> | null;

  @Column({
    type: 'varchar',
    name: 'error_code',
    nullable: true,
    comment: 'Error details if transaction failed',
  })
  errorCode: string | null;

  @Column({
    type: 'varchar',
    name: 'error_message',
    nullable: true,
    length: 1000,
    comment: 'Error message if transaction failed',
  })
  errorMessage: string | null;

  @Column({
    name: 'provider_fee',
    type: 'decimal',
    precision: 19,
    scale: 4,
    nullable: true,
    comment: 'Provider fees in standard currency unit for this transaction',
    transformer: new PriceTransformer(),
  })
  providerFee: number | null;

  @Column({
    type: 'varchar',
    name: 'idempotency_key',
    unique: true,
    nullable: true,
    comment: 'Idempotency key for this transaction',
  })
  idempotencyKey: string | null;

  @Column({
    name: 'processing_duration_ms',
    type: 'integer',
    nullable: true,
    comment: 'Processing duration in milliseconds',
  })
  processingDurationMs: number | null;

  @Column({
    name: 'retry_attempt',
    type: 'integer',
    default: 0,
    comment: 'Retry attempt number (0 for first attempt)',
  })
  retryAttempt: number;

  @Column({
    type: 'int',
    name: 'parent_transaction_id',
    nullable: true,
    comment: 'Parent transaction ID for retries/related transactions',
  })
  @Index()
  parentTransactionId: number | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Additional metadata',
  })
  metadata: Record<string, any> | null;

  @Column({
    name: 'started_at',
    type: 'timestamp',
    nullable: true,
    comment: 'Timestamp when transaction started',
  })
  startedAt: Date | null;

  @Column({
    name: 'completed_at',
    type: 'timestamp',
    nullable: true,
    comment: 'Timestamp when transaction completed',
  })
  completedAt: Date | null;
}
