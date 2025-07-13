import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import {
  Currency,
  PaymentFlowType,
  PaymentMethod,
  PaymentStatus,
  TransactionType,
} from '@/modules/app/payments';
import { PaymentUtils } from '@/modules/app/payments/utils';

import { PriceTransformer } from '../utils';
import { BaseEntity } from './base';
import { PaymentSettlementEntity } from './payment-settlement.entity';
import { PaymentTransactionEntity } from './payment-transaction.entity';
import { RefundRequestEntity } from './refund-request.entity';
import { SubscriptionTierEntity } from './subscription-tier.entity';
import { UserEntity } from './user.entity';
import { WebhookLogEntity } from './webhook-log.entity';

/**
 * Payment entity representing all payment transactions in the system
 * Serves as the central record for both one-time and subscription payments
 */
@Entity('tbl_payments')
@Index(['userId', 'status'])
@Index(['paymentMethod', 'status'])
@Index(['createdAt'])
@Index(['providerTransactionId'], {
  unique: true,
  where: 'provider_transaction_id IS NOT NULL',
})
export class PaymentEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.payments, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'user_id', comment: 'User who initiated the payment' })
  @Index()
  userId: number;

  @Column({
    name: 'payment_type',
    type: 'text',
    default: TransactionType.ONE_TIME,
    comment: 'Payment type classification',
  })
  @Index()
  paymentType: TransactionType;

  @Column({
    name: 'flow_type',
    type: 'text',
    default: PaymentFlowType.ADMIN_FEE_MODEL,
    comment: 'Payment flow type for routing decisions',
  })
  flowType: PaymentFlowType;

  @Column({
    type: 'int',
    name: 'item_id',
    nullable: true,
    comment:
      'Reference to the item being purchased (courseId, subscriptionId, etc.)',
  })
  @Index()
  itemId: number | null;

  /**
   * Associated subscription for subscription payments
   */
  @ManyToOne(() => SubscriptionTierEntity, {
    nullable: true,
  })
  @JoinColumn({ name: 'subscription_tier_id' })
  subscriptionTier: SubscriptionTierEntity | null;

  @Column({
    type: 'int',
    name: 'subscription_tier_id',
    nullable: true,
    comment: 'Reference to the subscription being purchased',
  })
  subscriptionTierId: number | null;

  @Column({
    type: 'int',
    name: 'teacher_id',
    nullable: true,
    comment: 'Reference to the teacher being paid (for multi-vendor scenarios)',
  })
  @Index()
  teacherId: number | null;

  @Column({
    type: 'decimal',
    precision: 19,
    scale: 4,
    comment: 'Payment amount in standard currency unit (for convenience)',
    transformer: new PriceTransformer(),
  })
  amount: number;

  @Column({
    type: 'char',
    default: Currency.USD,
    length: 3,
    comment: 'Currency code (ISO 4217)',
  })
  @Index()
  currency: Currency;

  @Column({
    name: 'payment_method',
    type: 'text',
    comment: 'Payment method used',
  })
  @Index()
  paymentMethod: PaymentMethod;

  @Column({
    type: 'varchar',
    name: 'provider_transaction_id',
    nullable: true,
    comment: 'Payment provider transaction ID',
  })
  providerTransactionId: string | null;

  @Column({
    type: 'varchar',
    name: 'provider_customer_id',
    nullable: true,
    comment: 'Payment provider customer ID',
  })
  providerCustomerId: string | null;

  @Column({
    type: 'text',
    default: PaymentStatus.PENDING,
    comment: 'Current payment status',
  })
  @Index()
  status: PaymentStatus;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 500,
    comment: 'Payment description',
  })
  description: string | null;

  @Column({
    name: 'payment_reference',
    type: 'varchar',
    unique: true,
    comment: 'Unique payment reference for tracking',
  })
  @Index()
  paymentReference: string;

  @Column({
    type: 'varchar',
    name: 'success_url',
    nullable: true,
    length: 2048,
    comment: 'Success URL for redirect-based payments',
  })
  successUrl: string | null;

  @Column({
    type: 'varchar',
    name: 'cancel_url',
    nullable: true,
    length: 2048,
    comment: 'Cancel URL for redirect-based payments',
  })
  cancelUrl: string | null;

  @Column({
    type: 'varchar',
    name: 'client_secret',
    nullable: true,
    comment: 'Client secret for client-side completion',
  })
  clientSecret: string | null;

  @Column({ type: 'jsonb', nullable: true, comment: 'Additional metadata' })
  metadata: Record<string, any> | null;

  @Column({
    name: 'failure_reason',
    type: 'varchar',
    nullable: true,
    length: 1000,
    comment: 'Failure reason if payment failed',
  })
  failureReason: string | null;

  @Column({
    type: 'varchar',
    name: 'provider_error_code',
    nullable: true,
    comment: 'Provider-specific error code',
  })
  providerErrorCode: string | null;

  @Column({
    name: 'commission_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: 'Commission rate applied (for multi-vendor)',
  })
  commissionRate: number | null;

  @Column({
    name: 'commission_amount',
    type: 'decimal',
    precision: 19,
    scale: 4,
    nullable: true,
    comment: 'Commission amount in standard currency unit',
    transformer: new PriceTransformer(),
  })
  commissionAmount: number | null;

  @Column({
    name: 'net_amount',
    type: 'decimal',
    precision: 19,
    scale: 4,
    nullable: true,
    comment: 'Net amount in standard currency unit',
    transformer: new PriceTransformer(),
  })
  netAmount: number | null;

  @Column({
    name: 'processed_at',
    type: 'timestamp',
    nullable: true,
    comment: 'Timestamp when payment was processed',
  })
  processedAt: Date | null;

  @Column({
    name: 'failed_at',
    type: 'timestamp',
    nullable: true,
    comment: 'Timestamp when payment failed',
  })
  failedAt: Date | null;

  @Column({
    name: 'refunded_at',
    type: 'timestamp',
    nullable: true,
    comment: 'Timestamp when payment was refunded',
  })
  refundedAt: Date | null;

  @Column({
    name: 'expires_at',
    type: 'timestamp',
    nullable: true,
    comment: 'Timestamp when payment expires',
  })
  @Index()
  expiresAt: Date | null;

  /**
   * Relations
   */
  @OneToMany(
    () => PaymentTransactionEntity,
    (transaction) => transaction.payment
  )
  transactions: PaymentTransactionEntity[];

  @OneToMany(() => PaymentSettlementEntity, (settlement) => settlement.payment)
  settlements: PaymentSettlementEntity[];

  @OneToMany(() => RefundRequestEntity, (refund) => refund.payment)
  refundRequests: RefundRequestEntity[];

  @OneToMany(() => WebhookLogEntity, (webhook) => webhook.payment)
  webhookLogs: WebhookLogEntity[];

  /**
   * Lifecycle hooks
   */
  @BeforeInsert()
  protected _beforeInsert(): void {
    if (!this.paymentReference) {
      this.paymentReference = PaymentUtils.generatePaymentReference('PAY');
    }
    this._calculateCommissionAndNetAmount();
  }

  @BeforeUpdate()
  protected _beforeUpdate(): void {
    this._calculateCommissionAndNetAmount();
  }

  /**
   * Calculate commission and net amounts
   * @returns {void}
   */
  private _calculateCommissionAndNetAmount(): void {
    if (
      this.commissionRate &&
      this.flowType === PaymentFlowType.ADMIN_FEE_MODEL
    ) {
      this.commissionAmount = PaymentUtils.calculateCommission(
        this.amount,
        this.commissionRate
      );

      this.netAmount = PaymentUtils.calculateNetAmount(
        this.amount,
        this.commissionRate
      );
    } else {
      this.commissionAmount = 0;
      this.netAmount = this.amount;
    }
  }
}
