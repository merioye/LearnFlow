import {
  TCreateSubscriptionInput,
  TPaymentProviderResponse,
  TUpdateSubscriptionInput,
} from '../types';
import { IPaymentProvider } from './payment-provider.interface';

/**
 * Extended interface for subscription-capable payment providers
 */
export interface ISubscriptionPaymentProvider extends IPaymentProvider {
  /**
   * Create subscription
   * @param input - Subscription creation input
   * @param input.customerId - Provider customer ID
   * @param input.planId - Subscription plan ID
   * @param input.metadata - Additional subscription metadata
   * @returns Payment provider response with transaction details
   */
  createSubscription(
    input: TCreateSubscriptionInput
  ): Promise<TPaymentProviderResponse>;

  /**
   * Cancel subscription
   * @param subscriptionId - Provider subscription ID
   * @returns Payment provider response with transaction details
   */
  cancelSubscription(subscriptionId: number): Promise<TPaymentProviderResponse>;

  /**
   * Update subscription
   * @param subscriptionId - Provider subscription ID
   * @param planId - Subscription plan ID
   * @returns Payment provider response with transaction details
   */
  updateSubscription(
    input: TUpdateSubscriptionInput
  ): Promise<TPaymentProviderResponse>;

  /**
   * Get subscription status
   * @param subscriptionId - Provider subscription ID
   * @returns Subscription status
   */
  getSubscriptionStatus(subscriptionId: number): Promise<string>;
}
