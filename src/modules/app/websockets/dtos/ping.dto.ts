import { ValidateIfPresent } from '@/core/decorators';
import { IsInt, IsString } from 'class-validator';

export class PingDto {
  @ValidateIfPresent()
  @IsInt({ message: 'Timestamp must be an integer' })
  timestamp?: number;

  @ValidateIfPresent()
  @IsString({ message: 'Message must be a string' })
  message?: string;
}
