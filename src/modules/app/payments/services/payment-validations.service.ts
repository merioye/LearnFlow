/**
 * Payment validation service
 * Handles comprehensive validation of payment requests and data
 */

import { Inject, Injectable } from '@nestjs/common';
import { MoreThanOrEqual } from 'typeorm';

import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
import { ILogger, InjectLogger } from '@/modules/common/logger';

import { SortDirection } from '@/enums';

import { PAYMENTS_MODULE_OPTIONS } from '../constants';
import {
  Currency,
  PaymentFlowType,
  PaymentProvider,
  PaymentStatus,
} from '../enums';
import { PaymentValidationError } from '../errors';
import {
  TCreatePaymentInput,
  TCustomerAddress,
  TCustomerInfo,
  TPaymentAmount,
  TPaymentMetadata,
  TPaymentsModuleOptions,
  TPaymentValidationResult,
} from '../types';
import { PaymentsService } from './payments.service';
import { TeacherPaymentConfigurationsService } from './teacher-payment-configs.service';

/**
 * Payment validation service implementation
 *
 * @class PaymentValidationsService
 */
@Injectable()
export class PaymentValidationsService {
  public constructor(
    @Inject(PAYMENTS_MODULE_OPTIONS)
    private readonly _moduleOptions: TPaymentsModuleOptions,
    @InjectLogger() private readonly _logger: ILogger,
    @InjectDateTime() private readonly _dateTime: IDateTime,
    private readonly _paymentsService: PaymentsService,
    private readonly _teacherPaymentConfigurationsService: TeacherPaymentConfigurationsService
  ) {}

  /**
   * Validate refund request
   * @param paymentId - Payment ID
   * @param refundAmount - Refund amount
   * @returns Validation result
   */
  public async validateRefundRequest(
    paymentId: number,
    refundAmount?: number
  ): Promise<TPaymentValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const payment = await this._paymentsService.findOne({
        filter: { id: paymentId },
        relations: {
          refundRequests: true,
        },
      });

      if (!payment) {
        errors.push('Payment not found');
        return { isValid: false, errors, warnings };
      }

      if (payment.status !== PaymentStatus.COMPLETED) {
        errors.push('Only completed payments can be refunded');
      }

      if (refundAmount) {
        const totalRefunded =
          payment.refundRequests?.reduce(
            (sum, refund) => sum + (refund.approvedAmount ?? 0),
            0
          ) || 0;

        if (refundAmount > payment.amount - totalRefunded) {
          errors.push('Refund amount exceeds available balance');
        }
      }

      // Check refund time limit
      const maxRefundDays = this._moduleOptions.maxRefundDays;
      const refundDeadline = payment.createdAt;
      refundDeadline.setDate(refundDeadline.getDate() + maxRefundDays);

