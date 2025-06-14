import { ValidateIfPresent } from '@/core/decorators';
import { IsNumber, IsString } from 'class-validator';

export class PingDto {
  @ValidateIfPresent()
  @IsNumber({}, { message: 'Timestamp must be a number' })
  timestamp?: number;

  @ValidateIfPresent()
  @IsString({ message: 'Message must be a string' })
  message?: string;
}
