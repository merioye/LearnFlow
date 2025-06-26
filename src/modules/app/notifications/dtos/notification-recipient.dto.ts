import { ValidateIfPresent } from '@/core/decorators';
import {
  IsEmail,
  IsNumber,
  IsObject,
  IsPhoneNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class NotificationRecipientDto {
  @ValidateIfPresent()
  @IsEmail({}, { message: 'Email is invalid' })
  @IsString({ message: 'Email must be a string' })
  email?: string;

  @ValidateIfPresent()
  @IsPhoneNumber(undefined, { message: 'Phone number is invalid' })
  @IsString({ message: 'Phone number must be a string' })
  phoneNumber?: string;

  @ValidateIfPresent()
  @IsString({ message: 'Device token must be a string' })
  deviceToken?: string;

  @ValidateIfPresent()
  @IsPositive({ message: 'User ID must be a positive number' })
  @IsNumber({}, { message: 'User ID must be a number' })
  userId?: number;

  @ValidateIfPresent()
  @IsObject({ message: 'Metadata must be an object' })
  metadata?: Record<string, any>;
}
