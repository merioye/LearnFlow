import { TrimString, ValidateIfPresent } from '@/core/decorators';
import { IsEnum, IsNotEmpty, IsObject, IsString } from 'class-validator';

import { WSNamespace } from '../enums';

export class JoinRoomDto {
  @TrimString()
  @IsString({ message: 'Room must be a string' })
  @IsNotEmpty({ message: 'Room is required' })
  room: string;

  @ValidateIfPresent()
  @TrimString()
  @IsEnum(WSNamespace, {
    message: `Invalid namespace, allowed values are ${Object.values(WSNamespace)?.join(', ')}`,
  })
  namespace?: WSNamespace;

  @ValidateIfPresent()
  @IsObject({ message: 'Metadata must be an object' })
  metadata?: Record<string, any>;
}
