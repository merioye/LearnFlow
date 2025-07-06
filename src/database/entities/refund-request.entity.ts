import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import {
  Currency,
  PaymentStatus,
  RefundMethod,
  RefundReason,
  TRefundRequestAttachment,
} from '@/modules/app/payments';

import { BaseEntity } from './base';
import { PaymentEntity } from './payment.entity';
import { UserEntity } from './user.entity';

/**
 * Manages refund requests with approval workflows
 * Tracks refund reasons, amounts, and processing status
 */
@Entity('tbl_refund_requests')
@Index(['paymentId', 'status'])
@Index(['requestedById', 'createdAt'])
@Index(['status', 'createdAt'])
export class RefundRequestEntity extends BaseEntity {
  @Column({
    name: 'refund_id',
    unique: true,
    comment: 'Refund identification (Human-readable refund ID)',
  })
  @Index()
  refundId: string;

  /**
   * Payment reference
   */
  @ManyToOne(() => PaymentEntity, { nullable: false })
  @JoinColumn({ name: 'payment_id' })
  payment: PaymentEntity;

  @Column({ name: 'payment_id', comment: 'Payment reference ID' })
  @Index()
  paymentId: number;

  /**
   * Refund request details
   */
  @Column({
    name: 'requested_amount_cents',
    type: 'bigint',
    comment: 'Requested refund amount in cents',
  })
  requestedAmountCents: number;

  @Column({
    name: 'requested_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: 'Requested refund amount',
  })
  requestedAmount: number;

  @Column({
    name: 'approved_amount_cents',
    type: 'bigint',
    nullable: true,
    comment: 'Approved refund amount in cents',
  })
  approvedAmountCents: number | null; // May differ from requested

  @Column({
    name: 'approved_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Approved refund amount',
  })
  approvedAmount: number | null;

  @Column({
    name: 'processed_amount_cents',
    type: 'bigint',
    nullable: true,
    comment: 'Processed refund amount in cents',
  })
  processedAmountCents: number | null; // Actual refunded amount

  @Column({
    name: 'processed_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Processed refund amount',
  })
  processedAmount: number | null;

  @Column({
    type: 'varchar',
    default: Currency.USD,
    comment: 'Currency of the refund',
  })
  currency: Currency;

  /**
   * Refund reason and category
   */
  @Column({
    name: 'refund_reason',
    type: 'varchar',
    comment: 'Refund reason',
  })
  refundReason: RefundReason;

  @Column({
    name: 'refund_description',
    type: 'text',
    nullable: true,
    comment: 'Detailed reason',
  })
  refundDescription: string | null;

  @Column({
    name: 'customer_note',
    type: 'text',
    nullable: true,
    comment: 'Note of the customer',
  })
  customerNote: string | null;

  @Column({
    name: 'internal_note',
    type: 'text',
    nullable: true,
    comment: 'Internal processing note',
  })
  internalNote: string | null;

  /**
   * Request status and workflow
   */
  @Column({
    type: 'varchar',
    default: PaymentStatus.PENDING,
    comment: 'Refund request status',
  })
  @Index()
  status: PaymentStatus;

  @Column({
    name: 'requires_approval',
    default: false,
    comment: 'Whether the refund request requires approval',
  })
  requiresApproval: boolean;

  @Column({
    name: 'is_partial_refund',
    default: false,
    comment: 'Whether the refund request is partial',
  })
  isPartialRefund: boolean;

  @Column({
    name: 'refund_method',
    type: 'varchar',
    default: RefundMethod.MANUAL,
    comment: 'Refund method',
  })
  refundMethod: RefundMethod;

  /**
   * User references
   */
  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'requested_by_id' })
  requestedBy: UserEntity | null;

  @Column({ name: 'requested_by_id', nullable: true })
  requestedById: number | null;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'approved_by_id' })
  approvedBy: UserEntity | null;

  @Column({ name: 'approved_by_id', nullable: true })
  approvedById: number | null;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'processed_by_id' })
  processedBy: UserEntity | null;

  @Column({ name: 'processed_by_id', nullable: true })
  processedById: number | null;

  /**
   * Processing details
   */
  @Column({
    type: 'varchar',
    name: 'provider_refund_id',
    nullable: true,
    comment: 'Provider refund transaction ID',
  })
  providerRefundId: string | null;

  @Column({
    type: 'text',
    name: 'provider_response',
    nullable: true,
    comment: 'Provider response message',
  })
  providerResponse: string | null;

  @Column({
    name: 'processing_fee_cents',
    type: 'bigint',
    default: 0,
    comment: 'Processing fee charged for refund in cents',
  })
  processingFeeCents: number;

  @Column({
    name: 'processing_fee',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: 'Processing fee charged for refund',
  })
  processingFee: number;

  /**
   * Timestamps
   */

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date | null;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'rejected_at', type: 'timestamp', nullable: true })
  rejectedAt: Date | null;

  @Column({
    name: 'expires_at',
    type: 'timestamp',
    nullable: true,
    comment: 'Refund request expiration',
  })
  expiresAt: Date | null;

  /**
   * Error handling
   */
  @Column({ name: 'error_message', type: 'varchar', nullable: true })
  errorMessage: string | null;

  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount: number;

  @Column({ name: 'next_retry_at', type: 'timestamp', nullable: true })
  nextRetryAt: Date | null;

  /**
   * Settlement impact
   */
  @Column({
    name: 'affects_settlement',
    default: false,
    comment: 'Whether this impacts vendor settlement',
  })
  affectsSettlement: boolean;

  @Column({
    type: 'int',
    name: 'settlement_adjustment_id',
    nullable: true,
    comment: 'Reference to settlement adjustment',
  })
  settlementAdjustmentId: number | null;

  /**
   * Additional metadata
   */
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @Column({ type: 'jsonb', nullable: true })
  attachments: TRefundRequestAttachment[] | null;
}
