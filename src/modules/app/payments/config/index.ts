import {
  PAYMENT_DEFAULTS,
  PAYMENT_PROVIDERS_CONFIG,
  SUPPORTED_CURRENCIES,
} from '../constants';
import { Currency } from '../enums';
import { TPaymentsModuleOptions } from '../types';

export const paymentModuleOptions: TPaymentsModuleOptions = {
  defaultCurrency: PAYMENT_DEFAULTS.CURRENCY,
  supportedCurrencies: Object.keys(SUPPORTED_CURRENCIES) as Currency[],
  defaultCommissionRate: PAYMENT_DEFAULTS.COMMISSION_RATE,
  maxRefundDays: PAYMENT_DEFAULTS.MAX_REFUND_DAYS,
  settlementDelayDays: PAYMENT_DEFAULTS.SETTLEMENT_DELAY_DAYS,
  webhookRetryAttempts: PAYMENT_DEFAULTS.WEBHOOK_RETRY_ATTEMPTS,
  webhookRetryDelay: PAYMENT_DEFAULTS.WEBHOOK_RETRY_DELAY,
  enableSubscriptions: true,
  enableMultiVendor: true,
  enableCOD: true,
  providersConfiguration: PAYMENT_PROVIDERS_CONFIG,
};
