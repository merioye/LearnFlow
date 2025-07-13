/**
 * Payment-specific errors for comprehensive error handling
 * Extends base error classes with payment context and error codes
 */

import { HttpStatus } from '@nestjs/common';

import { CustomError, ErrorCode } from '@/common/errors';

import { Currency, PaymentProvider, PaymentStatus } from '../enums';

/**
 * Base payment error class
 * Provides common structure for all payment-related errors
 *
 * @class PaymentError
 * @extends {CustomError}
 */
export class PaymentError extends CustomError {
  public constructor(
    message: string,
    errorCode: ErrorCode,
    statusCode: HttpStatus,
    context: Record<string, any> = {}
  ) {
    super('PaymentError', message, errorCode, statusCode, context);
    Object.setPrototypeOf(this, PaymentError.prototype);
  }
}

/**
 * Payment validation errors
 */
export class PaymentValidationError extends PaymentError {
  public constructor(message: string, context: Record<string, any> = {}) {
    super(
      message,
      ErrorCode.PAYMENT_VALIDATION_ERROR,
      HttpStatus.UNPROCESSABLE_ENTITY,
      context
    );
  }
}

/**
 * Payment method not supported
 */
export class PaymentMethodNotSupportedError extends PaymentError {
  public constructor(method: string, context: Record<string, any> = {}) {
    super(
      `Payment method ${method} is not supported`,
      ErrorCode.PAYMENT_METHOD_NOT_SUPPORTED_ERROR,
      HttpStatus.BAD_REQUEST,
      { method, ...context }
    );
  }
}

/**
 * Payment provider errors
 */
export class PaymentProviderError extends PaymentError {
  public constructor(
    provider: PaymentProvider,
    message: string,
    context: Record<string, any> = {}
  ) {
    super(
      `Payment provider ${provider} error: ${message}`,
      ErrorCode.PAYMENT_PROVIDER_ERROR,
      HttpStatus.BAD_GATEWAY,
      { provider, ...context }
    );
  }
}

/**
 * Payment not found
 */
export class PaymentNotFoundError extends PaymentError {
  public constructor(identifier: string, context: Record<string, any> = {}) {
    super(
      `Payment not found: ${identifier}`,
      ErrorCode.NOT_FOUND_ERROR,
      HttpStatus.NOT_FOUND,
      {
        identifier,
        ...context,
      }
    );
  }
}

/**
 * Payment already processed
 */
export class PaymentAlreadyProcessedError extends PaymentError {
  public constructor(
    paymentId: number,
    status: PaymentStatus,
    context: Record<string, any> = {}
  ) {
    super(
      `Payment ${paymentId} already processed with status: ${status}`,
      ErrorCode.PAYMENT_ALREADY_PROCESSED_ERROR,
      HttpStatus.CONFLICT,
      { paymentId, status, ...context }
    );
  }
}

/**
 * Payment amount mismatch
 */
export class PaymentAmountMismatchError extends PaymentError {
  public constructor(
    expected: number,
    actual: number,
    context: Record<string, any> = {}
  ) {
    super(
      `Payment amount mismatch: expected ${expected}, got ${actual}`,
      ErrorCode.PAYMENT_AMOUNT_MISMATCH_ERROR,
      HttpStatus.BAD_REQUEST,
      { expected, actual, ...context }
    );
  }
}

/**
 * Payment expired
 */
export class PaymentExpiredError extends PaymentError {
  public constructor(
    paymentId: number,
    expiresAt: Date,
    context: Record<string, any> = {}
  ) {
    super(
      `Payment ${paymentId} expired at ${expiresAt.toISOString()}`,
      ErrorCode.PAYMENT_EXPIRED_ERROR,
      HttpStatus.GONE,
      { paymentId, expiresAt, ...context }
    );
  }
}

/**
 * Insufficient funds for refund
 */
export class InsufficientFundsError extends PaymentError {
  public constructor(
    paymentId: number,
    requestedAmount: number,
    availableAmount: number,
    context: Record<string, any> = {}
  ) {
    super(
      `Insufficient funds for refund: requested ${requestedAmount}, available ${availableAmount}`,
      ErrorCode.INSUFFICIENT_FUNDS_ERROR,
      HttpStatus.UNPROCESSABLE_ENTITY,
      { paymentId, requestedAmount, availableAmount, ...context }
    );
  }
}

/**
 * Payment cannot be refunded
 */
