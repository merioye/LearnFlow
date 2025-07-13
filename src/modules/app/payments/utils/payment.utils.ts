import axios from 'axios';

import {
  EXCHANGE_RATE_API_URL,
  PAYMENT_PROVIDERS_CONFIG,
  SUPPORTED_CURRENCIES,
} from '../constants';
import { Currency, PaymentProvider } from '../enums';
import { TPaymentAmount } from '../types';

/**
 * Utility functions for payment processing
 *
 * @class PaymentUtils
 */
export class PaymentUtils {
  /**
   * Format amount for display with proper currency symbol
   * @param amount - The amount to format
   * @returns The formatted amount
   */
  public static formatAmount(amount: TPaymentAmount): string {
    const currency = SUPPORTED_CURRENCIES[amount.currency];
    if (!currency) {
      return `${amount.amount} ${amount.currency}`;
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: amount.currency,
      minimumFractionDigits: currency.decimals,
      maximumFractionDigits: currency.decimals,
    }).format(amount.amount);
  }

  /**
   * Convert amount to smallest currency unit (cents)
   * @param amount - The amount to convert
   * @param currency - The currency to convert
   * @returns The amount in smallest currency unit
   */
  public static toSmallestUnit(amount: number, currency: Currency): number {
    const currencyInfo = SUPPORTED_CURRENCIES[currency];
    const multiplier = Math.pow(10, currencyInfo?.decimals || 2);
    return Math.round(amount * multiplier);
  }

  /**
   * Convert amount from smallest currency unit
   * @param amount - The amount to convert
   * @param currency - The currency to convert
   * @returns The amount in smallest currency unit
   */
  public static fromSmallestUnit(amount: number, currency: Currency): number {
    const currencyInfo = SUPPORTED_CURRENCIES[currency];
    const divisor = Math.pow(10, currencyInfo?.decimals || 2);
    return amount / divisor;
  }

  /**
   * Calculate commission amount
   * @param amount - The amount to calculate commission for
   * @param commissionRate - The commission rate to apply
   * @returns The commission amount
   */
  public static calculateCommission(
    amount: number,
    commissionRate: number
  ): number {
    return Math.round(((amount * commissionRate) / 100) * 100) / 100;
  }

  /**
   * Calculate net amount after commission
   * @param amount - The amount to calculate net amount for
   * @param commissionRate - The commission rate to apply
   * @returns The net amount
   */
  public static calculateNetAmount(
    amount: number,
    commissionRate: number
  ): number {
    const commission = this.calculateCommission(amount, commissionRate);
    return Math.round((amount - commission) * 100) / 100;
  }

  /**
   * Validate currency code
   * @param currency - The currency to validate
   * @returns True if the currency is valid, false otherwise
   */
  public static isValidCurrency(currency: Currency): boolean {
    return currency in SUPPORTED_CURRENCIES;
  }

  /**
   * Generate unique payment reference
   * @param prefix - The prefix to use for the reference
   * @returns The unique payment reference
   */
  public static generatePaymentReference(prefix: string = 'PAY'): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Validate payment amount against provider limits
   * @param amount - The amount to validate
   * @param currency - The currency to validate
   * @param provider - The provider to validate against
   * @returns True if the amount is valid, false otherwise
   */
  public static async validateAmount(
    amount: number,
    currency: Currency,
    provider: PaymentProvider
  ): Promise<boolean> {
    // This would be expanded with actual provider limits
    if (amount <= 0) return false;

    // Convert to USD for limit checking
    const usdAmount =
      currency === Currency.USD
        ? amount
        : await this._convertToUSD(amount, currency);

    switch (provider.toUpperCase() as PaymentProvider) {
      case PaymentProvider.STRIPE:
        return (
          usdAmount >= PAYMENT_PROVIDERS_CONFIG.STRIPE.MIN_AMOUNT_USD &&
          usdAmount <= PAYMENT_PROVIDERS_CONFIG.STRIPE.MAX_AMOUNT_USD
        );
      case PaymentProvider.PAYPAL:
        return (
          usdAmount >= PAYMENT_PROVIDERS_CONFIG.PAYPAL.MIN_AMOUNT_USD &&
          usdAmount <= PAYMENT_PROVIDERS_CONFIG.PAYPAL.MAX_AMOUNT_USD
        );
      case PaymentProvider.MANUAL:
        return (
          usdAmount >= PAYMENT_PROVIDERS_CONFIG.MANUAL.MIN_AMOUNT_USD &&
          usdAmount <= PAYMENT_PROVIDERS_CONFIG.MANUAL.MAX_AMOUNT_USD
        );
      default:
        return true;
    }
  }

  /**
   * Fetches exchange rate for a given currency from a real API
   * @param currency - The currency to fetch the exchange rate for
   * @returns The exchange rate or null if the API fails
   */
  public static async getExchangeRate(
    currency: Currency
  ): Promise<number | null> {
    try {
      // Using ExchangeRate-API (free, no API key required)
      const response = await axios.get<{ rates: Record<string, number> }>(
        EXCHANGE_RATE_API_URL
      );
      const data = response.data;

      // The API returns rates where USD = 1, so we need the rate for the currency
      return data.rates[currency] || null;
    } catch {
      return null;
    }
  }

  /**
   * Sanitize payment metadata
   * @param metadata - The metadata to sanitize
   * @returns The sanitized metadata
   */
  public static sanitizeMetadata(
    metadata: Record<string, any>
  ): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(metadata)) {
      // Remove any potential sensitive data
      if (this._isSensitiveKey(key)) {
        continue;
      }

      // Ensure values are serializable
      if (this._isSerializable(value)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Check if key contains sensitive information
   * @param key - The key to check
   * @returns True if the key is sensitive, false otherwise
   */
  private static _isSensitiveKey(key: string): boolean {
    const sensitiveKeys = ['password', 'secret', 'key', 'token', 'auth'];
    return sensitiveKeys.some((sensitive) =>
      key.toLowerCase().includes(sensitive)
    );
  }

  /**
   * Check if value is serializable
   * @param value - The value to check
   * @returns True if the value is serializable, false otherwise
   */
  private static _isSerializable(value: any): boolean {
    try {
      JSON.stringify(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Convert amount to USD
   * @param amount - The amount to convert
   * @param currency - The currency to convert
   * @returns The amount in USD
   */
  private static async _convertToUSD(
    amount: number,
    currency: Currency
  ): Promise<number> {
    const exchangeRate = await this.getExchangeRate(currency);
    if (!exchangeRate) {
      return amount;
    }
    return amount * exchangeRate;
  }
}
