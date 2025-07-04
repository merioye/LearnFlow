/**
 * Payment-related constants used throughout the application
 */

import { Currency, PaymentMethod } from '../enums';

export const PAYMENTS_MODULE_OPTIONS = 'PAYMENTS_MODULE_OPTIONS';
export const EXCHANGE_RATE_API_URL =
  'https://api.exchangerate-api.com/v4/latest/USD';

/**
 * Default configuration values
 */
export const PAYMENT_DEFAULTS = {
  CURRENCY: Currency.USD,
  COMMISSION_RATE: 5.0, // 5%
  MAX_REFUND_DAYS: 30,
  SETTLEMENT_DELAY_DAYS: 7,
  WEBHOOK_RETRY_ATTEMPTS: 3,
  WEBHOOK_RETRY_DELAY: 60, // seconds
  PAYMENT_TIMEOUT: 30 * 60 * 1000, // 30 minutes in milliseconds
} as const;

/**
 * Supported currencies with their properties
 */
export const SUPPORTED_CURRENCIES = {
  [Currency.USD]: { symbol: '$', decimals: 2, name: 'US Dollar' },
  [Currency.EUR]: { symbol: '€', decimals: 2, name: 'Euro' },
  [Currency.GBP]: { symbol: '£', decimals: 2, name: 'British Pound' },
  [Currency.CAD]: { symbol: 'C$', decimals: 2, name: 'Canadian Dollar' },
  [Currency.INR]: { symbol: '₹', decimals: 2, name: 'Indian Rupee' },
  [Currency.PKR]: { symbol: '₨', decimals: 2, name: 'Pakistani Rupee' },
} as const;

/**
 * Payment provider specific constants
 */
export const PROVIDER_CONSTANTS = {
  STRIPE: {
    MIN_AMOUNT_USD: 0.5, // Minimum charge amount in USD
    MAX_AMOUNT_USD: 999999.99,
    WEBHOOK_TOLERANCE: 300, // 5 minutes
  },
  PAYPAL: {
    MIN_AMOUNT_USD: 0.01,
    MAX_AMOUNT_USD: 10000.0,
    WEBHOOK_TOLERANCE: 300,
  },
  COD: {
    MIN_AMOUNT_USD: 1.0,
    MAX_AMOUNT_USD: 5000.0,
    CONFIRMATION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  },
} as const;

/**
 * Event names for internal event system
 */
export const PAYMENT_EVENTS = {
  PAYMENT_CREATED: 'payment.created',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_UPDATED: 'subscription.updated',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
  SETTLEMENT_INITIATED: 'settlement.initiated',
  SETTLEMENT_COMPLETED: 'settlement.completed',
  WEBHOOK_RECEIVED: 'webhook.received',
  WEBHOOK_PROCESSED: 'webhook.processed',
} as const;

/**
 * Cache keys for payment-related data
 */
export const CACHE_KEYS = {
  PAYMENT_CONFIG: (userId: number) => `payment:config:${userId}`,
  VENDOR_CONFIG: (teacherId: number) => `teacher:config:${teacherId}`,
  PAYMENT_STATUS: (paymentId: number) => `payment:status:${paymentId}`,
  RATE_LIMIT: (userId: number, method: PaymentMethod) =>
    `ratelimit:${userId}:${method}`,
} as const;

/**
 * Database table names
 */
export const TABLE_NAMES = {
  PAYMENTS: 'tbl_payments',
  PAYMENT_TRANSACTIONS: 'tbl_payment_transactions',
  PAYMENT_METHOD_CONFIGS: 'tbl_payment_method_configs',
  TEACHER_PAYMENT_CONFIGS: 'tbl_teacher_payment_configs',
  PAYMENT_SETTLEMENTS: 'tbl_payment_settlements',
  REFUND_REQUESTS: 'tbl_refund_requests',
  WEBHOOK_LOGS: 'tbl_webhook_logs',
} as const;