export class PaymentNotRefundableError extends PaymentError {
  public constructor(
    paymentId: number,
    status: string,
    context: Record<string, any> = {}
  ) {
    super(
      `Payment ${paymentId} cannot be refunded in status: ${status}`,
      ErrorCode.PAYMENT_NOT_REFUNDABLE_ERROR,
      HttpStatus.CONFLICT,
      { paymentId, status, ...context }
    );
  }
}

/**
 * Duplicate payment attempt
 */
export class DuplicatePaymentError extends PaymentError {
  public constructor(
    idempotencyKey: string,
    existingPaymentId: number,
    context: Record<string, any> = {}
  ) {
    super(
      `Duplicate payment attempt with idempotency key: ${idempotencyKey}`,
      ErrorCode.DUPLICATE_PAYMENT_ERROR,
      HttpStatus.CONFLICT,
      { idempotencyKey, existingPaymentId, ...context }
    );
  }
}

/**
 * Commission calculation error
 */
export class CommissionCalculationError extends PaymentError {
  public constructor(
    amount: number,
    rate: number,
    context: Record<string, any> = {}
  ) {
    super(
      `Commission calculation failed for amount: ${amount}, rate: ${rate}`,
      ErrorCode.PAYMENT_COMMISSION_CALCULATION_ERROR,
      HttpStatus.INTERNAL_SERVER_ERROR,
      { amount, rate, ...context }
    );
  }
}

/**
 * Settlement error
 */
export class SettlementError extends PaymentError {
  public constructor(
    settlementId: string,
    message: string,
    context: Record<string, any> = {}
  ) {
    super(
      `Settlement ${settlementId} error: ${message}`,
      ErrorCode.PAYMENT_SETTLEMENT_ERROR,
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        settlementId,
        ...context,
      }
    );
  }
}

/**
 * Webhook verification failed
 */
export class WebhookVerificationError extends PaymentError {
  public constructor(
    provider: PaymentProvider,
    message: string,
    context: Record<string, any> = {}
  ) {
    super(
      `Webhook verification failed for ${provider}: ${message}`,
      ErrorCode.PAYMENT_WEBHOOK_VERIFICATION_FAILED,
      HttpStatus.UNAUTHORIZED,
      { provider, ...context }
    );
  }
}

/**
 * Rate limit exceeded
 */
export class PaymentRateLimitError extends PaymentError {
  public constructor(
    identifier: string,
    limit: number,
    context: Record<string, any> = {}
  ) {
    super(
      `Payment rate limit exceeded for ${identifier}: ${limit}`,
      ErrorCode.PAYMENT_RATE_LIMIT_EXCEEDED,
      HttpStatus.TOO_MANY_REQUESTS,
      { identifier, limit, ...context }
    );
  }
}

/**
 * Currency not supported
 */
export class CurrencyNotSupportedError extends PaymentError {
  public constructor(
    currency: Currency,
    supportedCurrencies: Currency[],
    context: Record<string, any> = {}
  ) {
    super(
      `Currency ${currency} not supported. Supported currencies: ${supportedCurrencies.join(', ')}`,
      ErrorCode.PAYMENT_CURRENCY_NOT_SUPPORTED,
      HttpStatus.BAD_REQUEST,
      { currency, supportedCurrencies, ...context }
    );
  }
}

/**
 * Multi-vendor configuration error
 */
export class MultiVendorConfigurationError extends PaymentError {
  public constructor(
    vendorId: number,
    message: string,
    context: Record<string, any> = {}
  ) {
    super(
      `Multi-vendor configuration error for vendor ${vendorId}: ${message}`,
      ErrorCode.PAYMENT_MULTI_VENDOR_CONFIG_ERROR,
      HttpStatus.UNPROCESSABLE_ENTITY,
      { vendorId, ...context }
    );
  }
}

/**
 * Payment configuration error
 */
export class PaymentConfigurationError extends PaymentError {
  public constructor(
    provider: PaymentProvider,
    message: string,
    context: Record<string, any> = {}
  ) {
    super(
      `Payment configuration error for ${provider}: ${message}`,
      ErrorCode.PAYMENT_CONFIG_ERROR,
      HttpStatus.UNPROCESSABLE_ENTITY,
      { provider, ...context }
    );
  }
}

/**
 * Payment internal server error
 */
export class PaymentInternalServerError extends PaymentError {
  public constructor(message: string, context: Record<string, any> = {}) {
    super(
      `Internal server error occurred in payment: ${message}`,
      ErrorCode.INTERNAL_SERVER_ERROR,
      HttpStatus.INTERNAL_SERVER_ERROR,
      context
    );
  }
}
