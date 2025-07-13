/**
 * Main payment service
 * Provides high-level payment operations using the orchestrator service
 */
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

import { ErrorCode } from '@/common/errors';
import { ILogger, InjectLogger } from '@/modules/common/logger';
import {
  PaymentEntity,
  TTypeOrmFilterAtomicQuery,
  TTypeOrmSort,
} from '@/database';

import { TOffsetPaginatedResult } from '@/types';

import { PAYMENTS_MODULE_OPTIONS } from '../constants';
import { GetUserPaymentsListDto } from '../dtos';
import { PaymentStatus } from '../enums';
import { PaymentError } from '../errors';
import { IPaymentProvider } from '../interfaces';
import {
  TCreatePaymentInput,
  TPaymentCreationResult,
  TPaymentDetails,
  TPaymentRefundResult,
  TPaymentsModuleOptions,
  TPaymentStatistics,
  TPaymentValidationResult,
  TRefundPaymentInput,
} from '../types';
import { IdempotencyService } from './idempotency.service';
import { PaymentOrchestratorService } from './payment-orchestrator.service';
import { PaymentValidationsService } from './payment-validations.service';
import { PaymentsService } from './payments.service';

/**
 * Main payment service
 * Coordinates payment operations using the orchestrator service
 *
 * @class PaymentManagerService
 */
@Injectable()
export class PaymentManagerService {
  public constructor(
    @InjectLogger() private readonly _logger: ILogger,
    @Inject(PAYMENTS_MODULE_OPTIONS)
    private readonly _moduleOptions: TPaymentsModuleOptions,
    private readonly _orchestratorService: PaymentOrchestratorService,
    private readonly _validationsService: PaymentValidationsService,
    private readonly _idempotencyService: IdempotencyService,
    private readonly _paymentsService: PaymentsService
  ) {}

  /**
   * Create a new payment
   * @param input - Payment creation input
   * @param provider - Payment provider instance
   * @param idempotencyKey - Optional idempotency key
   * @returns Payment creation result
   */
  public async createPayment(
    input: TCreatePaymentInput,
    provider: IPaymentProvider,
    idempotencyKey?: string
  ): Promise<TPaymentCreationResult> {
    this._logger.info('Creating payment', {
      data: {
        userId: input.metadata.userId,
        teacherId: input.metadata.teacherId,
        amount: input.amount.amount,
        currency: input.amount.currency,
        provider: provider.name,
      },
    });

    try {
      // Orchestrate payment creation
      const result = await this._orchestratorService.orchestratePaymentCreation(
        input,
        provider,
        idempotencyKey
      );

      // Transform orchestrator result to service result
      const paymentResult: TPaymentCreationResult = {
        paymentId: result.paymentId,
        transactionId: result.transactionId,
        status: result.providerResponse.status,
        clientSecret: result.providerResponse.metadata?.clientSecret as string,
        providerTransactionId: result.providerResponse.providerTransactionId,
        requiresAction: result.providerResponse.metadata
          ?.requiresAction as boolean,
        actionType: result.providerResponse.metadata?.actionType as string,
        actionUrl: result.providerResponse.metadata?.actionUrl as string,
        metadata: result.providerResponse.metadata,
        warnings: result.warnings,
      };

      this._logger.info('Payment created successfully', {
        data: {
          paymentId: result.paymentId,
          status: result.providerResponse.status,
          provider: provider.name,
        },
      });

      return paymentResult;
    } catch (error) {
      this._logger.error('Payment creation failed', {
        error,
        data: {
          userId: input.metadata.userId,
          amount: input.amount.amount,
          currency: input.amount.currency,
        },
      });
      throw error;
    }
  }

