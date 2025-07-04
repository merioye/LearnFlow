import { PaymentStatus } from 'twilio/lib/rest/api/v2010/account/call/payment';

import {
  Currency,
  PaymentFlowType,
  PaymentMethod,
  PaymentProvider,
} from '../enums';

/**
 * Core payment amount structure with currency support
 */
export type TPaymentAmount = {
  amount: number;
  currency: Currency;
  formattedAmount?: string; // For display purposes
};

/**
 * Payment metadata for storing additional information
 */
export type TPaymentMetadata = {
  orderId?: number;
  courseId?: number;
  subscriptionId?: number;
  userId: number;
  teacherId?: number;
  flowType: PaymentFlowType;
  additionalData?: Record<string, any>;
};

/**
 * Customer information for payment processing
 */
export type TCustomerInfo = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
};

/**
 * Payment provider response structure
 */
export type TPaymentProviderResponse = {
  success: boolean;
  transactionId: number;
  providerTransactionId: string;
  status: PaymentStatus;
  amount: TPaymentAmount;
  fees?: TPaymentAmount;
  metadata?: Record<string, any>;
  redirectUrl?: string; // For hosted payment pages
  errorMessage?: string;
  errorCode?: string;
};

/**
 * Webhook event structure
 */
export type TWebhookEvent = {
  id: string;
  provider: PaymentMethod;
  eventType: string;
  data: Record<string, any>;
  timestamp: Date;
  signature: string;
};

/**
 * Configuration interface for payment providers
 * Each provider implements this to define its configuration needs
 */
export type TPaymentProviderConfig = {
  provider: PaymentProvider;
  apiKey: string;
  secretKey: string;
  webhookSecret: string;
  environment: 'sandbox' | 'production';
  additionalConfig?: Record<string, any>;
};

/**
 * Teacher-specific payment configuration
 * Defines how a teacher receives payments
 */
export type TTeacherPaymentConfig = {
  teacherId: number;
  defaultProvider: PaymentProvider;
  providerConfigs: Map<PaymentProvider, TTeacherProviderConfig>;
  commissionRate?: number; // Override default commission
  settlementDelay?: number; // Days to hold funds
  autoSettlement: boolean;
};

/**
 * Teacher's configuration for a specific payment provider
 */
export type TTeacherProviderConfig = {
  provider: PaymentProvider;
  accountId: string; // Teacher's account ID with the provider
  isActive: boolean;
  configuration: Record<string, any>; // Provider-specific config
};

/**
 * System-wide payment configuration
 */
export type TSystemPaymentConfig = {
  defaultCurrency: Currency;
  supportedCurrencies: Currency[];
  defaultCommissionRate: number;
  maxRefundDays: number;
  settlementDelayDays: number;
  webhookRetryAttempts: number;
  webhookRetryDelay: number; // seconds
};

/**
 * Configuration options for PaymentsModule
 */
export type TPaymentsModuleOptions = {
  /**
   * Global payment configuration
   */
  defaultCurrency?: Currency;
  supportedCurrencies?: Currency[];
  defaultCommissionRate?: number;
  maxRefundDays?: number;
  settlementDelayDays?: number;

  /**
   * Webhook configuration
   */
  webhookRetryAttempts?: number;
  webhookRetryDelay?: number;

  /**
   * Feature flags
   */
  enableSubscriptions?: boolean;
  enableMultiVendor?: boolean;
  enableCOD?: boolean;
};

/**
 * Async configuration options for PaymentsModule
 */
export type TPaymentsModuleAsyncOptions = {
  imports?: any[];
  useFactory?: (
    ...args: any[]
  ) => Promise<TPaymentsModuleOptions> | TPaymentsModuleOptions;
  inject?: any[];
};

/**
 * Input for processing a payment method
 */
export type TProcessPaymentInput = {
  amount: TPaymentAmount;
  customer: TCustomerInfo;
  metadata: TPaymentMetadata;
};

/**
 * Input for refund a payment method
 */
export type TProcessRefundInput = {
  transactionId: number;
  amount?: TPaymentAmount;
  reason?: string;
};

/**
 * Input for verify webhook method
 */
export type TVerifyWebhookInput = {
  payload: string;
  signature: string;
};

/**
 * Input for create payment method
 */
export type TCreatePaymentInput = {
  amount: TPaymentAmount;
  customer: TCustomerInfo;
  metadata: TPaymentMetadata;
};

/**
 * Input for capture payment method
 */
export type TCapturePaymentInput = {
  transactionId: number;
  amount?: TPaymentAmount;
};

/**
 * Input for refund a payment method
 */
export type TRefundPaymentInput = {
  transactionId: number;
  amount?: TPaymentAmount;
  reason?: string;
};

/**
 * Input for update customer method
 */
export type TUpdateCustomerInput = {
  customerId: string;
  customer: Partial<TCustomerInfo>;
};

/**
 * Input for create subscription method
 */
export type TCreateSubscriptionInput = {
  customerId: string;
  planId: number;
  metadata: TPaymentMetadata;
};

/**
 * Input for update subscription method
 */
export type TUpdateSubscriptionInput = {
  subscriptionId: number;
  planId: number;
};
