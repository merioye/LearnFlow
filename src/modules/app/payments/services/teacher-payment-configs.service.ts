import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
import { TeacherPaymentConfigEntity } from '@/database';
import { BaseTypeOrmService } from '@/database/services';

import { Currency, PaymentConfigVerificationStatus } from '../enums';

/**
 * Service class for managing teacher payment configurations
 * @class TeacherPaymentConfigurationsService
 * @extends BaseTypeOrmService<TeacherPaymentConfigEntity>
 */
@Injectable()
export class TeacherPaymentConfigurationsService extends BaseTypeOrmService<TeacherPaymentConfigEntity> {
  public constructor(
    @InjectDateTime() dateTime: IDateTime,
    @InjectDataSource() dataSource: DataSource
  ) {
    super(dateTime, dataSource, TeacherPaymentConfigEntity, {
      softDelete: false,
    });
  }

  /**
   * Check if teacher can receive payments
   * @param paymentConfig - The payment configuration to check
   * @returns true if the teacher can receive payments
   */
  public canReceivePayments(
    paymentConfig: TeacherPaymentConfigEntity
  ): boolean {
    return (
      paymentConfig.isActive &&
      paymentConfig.verificationStatus ===
        PaymentConfigVerificationStatus.VERIFIED &&
      Boolean(paymentConfig.providerAccountId) &&
      paymentConfig.supportedCurrencies.length > 0
    );
  }

  /**
   * Check if teacher supports a specific currency
   * @param paymentConfig - The payment configuration to check
   * @param currency - The currency to check
   * @returns true if the teacher supports the currency
   */
  public supportsCurrency(
    paymentConfig: TeacherPaymentConfigEntity,
    currency: Currency
  ): boolean {
    return paymentConfig.supportedCurrencies.includes(currency);
  }

  /**
   * Get effective commission rate (teacher-specific or system default)
   * @param paymentConfig - The payment configuration to check
   * @param systemDefault - The system default commission rate
   * @returns the effective commission rate
   */
  public getEffectiveCommissionRate(
    paymentConfig: TeacherPaymentConfigEntity,
    systemDefault: number
  ): number {
    return paymentConfig.commissionRate !== null
      ? paymentConfig.commissionRate
      : systemDefault;
  }

  /**
   * Check if auto-settlement is enabled
   * @param paymentConfig - The payment configuration to check
   * @returns true if auto-settlement is enabled
   */
  public isAutoSettlementEnabled(
    paymentConfig: TeacherPaymentConfigEntity
  ): boolean {
    return paymentConfig.settlementConfig?.autoSettle === true;
  }

  /**
   * Get settlement delay in days
   * @param paymentConfig - The payment configuration to check
   * @param systemDefault - The system default settlement delay
   * @returns the settlement delay in days
   */
  public getSettlementDelayDays(
    paymentConfig: TeacherPaymentConfigEntity,
    systemDefault: number
  ): number {
    return paymentConfig.settlementConfig?.delayDays || systemDefault;
  }
}
