import { PaymentMethod, PaymentProvider, PaymentStatus } from '../enums';
import {
  TCapturePaymentInput,
  TCreatePaymentInput,
  TCustomerInfo,
  TPaymentProviderResponse,
  TRefundPaymentInput,
  TUpdateCustomerInput,
  TVerifyWebhookInput,
  TWebhookEvent,
} from '../types';

/**
 * Core interface that all payment providers must implement
 * Defines the contract for payment processing operations
 */
export interface IPaymentProvider {
  /**
   * The name of the provider
   */
  name: PaymentProvider;

  /**
   * Initialize payment session
   * @param input - Payment processing input
   * @param input.amount - Payment amount and currency information
   * @param input.customer - Customer information
   * @param input.metadata - Additional payment metadata
   * @returns Payment provider response with transaction details
   */
  createPayment(input: TCreatePaymentInput): Promise<TPaymentProviderResponse>;

  /**
   * Capture a previously authorized payment
   * @param input - Payment processing input
   * @param input.transactionId - Provider transaction ID
   * @param input.amount - Amount to capture (can be less than authorized)
   */
  capturePayment(
    input: TCapturePaymentInput
  ): Promise<TPaymentProviderResponse>;

  /**
   * Process refund for a completed payment
   * @param input - Refund processing input
   * @param input.transactionId - Original transaction ID
   * @param input.amount - Refund amount (optional for full refund)
   * @param input.reason - Reason for refund
   */
  refundPayment(input: TRefundPaymentInput): Promise<TPaymentProviderResponse>;

  /**
   * Cancel a pending payment
   * @param transactionId - Provider transaction ID
   * @returns Payment provider response with transaction details
   */
  cancelPayment(transactionId: number): Promise<TPaymentProviderResponse>;

  /**
   * Get current payment status
   * @param transactionId - Provider transaction ID
   * @returns Payment status
   */
  getPaymentStatus(transactionId: number): Promise<PaymentStatus>;

  /**
   * Handle webhook events from payment provider
   * @param event - Webhook event data
   * @param event.id - Webhook event ID
   * @param event.provider - Payment provider
   * @param event.eventType - Webhook event type
   * @param event.data - Webhook event data
   * @param event.timestamp - Webhook event timestamp
   * @param event.signature - Webhook event signature
   * @returns void
   */
  handleWebhook(event: TWebhookEvent): Promise<void>;

  /**
   * Verify webhook signature
   * @param input - Webhook verification input
   * @param input.payload - Raw webhook payload
   * @param input.signature - Webhook signature
   * @returns True if the webhook is authentic, false otherwise
   */
  verifyWebhookSignature(input: TVerifyWebhookInput): boolean;

  /**
   * Get supported payment methods for this provider
   * @returns Array of supported payment methods
   */
  getSupportedMethods(): PaymentMethod[];

  /**
   * Create customer profile with payment provider
   * @param customer - Customer information
   * @returns Provider customer ID
   */
  createCustomer(customer: TCustomerInfo): Promise<string>;

  /**
   * Update customer information
   * @param input - Customer update input
   * @param input.customerId - Provider customer ID
   * @param input.customer - Updated customer information
   * @returns void
   */
  updateCustomer(input: TUpdateCustomerInput): Promise<void>;
}