  /**
   * Refund a payment
   * @param paymentId - Payment ID to refund
   * @param input - Refund input
   * @param provider - Payment provider instance
   * @returns Payment refund result
   */
  public async refundPayment(
    paymentId: number,
    input: TRefundPaymentInput,
    provider: IPaymentProvider
  ): Promise<TPaymentRefundResult> {
    this._logger.info('Refunding payment', {
      data: {
        paymentId,
        refundAmount: input.amount?.amount,
        reason: input.reason,
        provider: provider.name,
      },
    });

    try {
      // Orchestrate payment refund
      const result = await this._orchestratorService.orchestratePaymentRefund(
        paymentId,
        provider,
        input.amount?.amount,
        input.reason
      );

      // Transform orchestrator result to service result
      const refundResult: TPaymentRefundResult = {
        paymentId: result.paymentId,
        refundTransactionId: result.transactionId,
        status: result.providerResponse.status,
        refundAmount: result.providerResponse.amount?.amount || 0,
        currency:
          result.providerResponse.amount?.currency ||
          this._moduleOptions.defaultCurrency,
        providerTransactionId: result.providerResponse.providerTransactionId,
        metadata: result.providerResponse.metadata,
      };

      this._logger.info('Payment refunded successfully', {
        data: {
          paymentId: result.paymentId,
          refundAmount: refundResult.refundAmount,
          status: result.providerResponse.status,
        },
      });

      return refundResult;
    } catch (error) {
      this._logger.error('Payment refund failed', {
        error,
        data: {
          paymentId,
          refundAmount: input.amount?.amount,
        },
      });
      throw error;
    }
  }

  /**
   * Get payment details
   * @param paymentId - Payment ID
   * @returns Payment details
   */
  public async getPaymentDetails(paymentId: number): Promise<TPaymentDetails> {
    this._logger.debug('Getting payment details', { data: { paymentId } });

    try {
      const payment = await this._paymentsService.findById({
        id: paymentId,
        options: { relations: { transactions: true } },
      });

      if (!payment) {
        throw new PaymentError(
          `Payment not found: ${paymentId.toString()}`,
          ErrorCode.NOT_FOUND_ERROR,
          HttpStatus.NOT_FOUND,
          { identifier: paymentId.toString() }
        );
      }

      const paymentDetails: TPaymentDetails = {
        id: payment.id,
        userId: payment.userId,
        teacherId: payment.teacherId || undefined,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        description: payment.description || undefined,
        metadata: payment.metadata || undefined,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        processedAt: payment.processedAt || undefined,
        failedAt: payment.failedAt || undefined,
        refundedAt: payment.refundedAt || undefined,
        transactions:
          payment.transactions?.map((tx) => ({
            id: tx.id,
            type: tx.transactionType.toString(),
            status: tx.status,
            amount: tx.amount,
            providerTransactionId: tx.providerTransactionId || undefined,
            createdAt: tx.createdAt,
            completedAt: tx.completedAt || undefined,
            errorMessage: tx.errorMessage || undefined,
          })) || [],
      };

      return paymentDetails;
    } catch (error) {
      this._logger.error('Failed to get payment details', {
        error,
        data: {
          paymentId,
        },
      });
      throw error;
    }
  }

  /**
   * Get payment status
   * @param paymentId - Payment ID
   * @returns Payment status
   */
  public async getPaymentStatus(paymentId: number): Promise<PaymentStatus> {
    this._logger.debug('Getting payment status', { data: { paymentId } });

    try {
      const payment = await this._paymentsService.findById({
        id: paymentId,
        options: { select: { status: true } },
      });

      if (!payment) {
        throw new PaymentError(
          `Payment not found: ${paymentId.toString()}`,
          ErrorCode.NOT_FOUND_ERROR,
          HttpStatus.NOT_FOUND,
          { identifier: paymentId.toString() }
        );
      }

      return payment.status;
    } catch (error) {
      this._logger.error('Failed to get payment status', {
        error,
        data: {
          paymentId,
        },
      });
      throw error;
    }
  }

  /**
   * List user payments
   * @param userId - User ID
   * @param options - Query options
   * @returns User payments
   */
  public async getUserPayments(
    userId: number,
    input: GetUserPaymentsListDto
  ): Promise<TPaymentDetails[] | TOffsetPaginatedResult<TPaymentDetails>> {
    const {
      limit,
      page,
      status,
      startDate,
      endDate,
      withoutPagination,
      sortBy,
    } = input;
    this._logger.debug('Getting user payments', { data: { userId, input } });

    try {
      const filter: TTypeOrmFilterAtomicQuery<PaymentEntity> = {
        userId,
      };
      if (status) {
        filter.status = status;
      }
      if (startDate) {
        filter.createdAt = MoreThanOrEqual(startDate);
      }
      if (endDate) {
        filter.createdAt = LessThanOrEqual(endDate);
      }

      const sort: TTypeOrmSort<PaymentEntity> = {
        ...Object.keys(sortBy).reduce((acc, key) => {
          acc[key as keyof PaymentEntity] = sortBy[key];
          return acc;
        }, {} as TTypeOrmSort<PaymentEntity>),
      };

      if (withoutPagination) {
        const payments = await this._paymentsService.findMany({
          filter,
          sort,
          relations: {
            transactions: true,
          },
        });

        return this._mapPaymentList(payments);
      }

      const payments = await this._paymentsService.paginateOffset({
        pagination: {
          limit,
          page,
          withoutPagination,
          sortBy,
        },
        relations: {
          transactions: true,
        },
        filter,
        sort,
      });

      const mappedPaymentList = this._mapPaymentList(payments.items);

      return {
        ...payments,
        items: mappedPaymentList,
      };
    } catch (error) {
      this._logger.error('Failed to get user payments', {
        error,
        data: { userId },
      });
      throw error;
    }
  }