      if (this._dateTime.toUTC(this._dateTime.now()) > refundDeadline) {
        errors.push(`Refund period of ${maxRefundDays} days has expired`);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      this._logger.error('Refund validation failed', {
        error,
        data: { paymentId },
      });
      return {
        isValid: false,
        errors: ['Unable to validate refund request'],
        warnings,
      };
    }
  }

  /**
   * Validate payment creation request
   * @param input - Payment creation input
   * @returns Validation result
   */
  public async validatePaymentCreation(
    input: TCreatePaymentInput
  ): Promise<TPaymentValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate amount
      this._validateAmount(
        input.amount,
        input.metadata.paymentProvider,
        errors
      );

      // Validate currency
      this._validateCurrency(input.amount.currency, errors);

      // Validate customer information
      this._validateCustomerInfo(input.customer, errors);

      // Validate metadata
      this._validatePaymentMetadata(input.metadata, errors);

      // Validate payment flow type
      this._validatePaymentFlowType(input.metadata, errors);

      // Validate teacher configuration (if applicable)
      if (input.metadata.teacherId) {
        await this._validateTeacherConfiguration(
          input.metadata.teacherId,
          errors
        );
      }

      // Check for business rule violations
      await this._validateBusinessRules(input, errors, warnings);

      const isValid = errors.length === 0;

      this._logger.info('Payment validation completed', {
        data: {
          isValid,
          errorsCount: errors.length,
          warningsCount: warnings.length,
          amount: input.amount.amount,
          currency: input.amount.currency,
          flowType: input.metadata.flowType,
        },
      });

      return {
        isValid,
        errors,
        warnings,
        normalizedData: isValid ? this._normalizePaymentData(input) : undefined,
      };
    } catch (error) {
      this._logger.error('Payment validation failed', { error });
      throw new PaymentValidationError(
        'Payment validation failed due to an internal error',
        { originalError: error }
      );
    }
  }

  /**
   * Validate payment amount
   * @param amount - Payment amount to validate
   * @param errors - Array to collect validation errors
   */
  private _validateAmount(
    amount: TPaymentAmount,
    paymentProvider: PaymentProvider,
    errors: string[]
  ): void {
    const providerConfigurations =
      this._moduleOptions.providersConfiguration[paymentProvider];
    if (!providerConfigurations) {
      errors.push(`Payment method '${paymentProvider}' not supported`);
      return;
    }

    const minAmountLimit =
      providerConfigurations[`MIN_AMOUNT_${amount.currency}`];
    const maxAmountLimit =
      providerConfigurations[`MAX_AMOUNT_${amount.currency}`];
    if (!minAmountLimit || !maxAmountLimit) {
      errors.push(`Payment method currency '${amount.currency}' not supported`);
      return;
    }

    if (!amount || typeof amount.amount !== 'number') {
      errors.push('Payment amount is required and must be a number');
      return;
    }

    if (amount.amount <= 0) {
      errors.push('Payment amount must be greater than zero');
    }

    if (amount.amount > maxAmountLimit) {
      errors.push(
        `Payment amount exceeds maximum limit of '${maxAmountLimit}'`
      );
    }

    if (amount.amount < minAmountLimit) {
      errors.push(`Payment amount must be at least '${minAmountLimit}'`);
    }

    // Check for precision issues
    if (Math.round(amount.amount * 100) / 100 !== amount.amount) {
      errors.push(
        'Payment amount has invalid precision (maximum 2 decimal places)'
      );
    }
  }

  /**
   * Validate currency
   * @param currency - Currency to validate
   * @param errors - Array to collect validation errors
   */
  private _validateCurrency(currency: Currency, errors: string[]): void {
    if (!currency) {
      errors.push('Currency is required');
      return;
    }

    const supportedCurrencies = this._moduleOptions.supportedCurrencies || [];
    if (!supportedCurrencies.includes(currency)) {
      errors.push(`Currency '${currency}' is not supported`);
    }
  }

  /**
   * Validate customer information
   * @param customer - Customer info to validate
   * @param errors - Array to collect validation errors
   */
  private _validateCustomerInfo(
    customer: TCustomerInfo,
    errors: string[]
  ): void {
    if (!customer) {
      errors.push('Customer information is required');
      return;
    }

    if (!customer.email || !this._isValidEmail(customer.email)) {
      errors.push('Valid customer email is required');
    }

    if (!customer.name || customer.name.trim().length < 2) {
      errors.push('Customer name must be at least 2 characters long');
    }

    if (customer.phone && !this._isValidPhone(customer.phone)) {
      errors.push('Invalid phone number format');
    }

    // Validate address if provided
    if (customer.address) {
      this._validateAddress(customer.address, errors);
    }
  }

  /**
   * Validate payment metadata
   * @param metadata - Payment metadata to validate
   * @param errors - Array to collect validation errors
   */
  private _validatePaymentMetadata(
    metadata: TPaymentMetadata,
    errors: string[]
  ): void {
    if (!metadata) {
      errors.push('Payment metadata is required');
      return;
    }

    if (!metadata.userId || typeof metadata.userId !== 'number') {
      errors.push('Valid user ID is required');
    }

    if (
      !metadata.flowType ||
      !Object.values(PaymentFlowType).includes(metadata.flowType)
    ) {
      errors.push('Valid payment flow type is required');
    }

    // Validate item references based on flow type
    if (metadata.flowType === PaymentFlowType.SUBSCRIPTION_MODEL) {
      if (!metadata.subscriptionId) {
        errors.push('Subscription ID is required for subscription payments');
      }
    } else {
      if (!metadata.courseId && !metadata.orderId) {
        errors.push(
          'Course ID or Order ID is required for non-subscription payments'
        );
      }
    }

    // Validate teacher ID for multi-vendor flows
    if (
      [PaymentFlowType.ADMIN_FEE_MODEL, PaymentFlowType.DIRECT_MODEL].includes(
        metadata.flowType
      ) &&
      !metadata.teacherId
    ) {
      errors.push('Teacher ID is required for multi-vendor payments');
    }
  }

  /**
   * Validate payment flow type
   * @param metadata - Payment metadata
   * @param errors - Array to collect validation errors
   */
  private _validatePaymentFlowType(
    metadata: TPaymentMetadata,
    errors: string[]
  ): void {
    if (!this._moduleOptions.enableMultiVendor) {
      if (metadata.flowType !== PaymentFlowType.SUBSCRIPTION_MODEL) {
        errors.push('Multi-vendor payments are not enabled');
      }
    }

    if (!this._moduleOptions.enableSubscriptions) {
      if (metadata.flowType === PaymentFlowType.SUBSCRIPTION_MODEL) {
        errors.push('Subscription payments are not enabled');
      }
    }
  }

  /**
   * Validate teacher payment configuration
   * @param teacherId - Teacher ID to validate
   * @param errors - Array to collect validation errors
   */
  private async _validateTeacherConfiguration(
    teacherId: number,
    errors: string[]
  ): Promise<void> {
    try {
      const teacherConfig =
        await this._teacherPaymentConfigurationsService.findOne({
          filter: { teacherId, isActive: true },
        });

      if (!teacherConfig) {
        errors.push('Teacher payment configuration not found or inactive');
        return;
      }

      if (!teacherConfig.payoutConfig) {
        errors.push('Teacher must have payout configuration setup');
      }
    } catch (error) {
      this._logger.error('Error validating teacher configuration', {
        error,
        data: {
          teacherId,
        },
      });
      errors.push('Unable to validate teacher payment configuration');
    }
  }

  /**
   * Validate business rules
   * @param input - Payment input
   * @param errors - Array to collect validation errors
   * @param warnings - Array to collect validation warnings
   */
  private async _validateBusinessRules(
    input: TCreatePaymentInput,
    errors: string[],
    warnings: string[]
  ): Promise<void> {
    // Check for duplicate payments
    await this._checkForDuplicatePayments(input, warnings);

    // Validate payment limits
    await this._validatePaymentLimits(input, errors);

    // Check fraud indicators
    await this._checkFraudIndicators(input, warnings);
  }

  /**
   * Check for duplicate payments
   * @param input - Payment input
   * @param warnings - Array to collect warnings
   */
  private async _checkForDuplicatePayments(
    input: TCreatePaymentInput,
    warnings: string[]
  ): Promise<void> {
    const recentPayments = await this._paymentsService.findMany({
      filter: {
        userId: input.metadata.userId,
        amount: input.amount.amount,
        currency: input.amount.currency,
        status: PaymentStatus.COMPLETED,
      },
      sort: {
        createdAt: SortDirection.DESC,
      },
      limit: 5,
    });

    const fiveMinsInMills = 5 * 60 * 1000; // 5 minutes in milliseconds
    const duplicateFound = recentPayments.some(
      (payment) =>
        payment.createdAt.getTime() > this._dateTime.timestamp - fiveMinsInMills
    );

    if (duplicateFound) {
      warnings.push('Similar payment found within the last 5 minutes');
    }
  }

  /**
   * Validate payment limits
   * @param input - Payment input
   * @param errors - Array to collect errors
   */
  private async _validatePaymentLimits(
    input: TCreatePaymentInput,
    errors: string[]
  ): Promise<void> {
    // Daily limit check
    const today = this._dateTime.toUTC(this._dateTime.now());
    today.setHours(0, 0, 0, 0);

    const dailyPayments = await this._paymentsService.findMany({
      filter: {
        userId: input.metadata.userId,
        status: PaymentStatus.COMPLETED,
        createdAt: MoreThanOrEqual(today),
      },
    });

    const dailyTotal = dailyPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    const DAILY_PAYMENT_LIMIT = 10000;
    if (dailyTotal + input.amount.amount > DAILY_PAYMENT_LIMIT) {
      errors.push('Daily payment limit exceeded');
    }
  }

  /**
   * Check for fraud indicators
   * @param input - Payment input
   * @param warnings - Array to collect warnings
   */
  private async _checkFraudIndicators(
    input: TCreatePaymentInput,
    warnings: string[]
  ): Promise<void> {
    // Check for unusual amounts
    if (input.amount.amount > 5000) {
      warnings.push('Large payment amount detected');
    }

    // Check for rapid payment attempts
    const tenMinsInMills = 10 * 60 * 1000; // 10 minutes in milliseconds
    const recentAttempts = await this._paymentsService.count({
      filter: {
        userId: input.metadata.userId,
        createdAt: this._dateTime.toUTC(
          this._dateTime.timestamp - tenMinsInMills
        ),
      },
    });

    if (recentAttempts > 3) {
      warnings.push('Multiple payment attempts detected');
    }
  }

  /**
   * Normalize payment data
   * @param input - Payment input
   * @returns Normalized payment data
   */
  private _normalizePaymentData(
    input: TCreatePaymentInput
  ): Partial<TCreatePaymentInput> {
    return {
      ...input,
      customer: {
        ...input.customer,
        name: input.customer.name.trim(),
        email: input.customer.email.toLowerCase().trim(),
      },
      amount: {
        ...input.amount,
        amount: Math.round(input.amount.amount * 100) / 100, // Ensure 2 decimal places
      },
    };
  }

  /**
   * Validate email format
   * @param email - Email to validate
   * @returns True if valid
   */
  private _isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   * @param phone - Phone number to validate
   * @returns True if valid
   */
  private _isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate address
   * @param address - Address to validate
   * @param errors - Array to collect errors
   */
  private _validateAddress(address: TCustomerAddress, errors: string[]): void {
    if (!address.line1 || address.line1.trim().length < 5) {
      errors.push('Address line 1 must be at least 5 characters long');
    }

    if (!address.city || address.city.trim().length < 2) {
      errors.push('City must be at least 2 characters long');
    }

    if (!address.country || address.country.trim().length < 2) {
      errors.push('Country must be at least 2 characters long');
    }

    if (!address.postalCode || address.postalCode.trim().length < 3) {
      errors.push('Postal code must be at least 3 characters long');
    }
  }

  // /**
  //  * Get validation rules for a payment provider
  //  * @param method - Payment provider
  //  * @returns Validation rules
  //  */
  // public async getValidationRules(
  //   provider: PaymentProvider
  // ): Promise<TPaymentValidationRules> {
  //   const config = await this._paymentMethodConfigurationsService.findOne({
  //     filter: { provider, isActive: true },
  //   });

  //   if (!config) {
  //     throw new PaymentMethodNotSupportedException(method);
  //   }

  //   return {
  //     minAmount: config.amountLimits?.min || 0.01,
  //     maxAmount: config.amountLimits?.max || 1000000,
  //     supportedCurrencies:
  //       config.supportedCurrencies || Object.values(Currency),
  //     supportedMethods: [method],
  //     requiresCustomerInfo: true,
  //     allowsPartialRefunds: config.allowsPartialRefunds || false,
  //   };
  // }
}
