import { TrimString, ValidateIfPresent } from '@/core/decorators';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { WSNamespace } from '../enums';

export class BroadcastUserDto {
  @IsNumber({}, { message: 'Target user ID must be a number' })
  targetUserId: number;

  @TrimString()
  @IsString({ message: 'Event must be a string' })
  @IsNotEmpty({ message: 'Event is required' })
  event: string;

  @IsNotEmpty()
  data: any;

  @ValidateIfPresent()
  @TrimString()
  @IsEnum(WSNamespace, {
    message: `Namespace is invalid. Allowed values are ${Object.values(WSNamespace)?.join(', ')}`,
  })
  namespace?: WSNamespace;
}
