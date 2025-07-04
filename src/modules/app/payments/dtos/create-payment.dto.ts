import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsPhoneNumber,
  IsString,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator';

import { TrimString, ValidateIfPresent } from '@/core/decorators';

import {
  Currency,
  PaymentFlowType,
  PaymentMethod,
  TransactionType,
} from '../enums';

/**
 * DTO for customer information in payment requests
 */
export class CustomerInfoDto {
  @Min(1, { message: 'Customer ID must be greater than 0' })
  @IsInt({ message: 'Customer ID must be an integer' })
  @IsNotEmpty({ message: 'Customer ID is required' })
  id: number;

  @TrimString()
  @IsEmail({}, { message: 'Customer email must be a valid email' })
  @IsNotEmpty({ message: 'Customer email is required' })
  email: string;

  @TrimString()
  @IsString({ message: 'Customer name must be a string' })
  @IsNotEmpty({ message: 'Customer name is required' })
  name: string;

  @ValidateIfPresent()
  @TrimString()
  @IsPhoneNumber(undefined, {
    message: 'Customer phone number must be a valid phone number',
  })
  phone?: string;
}

/**
 * DTO for payment amount information
 */
export class PaymentAmountDto {
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Amount must be a number' })
  @Min(0.01, { message: 'Amount must be at least 0.01' })
  @IsNotEmpty({ message: 'Amount is required' })
  amount: number;

  @IsEnum(Currency, {
    message: `Currency is invalid, allowed values are ${Object.values(Currency)?.join(', ')}`,
  })
  @IsNotEmpty({ message: 'Currency is required' })
  currency: Currency;
}

/**
 * DTO for creating a new payment
 */
export class CreatePaymentDto {
  @ValidateNested()
  @Type(() => PaymentAmountDto)
  amount: PaymentAmountDto;

  @ValidateNested()
  @Type(() => CustomerInfoDto)
  customer: CustomerInfoDto;

  @IsEnum(PaymentMethod, {
    message: `Payment method is invalid, allowed values are ${Object.values(PaymentMethod)?.join(', ')}`,
  })
  @IsNotEmpty({ message: 'Payment method is required' })
  paymentMethod: PaymentMethod;

  @IsEnum(TransactionType, {
    message: `Transaction type is invalid, allowed values are ${Object.values(TransactionType)?.join(', ')}`,
  })
  @IsNotEmpty({ message: 'Transaction type is required' })
  transactionType: TransactionType;

  @IsEnum(PaymentFlowType, {
    message: `Payment flow type is invalid, allowed values are ${Object.values(PaymentFlowType)?.join(', ')}`,
  })
  @IsNotEmpty({ message: 'Payment flow type is required' })
  flowType: PaymentFlowType;

  @ValidateIfPresent()
  @Min(1, { message: 'Course ID must be greater than 0' })
  @IsInt({ message: 'Course ID must be a number' })
  courseId?: number;

  @ValidateIfPresent()
  @Min(1, { message: 'Subscription ID must be greater than 0' })
  @IsInt({ message: 'Subscription ID must be a number' })
  subscriptionId?: number;

  @ValidateIfPresent()
  @Min(1, { message: 'Teacher ID must be greater than 0' })
  @IsInt({ message: 'Teacher ID must be a number' })
  teacherId?: number;

  @ValidateIfPresent()
  @IsObject({ message: 'Metadata must be an object' })
  metadata?: Record<string, any>;

  @ValidateIfPresent()
  @TrimString()
  @IsString({ message: 'Success URL must be a string' })
  @IsUrl({}, { message: 'Success URL must be a valid URL' })
  successUrl?: string;

  @ValidateIfPresent()
  @TrimString()
  @IsString({ message: 'Cancel URL must be a string' })
  @IsUrl({}, { message: 'Cancel URL must be a valid URL' })
  cancelUrl?: string;
}