  /**
   * Check if idempotency key exists
   * @param idempotencyKey - Idempotency key
   * @returns Whether the key exists
   */
  public async checkIdempotencyKey(idempotencyKey: string): Promise<boolean> {
    try {
      const existingResponse =
        await this._idempotencyService.checkIdempotencyKey(idempotencyKey);
      return existingResponse !== null;
    } catch (error) {
      this._logger.error('Failed to check idempotency key', {
        error,
        data: {
          idempotencyKey,
        },
      });
      throw error;
    }
  }

  /**
   * Validate payment creation input
   * @param input - Payment creation input
   * @returns Validation result
   */
  public async validatePaymentCreation(
    input: TCreatePaymentInput
  ): Promise<TPaymentValidationResult> {
    try {
      return await this._validationsService.validatePaymentCreation(input);
    } catch (error) {
      this._logger.error('Payment validation failed', {
        error,
        data: {
          userId: input.metadata.userId,
          amount: input.amount.amount,
        },
      });
      throw error;
    }
  }

  /**
   * Get payment statistics for a user
   * @param userId - User ID
   * @returns Payment statistics
   */
  public async getPaymentStatistics(
    userId: number
  ): Promise<TPaymentStatistics> {
    this._logger.debug('Getting payment statistics', { data: { userId } });

    try {
      const stats = await this._paymentsService
        .getQueryBuilder('payment')
        .select([
          'COUNT(*) as totalPayments',
          'COALESCE(SUM(payment.amount), 0) as totalAmount',
          'COUNT(CASE WHEN payment.status = :completed THEN 1 END) as successfulPayments',
          'COUNT(CASE WHEN payment.status = :failed THEN 1 END) as failedPayments',
          'COUNT(CASE WHEN payment.status IN (:...refunded) THEN 1 END) as refundedPayments',
        ])
        .where('payment.userId = :userId', { userId })
        .setParameters({
          completed: PaymentStatus.COMPLETED,
          failed: PaymentStatus.FAILED,
          refunded: [PaymentStatus.REFUNDED, PaymentStatus.PARTIALLY_REFUNDED],
        })
        .getRawOne<TPaymentStatistics>();

      return {
        totalPayments: stats?.totalPayments ?? 0,
        totalAmount: stats?.totalAmount ?? 0,
        successfulPayments: stats?.successfulPayments ?? 0,
        failedPayments: stats?.failedPayments ?? 0,
        refundedPayments: stats?.refundedPayments ?? 0,
      };
    } catch (error) {
      this._logger.error('Failed to get payment statistics', {
        error,
        data: {
          userId,
        },
      });
      throw error;
    }
  }

  /**
   * Map the payment list data to send to client
   * @param paymentList - Payment list to map
   * @returns The mapped payment list
   */
  private _mapPaymentList(paymentList: PaymentEntity[]): TPaymentDetails[] {
    return paymentList?.map((payment) => ({
      id: payment.id,
      userId: payment.userId,
      teacherId: payment.teacherId || undefined,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      description: payment.description || undefined,
      metadata: payment.metadata || undefined,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      processedAt: payment.processedAt || undefined,
      failedAt: payment.failedAt || undefined,
      refundedAt: payment.refundedAt || undefined,
      transactions:
        payment.transactions?.map((tx) => ({
          id: tx.id,
          type: tx.transactionType.toString(),
          status: tx.status,
          amount: tx.amount,
          providerTransactionId: tx.providerTransactionId || undefined,
          createdAt: tx.createdAt,
          completedAt: tx.completedAt || undefined,
          errorMessage: tx.errorMessage || undefined,
        })) || [],
    }));
  }
}
