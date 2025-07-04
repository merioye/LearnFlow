import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
} from 'class-validator';

import { TrimString } from '@/core/decorators';

import { PaymentMethod } from '../enums';

/**
 * DTO for incoming webhook payloads
 */
export class WebhookPayloadDto {
  @TrimString()
  @IsString({ message: 'Webhook event ID must be a string' })
  @IsNotEmpty({ message: 'Webhook event ID is required' })
  id: string;

  @IsEnum(PaymentMethod, {
    message: `Payment provider is invalid, allowed values are ${Object.values(PaymentMethod)?.join(', ')}`,
  })
  @IsNotEmpty({ message: 'Payment provider is required' })
  provider: PaymentMethod;

  @TrimString()
  @IsString({ message: 'Event type must be a string' })
  @IsNotEmpty({ message: 'Event type is required' })
  eventType: string;

  @IsObject({ message: 'Event data must be an object' })
  @IsNotEmpty({ message: 'Event data is required' })
  data: Record<string, any>;

  @IsDateString({}, { message: 'Event timestamp must be a date string' })
  @IsNotEmpty({ message: 'Event timestamp is required' })
  timestamp: string;

  @TrimString()
  @IsString({ message: 'Webhook signature must be a string' })
  @IsNotEmpty({ message: 'Webhook signature is required' })
  signature: string;
}
