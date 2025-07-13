/**
 * Payment-related constants used throughout the application
 */

import { Currency, PaymentMethod, PaymentProvider } from '../enums';
import { TPaymentProvidersConfiguration } from '../types';

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
export const PAYMENT_PROVIDERS_CONFIG: TPaymentProvidersConfiguration = {
  [PaymentProvider.STRIPE]: {
    // USD limits
    MIN_AMOUNT_USD: 0.5,
    MAX_AMOUNT_USD: 999999.99,

    // EUR limits (1 USD ≈ 0.92 EUR)
    MIN_AMOUNT_EUR: 0.46,
    MAX_AMOUNT_EUR: 919999.99,

    // GBP limits (1 USD ≈ 0.78 GBP)
    MIN_AMOUNT_GBP: 0.39,
    MAX_AMOUNT_GBP: 779999.99,

    // CAD limits (1 USD ≈ 1.37 CAD)
    MIN_AMOUNT_CAD: 0.69,
    MAX_AMOUNT_CAD: 1369999.99,

    // INR limits (1 USD ≈ 83.5 INR)
    MIN_AMOUNT_INR: 41.75,
    MAX_AMOUNT_INR: 83499999.92,

    // PKR limits (1 USD ≈ 278 PKR)
    MIN_AMOUNT_PKR: 139.0,
    MAX_AMOUNT_PKR: 277999997.22,

    WEBHOOK_TOLERANCE: 300, // 5 minutes
  },

  [PaymentProvider.PAYPAL]: {
    // USD limits
    MIN_AMOUNT_USD: 0.01,
    MAX_AMOUNT_USD: 10000.0,

    // EUR limits (1 USD ≈ 0.92 EUR)
    MIN_AMOUNT_EUR: 0.01,
    MAX_AMOUNT_EUR: 9200.0,

    // GBP limits (1 USD ≈ 0.78 GBP)
    MIN_AMOUNT_GBP: 0.01,
    MAX_AMOUNT_GBP: 7800.0,

    // CAD limits (1 USD ≈ 1.37 CAD)
    MIN_AMOUNT_CAD: 0.01,
    MAX_AMOUNT_CAD: 13700.0,

    // INR limits (1 USD ≈ 83.5 INR)
    MIN_AMOUNT_INR: 0.83,
    MAX_AMOUNT_INR: 835000.0,

    // PKR limits (1 USD ≈ 278 PKR)
    MIN_AMOUNT_PKR: 2.78,
    MAX_AMOUNT_PKR: 2780000.0,

    WEBHOOK_TOLERANCE: 300, // 5 minutes
  },

  [PaymentProvider.MANUAL]: {
    // USD limits
    MIN_AMOUNT_USD: 1.0,
    MAX_AMOUNT_USD: 5000.0,

    // EUR limits (1 USD ≈ 0.92 EUR)
    MIN_AMOUNT_EUR: 0.92,
    MAX_AMOUNT_EUR: 4600.0,

    // GBP limits (1 USD ≈ 0.78 GBP)
    MIN_AMOUNT_GBP: 0.78,
    MAX_AMOUNT_GBP: 3900.0,

    // CAD limits (1 USD ≈ 1.37 CAD)
    MIN_AMOUNT_CAD: 1.37,
    MAX_AMOUNT_CAD: 6850.0,

    // INR limits (1 USD ≈ 83.5 INR)
    MIN_AMOUNT_INR: 83.5,
    MAX_AMOUNT_INR: 417500.0,

    // PKR limits (1 USD ≈ 278 PKR)
    MIN_AMOUNT_PKR: 278.0,
    MAX_AMOUNT_PKR: 1390000.0,

    CONFIRMATION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  },
} as const;

/**
 * Cache keys for payment-related data
 */
export const CACHE_KEYS = {
  PAYMENT_CONFIG: (userId: number) => `payment:config:${userId}`,
  TEACHER_CONFIG: (teacherId: number) => `teacher:config:${teacherId}`,
  PAYMENT_STATUS: (paymentId: number) => `payment:status:${paymentId}`,
  RATE_LIMIT: (userId: number, method: PaymentMethod) =>
    `ratelimit:${userId}:${method}`,
} as const;
