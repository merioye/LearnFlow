import { TrimString, ValidateIfPresent } from '@/core/decorators';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsPositive,
  IsString,
} from 'class-validator';

import { NotificationPriority } from '../enums';

export class NotificationOptionsDto {
  @ValidateIfPresent()
  @TrimString()
  @IsString({ message: 'ID must be a string' })
  id?: string;

  @ValidateIfPresent()
  @IsEnum(NotificationPriority, {
    message: `Invalid priority, allowed values: ${Object.values(NotificationPriority).join(', ')}`,
  })
  priority?: NotificationPriority;

  @ValidateIfPresent()
  @IsBoolean({ message: 'Retry must be a boolean' })
  retry?: boolean;

  @ValidateIfPresent()
  @IsPositive({ message: 'MaxRetries must be a positive integer' })
  @IsInt({ message: 'MaxRetries must be an integer' })
  maxRetries?: number;

  @ValidateIfPresent()
  @IsPositive({ message: 'RetryDelay must be a positive integer' })
  @IsInt({ message: 'RetryDelay must be an integer' })
  retryDelay?: number;
}
