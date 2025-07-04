import { Injectable } from '@nestjs/common';

import { InternalServerError } from '@/common/errors';
import { IHashService } from '@/modules/common/hash';
import { IDateTime } from '@/modules/common/helper/date-time';
import { ILogger } from '@/modules/common/logger';

import {
  Currency,
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
} from '../enums';
import { IPaymentProvider } from '../interfaces';
import {
  TCapturePaymentInput,
  TCreatePaymentInput,
  TCustomerInfo,
  TPaymentAmount,
  TPaymentProviderResponse,
  TRefundPaymentInput,
  TUpdateCustomerInput,
  TVerifyWebhookInput,
  TWebhookEvent,
} from '../types';

/**
 * Abstract base class for payment providers
 * Implements common functionality and enforces contract
 *
 * @abstract
 * @class BasePaymentProvider
 * @implements {IPaymentProvider}
 */
@Injectable()
export abstract class BasePaymentProvider implements IPaymentProvider {
  /**
   * Provider name for identification
   */
  abstract readonly providerName: PaymentProvider;

  /**
   * Supported payment methods by this provider
   */
  abstract readonly supportedMethods: PaymentMethod[];

  public constructor(
    protected readonly logger: ILogger,
    protected readonly hashService: IHashService,
    protected readonly dateTime: IDateTime
  ) {}

  /**
   * Abstract methods that concrete providers must implement
   */

  /**
   * @inheritdoc
   */
  public abstract createPayment(
    input: TCreatePaymentInput
  ): Promise<TPaymentProviderResponse>;

  /**
   * @inheritdoc
   */
  public abstract capturePayment(
    input: TCapturePaymentInput
  ): Promise<TPaymentProviderResponse>;

  /**
   * @inheritdoc
   */
  public abstract refundPayment(
    input: TRefundPaymentInput
  ): Promise<TPaymentProviderResponse>;

  /**
   * @inheritdoc
   */
  public abstract cancelPayment(
    transactionId: number
  ): Promise<TPaymentProviderResponse>;

  /**
   * @inheritdoc
   */
  public abstract getPaymentStatus(
    transactionId: number
  ): Promise<PaymentStatus>;

  /**
   * @inheritdoc
   */
  public abstract verifyWebhookSignature(input: TVerifyWebhookInput): boolean;

  /**
   * @inheritdoc
   */
  public abstract createCustomer(customer: TCustomerInfo): Promise<string>;

  /**
   * @inheritdoc
   */
  public abstract updateCustomer(input: TUpdateCustomerInput): Promise<void>;

  /**
   * Abstract method for provider-specific webhook processing
   * @param event - Webhook event data
   * @param event.id - Webhook event ID
   * @param event.provider - Payment provider
   * @param event.eventType - Webhook event type
   * @param event.data - Webhook event data
   * @param event.timestamp - Webhook event timestamp
   * @param event.signature - Webhook event signature
   * @returns void
   */
  protected abstract processWebhookEvent(event: TWebhookEvent): Promise<void>;

  /**
   * @inheritdoc
   */
  public async handleWebhook(event: TWebhookEvent): Promise<void> {
    this.logger.info(
      `Processing webhook event: ${event.eventType} from ${event.provider}`
    );

    try {
      await this.processWebhookEvent(event);
      this.logger.info(`Successfully processed webhook event: ${event.id}`);
    } catch (error) {
      this.logger.error(`Failed to process webhook event: ${event.id}`, {
        error,
      });
      throw error;
    }
  }

  /**
   * @inheritdoc
   */
  public getSupportedMethods(): PaymentMethod[] {
    return this.supportedMethods;
  }

  /**
   * Check if provider supports a specific payment method
   * @param method - Payment method to check
   * @returns True if the provider supports the given payment method, false otherwise
   */
  public supports(method: PaymentMethod): boolean {
    return this.supportedMethods.includes(method);
  }

  /**
   * Common error handling and logging
   * @param error - Error object
   * @param operation - Operation that failed
   * @returns never
   */
  protected handleProviderError(error: Error, operation: string): never {
    this.logger.error(`${this.providerName} ${operation} failed:`, { error });
    throw new InternalServerError(`Payment provider error: ${error.message}`);
  }

  /**
   * Validate required configuration
   * @param config - Configuration object
   * @param requiredFields - Required fields
   * @throws {InternalServerError} If required fields are missing
   * @returns void
   */
  protected validateConfig(
    config: Record<string, any>,
    requiredFields: string[]
  ): void {
    const missingFields = requiredFields.filter((field) => !config[field]);
    if (missingFields.length > 0) {
      throw new InternalServerError(
        `Missing required configuration fields for ${this.providerName}: ${missingFields.join(', ')}`
      );
    }
  }

  /**
   * Generate idempotency key for operations
   * @param prefix - Prefix for idempotency key
   * @param args - Arguments for idempotency key
   * @returns Idempotency key
   */
  protected generateIdempotencyKey(prefix: string, ...args: string[]): string {
    const timestamp = this.dateTime.timestamp;
    const hash = this.hashService.hashSync(args.join('')).substring(0, 8);
    return `${prefix}_${timestamp}_${hash}`;
  }

  /**
   * Format amount for provider-specific requirements
   * @param amount - Payment amount and currency information
   * @returns Amount formatted for provider
   */
  protected formatAmount(amount: TPaymentAmount): number {
    // Most providers expect amounts in cents/smallest currency unit
    return Math.round(amount.amount * 100);
  }

  /**
   * Parse amount from provider response
   * @param amount - Amount from provider response
   * @param currency - Currency from provider response
   * @returns Payment amount and currency information
   */
  protected parseAmount(amount: number, currency: Currency): TPaymentAmount {
    return {
      amount: amount / 100, // Convert from cents to standard unit
      currency: currency,
      formattedAmount: this._formatCurrency(amount / 100, currency),
    };
  }

  /**
   * Format currency for display
   * @param amount - Amount to format
   * @param currency - Currency code
   * @returns Formatted currency string
   */
  private _formatCurrency(amount: number, currency: Currency): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }
}
