import { ValidateIfPresent } from '@/core/decorators';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

import { NotificationPriority } from '../enums';

export class NotificationOptionsDto {
  @ValidateIfPresent()
  @IsString({ message: 'ID must be a string' })
  id?: string;

  @ValidateIfPresent()
  @IsEnum(Object.values(NotificationPriority), {
    message: `Priority is invalid. Allowed values: ${Object.values(NotificationPriority).join(', ')}`,
  })
  priority?: NotificationPriority;

  @ValidateIfPresent()
  @IsBoolean({ message: 'Retry must be a boolean' })
  retry?: boolean;

  @ValidateIfPresent()
  @IsPositive({ message: 'MaxRetries must be a positive number' })
  @IsNumber({}, { message: 'MaxRetries must be a number' })
  maxRetries?: number;

  @ValidateIfPresent()
  @IsPositive({ message: 'RetryDelay must be a positive number' })
  @IsNumber({}, { message: 'RetryDelay must be a number' })
  retryDelay?: number;
}
