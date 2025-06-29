import { TrimString, ValidateIfPresent } from '@/core/decorators';
import {
  IsEmail,
  IsInt,
  IsObject,
  IsPhoneNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class NotificationRecipientDto {
  @ValidateIfPresent()
  @TrimString()
  @IsEmail({}, { message: 'Email is invalid' })
  @IsString({ message: 'Email must be a string' })
  email?: string;

  @ValidateIfPresent()
  @TrimString()
  @IsPhoneNumber(undefined, { message: 'Phone number is invalid' })
  @IsString({ message: 'Phone number must be a string' })
  phoneNumber?: string;

  @ValidateIfPresent()
  @TrimString()
  @IsString({ message: 'Device token must be a string' })
  deviceToken?: string;

  @ValidateIfPresent()
  @IsPositive({ message: 'User ID must be a positive integer' })
  @IsInt({ message: 'User ID must be an integer' })
  userId?: number;

  @ValidateIfPresent()
  @IsObject({ message: 'Metadata must be an object' })
  metadata?: Record<string, any>;
}
