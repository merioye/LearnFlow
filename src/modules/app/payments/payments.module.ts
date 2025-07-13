import { DynamicModule, Module } from '@nestjs/common';

import { PAYMENTS_MODULE_OPTIONS } from './constants';
import {
  IdempotencyService,
  PaymentManagerService,
  PaymentMethodConfigurationsService,
  PaymentOrchestratorService,
  PaymentSettlementsService,
  PaymentsService,
  PaymentTransactionsService,
  PaymentValidationsService,
  RefundRequestsService,
  TeacherPaymentConfigurationsService,
  WebhookLogsService,
} from './services';
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
  public static register(options: TPaymentsModuleOptions): DynamicModule {
    return {
      module: PaymentsModule,
      providers: [
        {
          provide: PAYMENTS_MODULE_OPTIONS,
          useValue: options,
        },
        IdempotencyService,
        PaymentValidationsService,
        PaymentOrchestratorService,
        PaymentManagerService,
        PaymentsService,
        PaymentMethodConfigurationsService,
        PaymentSettlementsService,
        PaymentTransactionsService,
        RefundRequestsService,
        TeacherPaymentConfigurationsService,
        WebhookLogsService,
      ],
      exports: [
        PAYMENTS_MODULE_OPTIONS,
        IdempotencyService,
        PaymentValidationsService,
        PaymentOrchestratorService,
        PaymentManagerService,
        PaymentsService,
        PaymentMethodConfigurationsService,
        PaymentSettlementsService,
        PaymentTransactionsService,
        RefundRequestsService,
        TeacherPaymentConfigurationsService,
        WebhookLogsService,
      ],
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
            return config;
          },
          inject: options.inject || [],
        },
        IdempotencyService,
        PaymentValidationsService,
        PaymentOrchestratorService,
        PaymentManagerService,
        PaymentsService,
        PaymentMethodConfigurationsService,
        PaymentSettlementsService,
        PaymentTransactionsService,
        RefundRequestsService,
        TeacherPaymentConfigurationsService,
        WebhookLogsService,
      ],
      exports: [
        PAYMENTS_MODULE_OPTIONS,
        IdempotencyService,
        PaymentValidationsService,
        PaymentOrchestratorService,
        PaymentManagerService,
        PaymentsService,
        PaymentMethodConfigurationsService,
        PaymentSettlementsService,
        PaymentTransactionsService,
        RefundRequestsService,
        TeacherPaymentConfigurationsService,
        WebhookLogsService,
      ],
    };
  }

  /**
   * For root module registration with app-wide configuration
   * @param options - The options for the payments module
   * @returns The dynamic module for the payments module
   */
  public static forRoot(options: TPaymentsModuleOptions): DynamicModule {
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
