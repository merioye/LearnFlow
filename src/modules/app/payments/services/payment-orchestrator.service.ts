/**
 * Payment orchestrator service
 * Coordinates complex payment workflows and multi-step operations
 */

import { HttpStatus, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';

import { ErrorCode } from '@/common/errors';
import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
import { ILogger, InjectLogger } from '@/modules/common/logger';
import {
  PaymentEntity,
  PaymentTransactionEntity,
  SubscriptionTierEntity,
  UserEntity,
} from '@/database';

import {
  PaymentFlowType,
  PaymentProvider,
  PaymentStatus,
  ProviderTransactionType,
  TransactionType,
} from '../enums';
import {
  PaymentError,
  PaymentInternalServerError,
  PaymentValidationError,
} from '../errors';
import { IPaymentProvider } from '../interfaces';
import {
  TCreatePaymentInput,
  TPaymentMetadata,
  TPaymentOperationResult,
  TPaymentProviderResponse,
  TPaymentRollbackContext,
  TPaymentWorkflowContext,
} from '../types';
import { PaymentUtils } from '../utils';
import { IdempotencyService } from './idempotency.service';
import { PaymentTransactionsService } from './payment-transactions.service';
import { PaymentValidationsService } from './payment-validations.service';
import { PaymentsService } from './payments.service';

/**
 * Main payment orchestrator
 * Handles complex payment workflows with proper transaction management
 *
 * @class PaymentOrchestratorService
 */
@Injectable()
export class PaymentOrchestratorService {
  public constructor(
    @InjectDateTime() private readonly _dateTime: IDateTime,
    @InjectLogger() private readonly _logger: ILogger,
    private readonly _validationsService: PaymentValidationsService,
    private readonly _idempotencyService: IdempotencyService,
    private readonly _paymentsService: PaymentsService,
    private readonly _paymentTransactionsService: PaymentTransactionsService
  ) {}

  /**
   * Orchestrate payment creation workflow
   * @param input - Payment creation input
   * @param provider - Payment provider instance
   * @param idempotencyKey - Optional idempotency key
   * @returns Payment operation result
   */
  public async orchestratePaymentCreation(
    input: TCreatePaymentInput,
    provider: IPaymentProvider,
    idempotencyKey?: string
  ): Promise<TPaymentOperationResult> {
    const context: TPaymentWorkflowContext = {
      userId: input.metadata.userId,
      teacherId: input.metadata.teacherId,
      provider: provider.name,
      step: 'initialization',
      metadata: { ...input.metadata },
    };

    this._logger.info('Starting payment orchestration', { data: context });

    let queryRunner: QueryRunner | null = null;

    try {
      // Step 1: Check idempotency
      if (idempotencyKey) {
        const existingResponse =
          await this._idempotencyService.checkIdempotencyKey(idempotencyKey);
        if (existingResponse) {
          return this._createSuccessResult(existingResponse, context);
        }
      }

      // Step 2: Validate payment request
      context.step = 'validation';
      const validationResult =
        await this._validationsService.validatePaymentCreation(input);
      if (!validationResult.isValid) {
        throw new PaymentValidationError(
          `Payment validation failed: ${validationResult.errors.join(', ')}`,
          {
            validationErrors: validationResult.errors,
          }
        );
      }

      // Step 3: Start database transaction
      context.step = 'database_transaction';
      queryRunner = await this._paymentsService.startTransaction();

      // Step 4: Create initial payment record
      context.step = 'payment_creation';
      const payment = await this._createPaymentRecord(input, queryRunner);
      context.paymentId = payment.id;

      // Step 5: Create initial transaction record
      context.step = 'transaction_creation';
      const transaction = await this._createTransactionRecord(
        payment,
        provider.name,
        queryRunner,
        idempotencyKey
      );
      context.transactionId = transaction.id;

      // Step 6: Process payment with provider
      context.step = 'provider_processing';
      const providerResponse = await this._processPaymentWithProvider(
        input,
        provider,
        context
      );

      // Step 7: Update records with provider response
      context.step = 'record_update';
      await this._updatePaymentRecords(
        payment,
        transaction,
        providerResponse,
        queryRunner
      );

      // Step 8: Handle post-processing based on flow type
      context.step = 'post_processing';
      await this._handlePostProcessing(payment, providerResponse, queryRunner);

      // Step 9: Commit transaction
      context.step = 'commit';
      await this._paymentsService.commitTransaction(queryRunner);

      // Step 10: Store idempotency key
      if (idempotencyKey) {
        await this._idempotencyService.storeIdempotencyKey(
          idempotencyKey,
          providerResponse,
          payment.id
        );
      }

      this._logger.info('Payment orchestration completed successfully', {
        data: {
          ...context,
          paymentId: payment.id,
          transactionId: transaction.id,
          status: providerResponse.status,
        },
      });

      return {
        success: true,
        paymentId: payment.id,
        transactionId: transaction.id,
        providerResponse,
        workflowContext: context,
        warnings: validationResult.warnings,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Something went wrong in payment orchestration flow';

      // Rollback transaction if needed
      if (queryRunner?.isTransactionActive) {
        await this._paymentsService.rollbackTransaction(queryRunner);
      }

      // Handle rollback scenarios
      if (context.paymentId) {
        await this._handlePaymentRollback({
          paymentId: context.paymentId,
          transactionId: context.transactionId || 0,
          step: context.step,
          reason: errorMessage,
          metadata: context.metadata,
        });
      }

      this._logger.error('Payment orchestration failed', {
        error,
        data: context,
      });

      if (error instanceof PaymentError) throw error;

      throw new PaymentInternalServerError(errorMessage, {
        paymentId: context.paymentId,
        userId: context.userId,
        teacherId: context.teacherId,
        provider: context.provider,
        operation: 'payment_creation',
        amount: input.amount.amount,
        currency: input.amount.currency,
      });
    }
  }

  /**
   * Orchestrate payment refund workflow
   * @param paymentId - Payment ID to refund
   * @param refundAmount - Refund amount (optional for full refund)
   * @param reason - Refund reason
   * @param provider - Payment provider instance
   * @returns Payment operation result
   */
  public async orchestratePaymentRefund(
    paymentId: number,
    provider: IPaymentProvider,
    refundAmount?: number,
    reason?: string
  ): Promise<TPaymentOperationResult> {
    const context: TPaymentWorkflowContext = {
      paymentId,
      userId: 0, // Will be populated from payment entity
      provider: provider.name,
      step: 'refund_initialization',
      metadata: { refundAmount, reason },
    };

    this._logger.info('Starting refund orchestration', { data: context });

    let queryRunner: QueryRunner | null = null;

    try {
      // Step 1: Validate refund request
      context.step = 'refund_validation';
      const validationResult =
        await this._validationsService.validateRefundRequest(
          paymentId,
          refundAmount
        );
      if (!validationResult.isValid) {
        throw new PaymentValidationError(
          `Refund validation failed: ${validationResult.errors.join(', ')}`,
          { validationErrors: validationResult.errors }
        );
      }

      // Step 2: Get payment details
      context.step = 'payment_retrieval';
      const payment = await this._paymentsService.findById({
        id: paymentId,
        options: {
          relations: {
            transactions: true,
            refundRequests: true,
          },
        },
      });

      if (!payment) {
        throw new PaymentError(
          'Payment not found',
          ErrorCode.NOT_FOUND_ERROR,
          HttpStatus.NOT_FOUND,
          { paymentId }
        );
      }

      // Step 3: Start database transaction
      context.step = 'database_transaction';
      queryRunner = await this._paymentsService.startTransaction();

      // Step 4: Process refund with provider
      context.step = 'provider_refund_processing';
      const refundResponse = await provider.refundPayment({
        transactionId: payment.id,
        amount: refundAmount
          ? {
              amount: refundAmount,
              currency: payment.currency,
            }
          : undefined,
        reason,
      });

      // Step 5: Update payment records
      context.step = 'refund_record_update';
      await this._updateRefundRecords(
        payment,
        refundResponse,
        provider,
        queryRunner
      );

      // Step 6: Handle settlement adjustments
      context.step = 'settlement_adjustment';
      await this._handleSettlementAdjustments(
        payment,
        refundResponse,
        queryRunner
      );

      // Step 7: Commit transaction
      context.step = 'commit';
      await this._paymentsService.commitTransaction(queryRunner);

      this._logger.info('Refund orchestration completed successfully', {
        data: {
          ...context,
          refundAmount: refundResponse.amount?.amount,
          status: refundResponse.status,
        },
      });

      return {
        success: true,
        paymentId,
        transactionId: refundResponse.transactionId,
        providerResponse: refundResponse,
        workflowContext: context,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Something went wrong in payment refund orchestration flow';

      if (queryRunner?.isTransactionActive) {
        await this._paymentsService.commitTransaction(queryRunner);
      }

      this._logger.error('Refund orchestration failed', {
        error,
        data: context,
      });

      if (error instanceof PaymentError) throw error;

      throw new PaymentInternalServerError(errorMessage, {
        paymentId,
        provider: context.provider,
        operation: 'payment_refund',
      });
    }
  }

  /**
   * Create payment record in database
   * @param input - Payment input
   * @param queryRunner - QueryRunner instance
   * @returns Created payment entity
   */
  private async _createPaymentRecord(
    input: TCreatePaymentInput,
    queryRunner: QueryRunner
  ): Promise<PaymentEntity> {
    const userId = input.metadata.userId;
    const subscriptionTierId = input.metadata.subscriptionId;

    const payment = await this._paymentsService.create({
      data: {
        userId: userId,
        user: { id: userId } as UserEntity,
        paymentType: this._getTransactionType(input.metadata),
        flowType: input.metadata.flowType,
        itemId: (input.metadata.courseId || input.metadata.orderId) ?? null,
        subscriptionTierId: subscriptionTierId ?? null,
        subscriptionTier: subscriptionTierId
          ? ({ id: subscriptionTierId } as SubscriptionTierEntity)
          : null,
        teacherId: input.metadata.teacherId ?? null,
        amount: input.amount.amount,
        currency: input.amount.currency,
        description: this._generatePaymentDescription(input.metadata),
        status: PaymentStatus.PENDING,
        metadata: input.metadata.additionalData ?? null,
        successUrl: input.metadata.successUrl ?? null,
        cancelUrl: input.metadata.cancelUrl ?? null,
        paymentReference: PaymentUtils.generatePaymentReference(),
        paymentMethod: input.metadata.paymentMethod,
        // Default values, these values will be updated once actual payment is done or in later steps/operations
        providerTransactionId: null,
        providerCustomerId: input.customer.id, // TODO: come here again
        failureReason: null,
        providerErrorCode: null,
        clientSecret: null,
        commissionRate: null,
        commissionAmount: null,
        netAmount: null,
        processedAt: null,
        failedAt: null,
        refundedAt: null,
        expiresAt: null,
        transactions: [],
        settlements: [],
        refundRequests: [],
        webhookLogs: [],
      },
      options: { queryRunner },
    });

    return payment;
  }

  /**
   * Create transaction record in database
   * @param payment - Payment entity
   * @param provider - Provider name
   * @param queryRunner - QueryRunner instance
   * @param idempotencyKey - Idempotency key
   * @returns Created transaction entity
   */
  private async _createTransactionRecord(
    payment: PaymentEntity,
    provider: PaymentProvider,
    queryRunner: QueryRunner,
    idempotencyKey?: string
  ): Promise<PaymentTransactionEntity> {
    const transaction = await this._paymentTransactionsService.create({
      data: {
        paymentId: payment.id,
        payment: { id: payment.id } as PaymentEntity,
        transactionType: ProviderTransactionType.ATTEMPT,
        provider: provider,
        amount: payment.amount,
        currency: payment.currency,
        status: PaymentStatus.PENDING,
        idempotencyKey: idempotencyKey ?? null,
        startedAt: this._dateTime.toUTC(this._dateTime.now()),
        // Default values, these values will be updated once actual payment transaction is done or in later steps/operations
        providerTransactionId: null,
        requestPayload: null, // TODO: come here again
        responsePayload: null,
        errorCode: null,
        errorMessage: null,
        providerFee: null,
        processingDurationMs: null,
        parentTransactionId: null,
        retryAttempt: 0,
        metadata: null,
        completedAt: null,
      },
      options: { queryRunner },
    });

    return transaction;
  }

  /**
   * Process payment with provider
   * @param input - Payment input
   * @param provider - Payment provider
   * @param context - Workflow context
   * @returns Provider response
   */
  private async _processPaymentWithProvider(
    input: TCreatePaymentInput,
    provider: IPaymentProvider,
    context: TPaymentWorkflowContext
  ): Promise<TPaymentProviderResponse> {
    try {
      const startTime = this._dateTime.timestamp;
      const response = await provider.createPayment(input);
      const processingTime = this._dateTime.timestamp - startTime;

      this._logger.info('Payment processed by provider', {
        data: {
          ...context,
          processingTime,
          providerResponse: {
            success: response.success,
            status: response.status,
            transactionId: response.transactionId,
          },
        },
      });

      return response;
    } catch (error) {
      this._logger.error('Provider payment processing failed', {
        error,
        data: context,
      });

      throw new PaymentInternalServerError(
        `Payment provider ${context.provider} error: ${(error as Error)?.message}`,
        { originalError: error }
      );
    }
  }

  /**
   * Update payment and transaction records with provider response
   * @param payment - Payment entity
   * @param transaction - Transaction entity
   * @param response - Provider response
   * @param queryRunner - QueryRunner instance
   */
  private async _updatePaymentRecords(
    payment: PaymentEntity,
    transaction: PaymentTransactionEntity,
    response: TPaymentProviderResponse,
    queryRunner: QueryRunner
  ): Promise<void> {
    // Update payment
    await this._paymentsService.updateById({
      id: payment.id,
      data: {
        status: response.status,
        providerTransactionId: response.providerTransactionId,
        clientSecret: response.metadata?.clientSecret as string,
        processedAt: response.success
          ? this._dateTime.toUTC(this._dateTime.now())
          : null,
        failedAt: !response.success
          ? this._dateTime.toUTC(this._dateTime.now())
          : null,
        failureReason: response.errorMessage,
        providerErrorCode: response.errorCode,
      },
      options: { queryRunner },
    });

    // Update transaction
    await this._paymentTransactionsService.updateById({
      id: transaction.id,
      data: {
        status: response.status,
        providerTransactionId: response.providerTransactionId,
        responsePayload: response.metadata,
        errorMessage: response.errorMessage,
        errorCode: response.errorCode,
        completedAt: this._dateTime.toUTC(this._dateTime.now()),
        processingDurationMs: response.metadata?.processingTime as number,
      },
      options: { queryRunner },
    });
  }

  /**
   * Handle post-processing based on payment flow type
   * @param payment - Payment entity
   * @param response - Provider response
   * @param queryRunner - QueryRunner instance
   */
  private async _handlePostProcessing(
    payment: PaymentEntity,
    response: TPaymentProviderResponse,
    queryRunner: QueryRunner
  ): Promise<void> {
    if (!response.success) {
      return; // No post-processing for failed payments
    }

    switch (payment.flowType) {
      case PaymentFlowType.ADMIN_FEE_MODEL:
        await this._handleAdminFeeModelPostProcessing(payment, queryRunner);
        break;
      case PaymentFlowType.DIRECT_MODEL:
        await this._handleDirectModelPostProcessing(payment, queryRunner);
        break;
      case PaymentFlowType.SUBSCRIPTION_MODEL:
        await this._handleSubscriptionModelPostProcessing(payment, queryRunner);
        break;
    }
  }

  /**
   * Handle admin fee model post-processing
   * @param payment - Payment entity
   * @param queryRunner - QueryRunner instance
   */
  private async _handleAdminFeeModelPostProcessing(
    payment: PaymentEntity,
    _queryRunner: QueryRunner
  ): Promise<void> {
    // Create settlement record for future processing
    // This would integrate with the settlement service in later steps
    this._logger.info('Admin fee model post-processing', {
      data: {
        paymentId: payment.id,
        teacherId: payment.teacherId,
        amount: payment.amount,
      },
    });

    // Return resolved promise for async consistency
    return Promise.resolve();
  }

  /**
   * Handle direct model post-processing
   * @param payment - Payment entity
   * @param queryRunner - QueryRunner instance
   */
  private async _handleDirectModelPostProcessing(
    payment: PaymentEntity,
    _queryRunner: QueryRunner
  ): Promise<void> {
    // Direct payments require immediate settlement
    this._logger.info('Direct model post-processing', {
      data: {
        paymentId: payment.id,
        teacherId: payment.teacherId,
      },
    });

    // Return resolved promise for async consistency
    return Promise.resolve();
  }

  /**
   * Handle subscription model post-processing
   * @param payment - Payment entity
   * @param queryRunner - QueryRunner instance
   */
  private async _handleSubscriptionModelPostProcessing(
    payment: PaymentEntity,
    _queryRunner: QueryRunner
  ): Promise<void> {
    // Update subscription status and access
    this._logger.info('Subscription model post-processing', {
      data: {
        paymentId: payment.id,
        subscriptionId: payment.subscriptionTierId,
      },
    });

    // Return resolved promise for async consistency
    return Promise.resolve();
  }

  /**
   * Update refund records
   * @param payment - Payment entity
   * @param response - Provider response
   * @param queryRunner - QueryRunner instance
   */
  private async _updateRefundRecords(
    payment: PaymentEntity,
    response: TPaymentProviderResponse,
    provider: IPaymentProvider,
    queryRunner: QueryRunner
  ): Promise<void> {
    // Update payment status
    await this._paymentsService.updateById({
      id: payment.id,
      data: {
        status: response.status,
        refundedAt: response.success
          ? this._dateTime.toUTC(this._dateTime.now())
          : null,
      },
      options: { queryRunner },
    });

    // Create refund transaction record
    await this._paymentTransactionsService.create({
      data: {
        paymentId: payment.id,
        payment: { id: payment.id } as PaymentEntity,
        transactionType: ProviderTransactionType.REFUND,
        provider: provider.name,
        amount: response.amount?.amount || payment.amount,
        currency: payment.currency,
        status: response.status,
        providerTransactionId: response.providerTransactionId,
        responsePayload: response.metadata ?? null,
        completedAt: this._dateTime.toUTC(this._dateTime.now()),
        // Default values, these values will be updated in later steps/operations
        requestPayload: null, // TODO: come here again
        errorCode: null,
        errorMessage: null,
        providerFee: null,
        processingDurationMs: null,
        parentTransactionId: null,
        retryAttempt: 0,
        metadata: null,
        idempotencyKey: null,
        startedAt: null,
      },
      options: { queryRunner },
    });
  }

  /**
   * Handle settlement adjustments for refunds
   * @param payment - Payment entity
   * @param response - Provider response
   * @param queryRunner - QueryRunner instance
   */
  private async _handleSettlementAdjustments(
    payment: PaymentEntity,
    response: TPaymentProviderResponse,
    _queryRunner: QueryRunner
  ): Promise<void> {
    if (
      payment.flowType === PaymentFlowType.ADMIN_FEE_MODEL &&
      payment.teacherId
    ) {
      // Handle settlement adjustments for multi-vendor refunds
      this._logger.info('Processing settlement adjustments for refund', {
        data: {
          paymentId: payment.id,
          teacherId: payment.teacherId,
          refundAmount: response.amount?.amount,
        },
      });
    }

    // Return resolved promise for async consistency
    return Promise.resolve();
  }

  /**
   * Handle payment rollback
   * @param context - Rollback context
   */
  private async _handlePaymentRollback(
    context: TPaymentRollbackContext
  ): Promise<void> {
    this._logger.warn('Handling payment rollback', { data: context });

    try {
      // Mark payment as failed if it exists
      if (context.paymentId) {
        await this._paymentsService.updateById({
          id: context.paymentId,
          data: {
            status: PaymentStatus.FAILED,
            failedAt: this._dateTime.toUTC(this._dateTime.now()),
            failureReason: `Rollback: ${context.reason}`,
          },
        });
      }

      // Update transaction if it exists
      if (context.transactionId) {
        await this._paymentTransactionsService.updateById({
          id: context.transactionId,
          data: {
            status: PaymentStatus.FAILED,
            errorMessage: context.reason,
            completedAt: this._dateTime.toUTC(this._dateTime.now()),
          },
        });
      }
    } catch (error) {
      this._logger.error('Failed to handle payment rollback', {
        ...context,
        error,
        data: context,
      });
    }
  }

  /**
   * Create success result from provider response
   * @param response - Provider response
   * @param context - Workflow context
   * @returns Operation result
   */
  private _createSuccessResult(
    response: TPaymentProviderResponse,
    context: TPaymentWorkflowContext
  ): TPaymentOperationResult {
    return {
      success: response.success,
      paymentId: response.transactionId, // This would need to be mapped properly
      transactionId: response.transactionId,
      providerResponse: response,
      workflowContext: context,
    };
  }

  /**
   * Get transaction type from metadata
   * @param metadata - Payment metadata
   * @returns Transaction type
   */
  private _getTransactionType(metadata: TPaymentMetadata): TransactionType {
    if (metadata.subscriptionId) {
      return TransactionType.SUBSCRIPTION;
    }
    return TransactionType.ONE_TIME;
  }

  /**
   * Generate payment description from metadata
   * @param metadata - Payment metadata
   * @returns Payment description
   */
  private _generatePaymentDescription(metadata: TPaymentMetadata): string {
    if (metadata.subscriptionId) {
      return `Subscription payment for tier ${metadata.subscriptionId}`;
    }
    if (metadata.courseId) {
      return `Course purchase for course ${metadata.courseId}`;
    }
    if (metadata.orderId) {
      return `Order payment for order ${metadata.orderId}`;
    }
    return 'Payment';
  }
}
