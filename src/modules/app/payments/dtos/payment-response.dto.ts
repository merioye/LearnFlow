import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

import { TrimString, ValidateIfPresent } from '@/core/decorators';

import { Currency, PaymentMethod, PaymentStatus } from '../enums';

/**
 * DTO for payment response data
 */
export class PaymentResponseDto {
  @Min(1, { message: 'Payment ID must be greater than 0' })
  @IsInt({ message: 'Payment ID must be an integer' })
  @IsNotEmpty({ message: 'Payment ID is required' })
  id: number;

  @TrimString()
  @IsString({ message: 'Provider transaction ID must be a string' })
  providerTransactionId: string;

  @IsEnum(PaymentStatus, {
    message: `Payment status is invalid, allowed values are ${Object.values(PaymentStatus)?.join(', ')}`,
  })
  @IsNotEmpty({ message: 'Payment status is required' })
  status: PaymentStatus;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Amount must be a number' })
  @Min(0.01, { message: 'Amount must be at least 0.01' })
  @IsNotEmpty({ message: 'Amount is required' })
  amount: number;

  @IsEnum(Currency, {
    message: `Currency is invalid, allowed values are ${Object.values(Currency)?.join(', ')}`,
  })
  @IsNotEmpty({ message: 'Currency is required' })
  currency: Currency;

  @IsEnum(PaymentMethod, {
    message: `Payment method is invalid, allowed values are ${Object.values(PaymentMethod)?.join(', ')}`,
  })
  @IsNotEmpty({ message: 'Payment method is required' })
  paymentMethod: PaymentMethod;

  @ValidateIfPresent()
  @TrimString()
  @IsString({ message: 'Redirect URL must be a string' })
  @IsUrl({}, { message: 'Redirect URL must be a valid URL' })
  redirectUrl?: string;

  @ValidateIfPresent()
  @TrimString()
  @IsString({ message: 'Client secret must be a string' })
  clientSecret?: string;

  @ValidateIfPresent()
  @TrimString()
  @IsString({ message: 'Error message must be a string' })
  errorMessage?: string;

  @ValidateIfPresent()
  @TrimString()
  @IsString({ message: 'Error code must be a string' })
  errorCode?: string;

  @IsDate({ message: 'Created at must be a date' })
  @IsNotEmpty({ message: 'Created at is required' })
  createdAt: Date;

  @ValidateIfPresent()
  @IsDate({ message: 'Completed at must be a date' })
  completedAt?: Date;

  @ValidateIfPresent()
  @IsObject({ message: 'Metadata must be an object' })
  metadata?: Record<string, any>;
}
