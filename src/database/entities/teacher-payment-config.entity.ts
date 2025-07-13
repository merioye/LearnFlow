import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';

import {
  Currency,
  PaymentConfigVerificationStatus,
  PaymentProvider,
  TPaymentConfigVerificationData,
  TPaymentMethodWebhookConfig,
  TPaymentProviderAccountCredentials,
  TPaymentSettlementConfig,
  TPayoutConfig,
} from '@/modules/app/payments';

import { PriceTransformer } from '../utils';
import { BaseEntity } from './base';
import { UserEntity } from './user.entity';

/**
 * Teacher-specific payment configurations
 * Defines how each teacher receives payments
 */
@Entity('tbl_teacher_payment_configs')
@Unique(['teacherId', 'provider'])
@Index(['teacherId', 'isDefault'])
export class TeacherPaymentConfigEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'teacher_id' })
  teacher: UserEntity;

  @Column({ name: 'teacher_id' })
  @Index()
  teacherId: number;

  @Column({
    type: 'varchar',
    comment: 'Payment provider',
  })
  @Index()
  provider: PaymentProvider;

  @Column({
    type: 'varchar',
    name: 'provider_account_id',
    comment: 'Teacher account ID with the payment provider',
  })
  providerAccountId: string;

  @Column({
    name: 'account_credentials',
    type: 'jsonb',
    nullable: true,
    comment: 'Account credentials or tokens (encrypted)',
  })
  accountCredentials: TPaymentProviderAccountCredentials | null;

  @Column({
    name: 'is_default',
    default: false,
    comment: 'Whether this is the teacher default payment provider',
  })
  @Index()
  isDefault: boolean;

  @Column({
    name: 'is_active',
    default: true,
    comment: 'Whether this configuration is active',
  })
  @Index()
  isActive: boolean;

  @Column({
    name: 'commission_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment:
      'Custom commission rate for this teacher (overrides system default)',
  })
  commissionRate: number | null;

  @Column({
    name: 'settlement_config',
    type: 'jsonb',
    nullable: true,
    comment: 'Settlement configuration',
  })
  settlementConfig: TPaymentSettlementConfig | null;

  @Column({
    name: 'payout_config',
    type: 'jsonb',
    nullable: true,
    comment: 'Payout configuration',
  })
  payoutConfig: TPayoutConfig | null;

  @Column({
    name: 'supported_currencies',
    type: 'simple-array',
    default: [],
    comment: 'Supported currencies for this teacher-provider combination',
  })
  supportedCurrencies: Currency[];

  @Column({
    name: 'webhook_config',
    type: 'jsonb',
    nullable: true,
    comment: 'Webhook configuration for this teacher',
  })
  webhookConfig: TPaymentMethodWebhookConfig | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Additional provider-specific settings',
  })
  settings: Record<string, any> | null;

  @Column({
    type: 'varchar',
    name: 'verification_status',
    default: PaymentConfigVerificationStatus.PENDING,
    comment: 'KYC/Verification status',
  })
  verificationStatus: PaymentConfigVerificationStatus;

  @Column({
    name: 'verification_data',
    type: 'jsonb',
    nullable: true,
    comment: 'Verification documents or details',
  })
  verificationData: TPaymentConfigVerificationData | null;

  @Column({
    name: 'activated_at',
    type: 'timestamp',
    nullable: true,
    comment: 'Configuration activation date',
  })
  activatedAt: Date | null;

  @Column({
    name: 'last_payout_at',
    type: 'timestamp',
    nullable: true,
    comment: 'Last successful payout date',
  })
  lastPayoutAt: Date | null;

  @Column({
    name: 'total_payout_amount',
    type: 'decimal',
    precision: 19,
    scale: 4,
    default: 0,
    comment: 'Total amount paid out to this teacher',
    transformer: new PriceTransformer(),
  })
  totalPayoutAmount: number;

  @Column({
    type: 'char',
    default: Currency.USD,
    length: 3,
    comment: 'ISO Currency code',
  })
  currency: Currency;
}
