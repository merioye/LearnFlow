import { PaymentMethod, PaymentStatus } from '../enums';
import {
  TPaymentProviderResponse,
  TProcessPaymentInput,
  TProcessRefundInput,
  TVerifyWebhookInput,
} from '../types';

/**
 * Strategy interface for different payment processing approaches
 * Implements the Strategy pattern for payment processing
 */
export interface IPaymentStrategy {
  /**
   * Process a payment using this strategy
   * @param input - Payment processing input
   * @param input.amount - Payment amount and currency information
   * @param input.customer - Customer information
   * @param input.metadata - Additional payment metadata
   * @returns Payment provider response with transaction details
   */
  processPayment(
    input: TProcessPaymentInput
  ): Promise<TPaymentProviderResponse>;

  /**
   * Handle refund processing
   * @param input - Refund processing input
   * @param input.transactionId - Original transaction ID
   * @param input.amount - Refund amount (optional for full refund)
   * @param input.reason - Reason for refund (optional)
   * @returns Payment provider response with transaction details
   */
  processRefund(input: TProcessRefundInput): Promise<TPaymentProviderResponse>;

  /**
   * Verify webhook authenticity
   * @param input - Webhook verification input
   * @param input.payload - Raw webhook payload
   * @param input.signature - Webhook signature
   * @returns True if the webhook is authentic, false otherwise
   */
  verifyWebhook(input: TVerifyWebhookInput): boolean;

  /**
   * Get payment status from provider
   * @param transactionId - Provider transaction ID
   * @returns Payment status
   */
  getPaymentStatus(transactionId: number): Promise<PaymentStatus>;

  /**
   * Check if this strategy supports the given payment method
   * @param method - Payment method to check
   * @returns True if the strategy supports the given payment method, false otherwise
   */
  supports(method: PaymentMethod): boolean;
}
