import { Column, Entity, Index } from 'typeorm';

import {
  Currency,
  PaymentMethod,
  PaymentProvider,
  TPaymentMethodAmountLimits,
  TPaymentMethodConfig,
  TPaymentMethodFeeStructure,
  TPaymentMethodRateLimitConfig,
  TPaymentMethodWebhookConfig,
} from '@/modules/app/payments';

import { BaseEntity } from './base';

/**
 * System-wide payment method configurations
 * Stores global settings for each payment provider
 */
@Entity('tbl_payment_method_configs')
export class PaymentMethodConfigEntity extends BaseEntity {
  @Column({
    type: 'varchar',
    comment: 'Payment provider',
    unique: true,
  })
  @Index()
  provider: PaymentProvider;

  @Column({
    name: 'supported_methods',
    type: 'simple-array',
    default: [],
    comment: 'Payment methods supported by this provider',
  })
  supportedMethods: PaymentMethod[];

  @Column({
    name: 'is_active',
    default: true,
    comment: 'Whether this provider is active',
  })
  @Index()
  isActive: boolean;

  @Column({
    type: 'jsonb',
    comment: 'Configuration for the provider',
  })
  configuration: TPaymentMethodConfig;

  @Column({
    name: 'supported_currencies',
    type: 'simple-array',
    default: [],
    comment: 'Supported currencies by this provider',
  })
  supportedCurrencies: Currency[];

  @Column({
    name: 'amount_limits',
    type: 'jsonb',
    nullable: true,
    comment: 'Minimum and maximum amounts per currency',
  })
  amountLimits: TPaymentMethodAmountLimits | null;

  @Column({
    name: 'fee_structure',
    type: 'jsonb',
    nullable: true,
    comment: 'Processing fees configuration',
  })
  feeStructure: TPaymentMethodFeeStructure | null;

  @Column({
    name: 'webhook_config',
    type: 'jsonb',
    nullable: true,
    comment: 'Webhook configuration',
  })
  webhookConfig: TPaymentMethodWebhookConfig | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Additional provider-specific settings',
  })
  settings: Record<string, any> | null;

  @Column({ default: 0, comment: 'Priority order for provider selection' })
  priority: number;

  @Column({
    name: 'rate_limit_config',
    type: 'jsonb',
    nullable: true,
    comment: 'Rate limiting configuration',
  })
  rateLimitConfig: TPaymentMethodRateLimitConfig | null;
}
