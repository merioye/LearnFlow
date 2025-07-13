/**
 * Idempotency service for payment operations
 * Ensures duplicate payment requests are handled safely
 */

import { Injectable } from '@nestjs/common';
import { IsNull } from 'typeorm';

import { IHashService, InjectHashService } from '@/modules/common/hash';
import {
  DateTimeUnit,
  IDateTime,
  InjectDateTime,
} from '@/modules/common/helper/date-time';
import { ILogger, InjectLogger } from '@/modules/common/logger';
import { PaymentTransactionEntity } from '@/database';

import { PaymentStatus } from '../enums';
import {
  TCreatePaymentInput,
  TIdempotencyRecord,
  TPaymentProviderResponse,
} from '../types';
import { PaymentUtils } from '../utils';
import { PaymentTransactionsService } from './payment-transactions.service';

/**
 * Idempotency service implementation
 * Handles duplicate payment prevention and response caching
 *
 * @class IdempotencyService
 */
@Injectable()
export class IdempotencyService {
  private readonly _idempotencyCache = new Map<string, TIdempotencyRecord>();

  public constructor(
    @InjectDateTime() private readonly _dateTime: IDateTime,
    @InjectLogger() private readonly _logger: ILogger,
    @InjectHashService()
    private readonly _hashService: IHashService,
    private readonly _paymentTransactionsService: PaymentTransactionsService
  ) {}

  /**
   * Generate idempotency key for a payment request
   * @param input - Payment input data
   * @param userId - User ID making the request
   * @returns Idempotency key
   */
  public generateIdempotencyKey(
    input: TCreatePaymentInput,
    userId: number
  ): string {
    const keyData = {
      userId,
      amount: input.amount.amount,
      currency: input.amount.currency,
      customerEmail: input.customer.email,
      itemId: input.metadata.courseId || input.metadata.subscriptionId,
      timestamp: Math.floor(this._dateTime.timestamp / 1000), // Round to seconds
    };

    const keyString = JSON.stringify(keyData);
    const hash = this._hashService.hashSync(keyString);

    return `payment_${hash.substring(0, 16)}`;
  }

  /**
   * Generate secure idempotency key
   * @param data - Data to hash
   * @returns Secure idempotency key
   */
  public generateSecureIdempotencyKey(data: Record<string, any>): string {
    const sortedData = this._sortObjectKeys(data);
    const keyString = JSON.stringify(sortedData);
    const hash = this._hashService.hashSync(keyString);
    return `secure_${hash.substring(0, 20)}`;
  }

  /**
   * Check if a payment with the same idempotency key exists
   * @param idempotencyKey - Idempotency key to check
   * @returns Existing payment response or null
   */
  public async checkIdempotencyKey(
    idempotencyKey: string
  ): Promise<TPaymentProviderResponse | null> {
    // Check cache first
    const cached = this._idempotencyCache.get(idempotencyKey);
    if (
      cached &&
      cached.expiresAt > this._dateTime.toUTC(this._dateTime.now())
    ) {
      this._logger.info('Idempotency key found in cache', {
        data: {
          key: idempotencyKey,
          paymentId: cached.paymentId,
        },
      });
      return cached.response;
    }

    // Check database
    const existingTransaction = await this._paymentTransactionsService.findOne({
      filter: { idempotencyKey },
      relations: {
        payment: true,
      },
    });

    if (existingTransaction) {
      this._logger.info('Idempotency key found in database', {
        data: {
          key: idempotencyKey,
          paymentId: existingTransaction.paymentId,
          transactionId: existingTransaction.id,
        },
      });

      // Reconstruct response from database
      const response =
        this._reconstructResponseFromTransaction(existingTransaction);

      // Cache the response
      this._cacheIdempotencyRecord(
        idempotencyKey,
        response,
        existingTransaction.paymentId
      );

      return response;
    }

    return null;
  }

  /**
   * Store idempotency key with payment response
   * @param idempotencyKey - Idempotency key
   * @param response - Payment provider response
   * @param paymentId - Payment ID
   */
  public async storeIdempotencyKey(
    idempotencyKey: string,
    response: TPaymentProviderResponse,
    paymentId: number
  ): Promise<void> {
    // Update transaction with idempotency key
    await this._paymentTransactionsService.updateMany({
      filter: { paymentId, idempotencyKey: IsNull() },
      data: { idempotencyKey },
    });

    // Cache the response
    this._cacheIdempotencyRecord(idempotencyKey, response, paymentId);

    this._logger.info('Idempotency key stored', {
      data: {
        key: idempotencyKey,
        paymentId,
        transactionId: response.transactionId,
      },
    });
  }

