import { DynamicModule, Module } from '@nestjs/common';

import {
  PAYMENT_DEFAULTS,
  PAYMENTS_MODULE_OPTIONS,
  SUPPORTED_CURRENCIES,
} from './constants';
import { Currency } from './enums';
import { TPaymentsModuleAsyncOptions, TPaymentsModuleOptions } from './types';

/**
 * Main payments module that orchestrates all payment-related functionality
 * Implements a plugin-based architecture for extensibility
 *
 * @module PaymentsModule
 */
@Module({})
export class PaymentsModule {
  /**
   * Register the payments module with synchronous configuration
   * @param options - The options for the payments module
   * @returns The dynamic module for the payments module
   */
  public static register(options: TPaymentsModuleOptions = {}): DynamicModule {
    return {
      module: PaymentsModule,
      providers: [
        {
          provide: PAYMENTS_MODULE_OPTIONS,
          useValue: {
            defaultCurrency: PAYMENT_DEFAULTS.CURRENCY,
            supportedCurrencies: Object.keys(SUPPORTED_CURRENCIES),
            defaultCommissionRate: PAYMENT_DEFAULTS.COMMISSION_RATE,
            maxRefundDays: PAYMENT_DEFAULTS.MAX_REFUND_DAYS,
            settlementDelayDays: PAYMENT_DEFAULTS.SETTLEMENT_DELAY_DAYS,
            webhookRetryAttempts: PAYMENT_DEFAULTS.WEBHOOK_RETRY_ATTEMPTS,
            webhookRetryDelay: PAYMENT_DEFAULTS.WEBHOOK_RETRY_DELAY,
            enableSubscriptions: true,
            enableMultiVendor: true,
            enableCOD: true,
            ...options,
          },
        },
      ],
      exports: [PAYMENTS_MODULE_OPTIONS],
    };
  }

  /**
   * Register the payments module with asynchronous configuration
   * @param options - The options for the payments module
   * @returns The dynamic module for the payments module
   */
  public static registerAsync(
    options: TPaymentsModuleAsyncOptions
  ): DynamicModule {
    return {
      module: PaymentsModule,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      imports: [...(options?.imports || [])],
      providers: [
        {
          provide: PAYMENTS_MODULE_OPTIONS,
          useFactory: async (
            ...args: unknown[]
          ): Promise<TPaymentsModuleOptions> => {
            const config = await options?.useFactory?.(...args);
            return {
              defaultCurrency: PAYMENT_DEFAULTS.CURRENCY,
              supportedCurrencies: Object.keys(
                SUPPORTED_CURRENCIES
              ) as Currency[],
              defaultCommissionRate: PAYMENT_DEFAULTS.COMMISSION_RATE,
              maxRefundDays: PAYMENT_DEFAULTS.MAX_REFUND_DAYS,
              settlementDelayDays: PAYMENT_DEFAULTS.SETTLEMENT_DELAY_DAYS,
              webhookRetryAttempts: PAYMENT_DEFAULTS.WEBHOOK_RETRY_ATTEMPTS,
              webhookRetryDelay: PAYMENT_DEFAULTS.WEBHOOK_RETRY_DELAY,
              enableSubscriptions: true,
              enableMultiVendor: true,
              enableCOD: true,
              ...config,
            };
          },
          inject: options.inject || [],
        },
      ],
      exports: [PAYMENTS_MODULE_OPTIONS],
    };
  }

  /**
   * For root module registration with app-wide configuration
   * @param options - The options for the payments module
   * @returns The dynamic module for the payments module
   */
  public static forRoot(options: TPaymentsModuleOptions = {}): DynamicModule {
    return {
      global: true,
      ...this.register(options),
    };
  }

  /**
   * For feature module registration
   * @returns The dynamic module for the payments module
   */
  public static forFeature(): DynamicModule {
    return {
      module: PaymentsModule,
      // Will be populated with entities and repositories in Step 2
    };
  }
}
