import { TrimString, ValidateIfPresent } from '@/core/decorators';
import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';

import { WSNamespace } from '../enums';

export class BroadcastUserDto {
  @IsInt({ message: 'Target user ID must be an integer' })
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
    message: `Invalid namespace, allowed values are ${Object.values(WSNamespace)?.join(', ')}`,
  })
  namespace?: WSNamespace;
}