  /**
   * Handle duplicate payment request
   * @param idempotencyKey - Idempotency key
   * @param existingResponse - Existing payment response
   * @returns Payment response
   */
  public handleDuplicatePayment(
    idempotencyKey: string,
    existingResponse: TPaymentProviderResponse
  ): TPaymentProviderResponse {
    this._logger.warn('Duplicate payment request detected', {
      data: {
        key: idempotencyKey,
        existingPaymentId: existingResponse.transactionId,
      },
    });

    // Return the existing response
    return existingResponse;
  }

  /**
   * Validate idempotency key format
   * @param idempotencyKey - Idempotency key to validate
   * @returns True if valid
   */
  public validateIdempotencyKey(idempotencyKey: string): boolean {
    // Check format: payment_<16-character-hash>
    const pattern = /^payment_[a-f0-9]{16}$/;
    return pattern.test(idempotencyKey);
  }

  /**
   * Clean up expired idempotency records
   * This should be called periodically by a background job
   */
  public cleanupExpiredRecords(): void {
    const now = this._dateTime.toUTC(this._dateTime.now());
    const expiredKeys: string[] = [];

    // Check cache for expired records
    for (const [key, record] of this._idempotencyCache.entries()) {
      if (record.expiresAt <= now) {
        expiredKeys.push(key);
      }
    }

    // Remove expired records from cache
    for (const key of expiredKeys) {
      this._idempotencyCache.delete(key);
    }

    this._logger.info('Cleaned up expired idempotency records', {
      data: {
        expiredCount: expiredKeys.length,
      },
    });
  }

  /**
   * Get idempotency statistics
   * @returns Idempotency statistics
   */
  public getIdempotencyStats(): {
    cacheSize: number;
    cacheHitRate: number;
    duplicateAttempts: number;
  } {
    return {
      cacheSize: this._idempotencyCache.size,
      cacheHitRate: 0, // Would need to track hits/misses
      duplicateAttempts: 0, // Would need to track duplicate attempts
    };
  }

  /**
   * Cache idempotency record
   * @param key - Idempotency key
   * @param response - Payment response
   * @param paymentId - Payment ID
   */
  private _cacheIdempotencyRecord(
    key: string,
    response: TPaymentProviderResponse,
    paymentId: number
  ): void {
    const now = this._dateTime.toUTC(this._dateTime.now());
    const record: TIdempotencyRecord = {
      key,
      paymentId,
      response,
      createdAt: now,
      expiresAt: this._dateTime.add(now, 24, DateTimeUnit.HOUR), // 24 hours expiry
    };

    this._idempotencyCache.set(key, record);
  }

  /**
   * Reconstruct payment response from transaction entity
   * @param transaction - Payment transaction entity
   * @returns Payment provider response
   */
  private _reconstructResponseFromTransaction(
    transaction: PaymentTransactionEntity
  ): TPaymentProviderResponse {
    return {
      success: transaction.status === PaymentStatus.COMPLETED,
      transactionId: transaction.id,
      providerTransactionId: transaction.providerTransactionId || '',
      status: transaction.status,
      amount: {
        amount: transaction.amount,
        currency: transaction.currency,
        formattedAmount: PaymentUtils.formatAmount({
          amount: transaction.amount,
          currency: transaction.currency,
        }),
      },
      fees: transaction.providerFee
        ? {
            amount: transaction.providerFee,
            currency: transaction.currency,
            formattedAmount: PaymentUtils.formatAmount({
              amount: transaction.providerFee,
              currency: transaction.currency,
            }),
          }
        : undefined,
      metadata: transaction.metadata || {},
      errorMessage: transaction.errorMessage || undefined,
      errorCode: transaction.errorCode || undefined,
    };
  }

  /**
   * Sort object keys for consistent hashing
   * @param obj - Object to sort
   * @returns Sorted object
   */
  private _sortObjectKeys(obj: Record<string, any>): Record<string, any> {
    const sorted: Record<string, any> = {};
    const keys = Object.keys(obj).sort();

    for (const key of keys) {
      if (
        typeof obj[key] === 'object' &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        sorted[key] = this._sortObjectKeys(obj[key] as Record<string, any>);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        sorted[key] = obj[key];
      }
    }

    return sorted;
  }
}
