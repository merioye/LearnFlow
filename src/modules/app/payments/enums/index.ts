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
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
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
