import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
import { PaymentMethodConfigEntity } from '@/database';
import { BaseTypeOrmService } from '@/database/services';

import { Currency } from '../enums';

/**
 * Service class for managing payment method configurations
 * @class PaymentMethodConfigurationsService
 * @extends BaseTypeOrmService<PaymentMethodConfigEntity>
 */
@Injectable()
export class PaymentMethodConfigurationsService extends BaseTypeOrmService<PaymentMethodConfigEntity> {
  public constructor(
    @InjectDateTime() dateTime: IDateTime,
    @InjectDataSource() dataSource: DataSource
  ) {
    super(dateTime, dataSource, PaymentMethodConfigEntity, {
      softDelete: false,
    });
  }

  /**
   * Get amount limits for a currency
   * @param paymentMethodConfig - The payment method configuration to get the limits for
   * @param currency - The currency to get the limits for
   * @returns The amount limits for the currency, or null if not found
   */
  public getAmountLimits(
    paymentMethodConfig: PaymentMethodConfigEntity,
    currency: Currency
  ): { min: number; max: number } | null {
    return paymentMethodConfig.amountLimits?.[currency] || null;
  }

  /**
   * Validate amount for this provider and currency
   * @param paymentMethodConfig - The payment method configuration to validate the amount for
   * @param amount - The amount to validate
   * @param currency - The currency to validate the amount for
   * @returns True if the amount is valid, false otherwise
   */
  public validateAmount(
    paymentMethodConfig: PaymentMethodConfigEntity,
    amount: number,
    currency: Currency
  ): boolean {
    const limits = this.getAmountLimits(paymentMethodConfig, currency);
    if (!limits) return true; // No limits defined

    return amount >= limits.min && amount <= limits.max;
  }
}
