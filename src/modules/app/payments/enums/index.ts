/**
 * Supported payment methods across the platform
 * Each method corresponds to a specific payment provider implementation
 */
export enum PaymentMethod {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  COD = 'COD', // Cash on Delivery
}

/**
 * Payment gateway providers
 * Maps to actual service implementations
 */
export enum PaymentProvider {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  MANUAL = 'MANUAL', // For COD and manual processing
}

/**
 * Payout methods for settlement
 */
export enum PayoutMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  PAYPAL = 'PAYPAL',
  STRIPE_CONNECT = 'STRIPE_CONNECT',
}

/**
 * Payment transaction status lifecycle
 * Covers all possible states from initiation to completion
 */
export enum PaymentStatus {
  PENDING = 'PENDING', // Payment initiated but not processed
  PROCESSING = 'PROCESSING', // Payment being processed by provider
  COMPLETED = 'COMPLETED', // Payment successfully completed
  FAILED = 'FAILED', // Payment failed
  CANCELLED = 'CANCELLED', // Payment cancelled by user/system
  REFUNDED = 'REFUNDED', // Payment refunded
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED', // Partial refund applied
  EXPIRED = 'EXPIRED', // Payment session expired
  DISPUTED = 'DISPUTED', // Payment disputed/chargeback
}

/**
 * Settlement status for multi-vendor payments
 */
export enum SettlementStatus {
  PENDING = 'PENDING', // Settlement pending
  PROCESSING = 'PROCESSING', // Settlement in progress
  COMPLETED = 'COMPLETED', // Settlement completed
  FAILED = 'FAILED', // Settlement failed
  CANCELLED = 'CANCELLED', // Settlement cancelled
}

/**
 * Types of payment transactions in the system
 */
export enum TransactionType {
  SUBSCRIPTION = 'SUBSCRIPTION', // Recurring subscription payments
  ONE_TIME = 'ONE_TIME', // Single course/product purchase
  REFUND = 'REFUND', // Refund transaction
  SETTLEMENT = 'SETTLEMENT', // Vendor/teacher payout
  COMMISSION = 'COMMISSION', // Admin commission
  ADJUSTMENT = 'ADJUSTMENT', // Manual adjustment
}

/**
 * Payment flow types for routing decisions
 */
export enum PaymentFlowType {
  ADMIN_FEE_MODEL = 'ADMIN_FEE_MODEL', // Admin holds funds, takes commission
  DIRECT_MODEL = 'DIRECT_MODEL', // Direct payment to vendor/teacher
  SUBSCRIPTION_MODEL = 'SUBSCRIPTION_MODEL', // Subscription to admin
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  CAD = 'CAD',
  INR = 'INR',
  PKR = 'PKR',
}

/**
 * Payment refund request reasons
 */
export enum RefundReason {
  CUSTOMER_REQUEST = 'CUSTOMER_REQUEST', // Customer requested a refund
  MERCHANT_INITIATED = 'MERCHANT_INITIATED', // Merchant initiated a refund
  QUALITY_ISSUE = 'QUALITY_ISSUE', // Quality issue (e.g. content not as described)
  UNAUTHORIZED_TRANSACTION = 'UNAUTHORIZED_TRANSACTION', // Unauthorized transaction
  DUPLICATE_CHARGE = 'DUPLICATE_CHARGE', // Duplicate charge (e.g. charged twice for the same transaction)
  TECHNICAL_ERROR = 'TECHNICAL_ERROR', // Technical error (e.g. payment gateway error)
  POLICY_VIOLATION = 'POLICY_VIOLATION', // Policy violation (e.g. refund policy violation)
  CHARGEBACK_PREVENTION = 'CHARGEBACK_PREVENTION', // Chargeback prevention (e.g. chargeback prevention)
  OTHER = 'OTHER', // Other (e.g. other reason not listed above)
}

/**
 * Refund methods
 */
export enum RefundMethod {
  AUTOMATIC = 'AUTOMATIC', // Refund automatically
  MANUAL = 'MANUAL', // Refund manually
  ORIGINAL_PAYMENT_METHOD = 'ORIGINAL_PAYMENT_METHOD', // Refund using original payment method
}

/**
 * Webhook processing status enum
 */
export enum WebhookStatus {
  PENDING = 'PENDING', // Webhook pending
  PROCESSING = 'PROCESSING', // Webhook in progress
  PROCESSED = 'PROCESSED', // Webhook processed
  FAILED = 'FAILED', // Webhook failed
  RETRY = 'RETRY', // Webhook retry
  IGNORED = 'IGNORED', // Webhook ignored
}

/**
 * Event names for internal event system
 */
export enum PaymentEvent {
  PAYMENT_CREATED = 'payment.created',
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_FAILED = 'payment.failed',
  PAYMENT_REFUNDED = 'payment.refunded',
  SUBSCRIPTION_CREATED = 'subscription.created',
  SUBSCRIPTION_UPDATED = 'subscription.updated',
  SUBSCRIPTION_CANCELLED = 'subscription.cancelled',
  SETTLEMENT_INITIATED = 'settlement.initiated',
  SETTLEMENT_COMPLETED = 'settlement.completed',
  WEBHOOK_RECEIVED = 'webhook.received',
  WEBHOOK_PROCESSED = 'webhook.processed',
}

/**
 * Provider transaction type
 */
export enum ProviderTransactionType {
  ATTEMPT = 'attempt',
  REFUND = 'refund',
  CAPTURE = 'capture',
}

/**
 * Payment config verification status
 */
export enum PaymentConfigVerificationStatus {
  PENDING = 'PENDING', // Payment config verification pending
  VERIFIED = 'VERIFIED', // Payment config verified
  REJECTED = 'REJECTED', // Payment config rejected
  REQUIRES_ACTION = 'REQUIRES_ACTION', // Payment config requires action
}

/**
 * Payment settlement schedule
 */
export enum PaymentSettlementSchedule {
  DAILY = 'DAILY', // Daily settlement
  WEEKLY = 'WEEKLY', // Weekly settlement
  MONTHLY = 'MONTHLY', // Monthly settlement
}

/**
 * Refund request attachment type
 */
export enum RefundRequestAttachmentType {
  IMAGE = 'IMAGE',
  DOCUMENT = 'DOCUMENT',
  OTHER = 'OTHER',
}
