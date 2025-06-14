import { TrimString, ValidateIfPresent } from '@/core/decorators';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { WSNamespace } from '../enums';

export class LeaveRoomDto {
  @TrimString()
  @IsString({ message: 'Room must be a string' })
  @IsNotEmpty({ message: 'Room is required' })
  room: string;

  @ValidateIfPresent()
  @TrimString()
  @IsEnum(WSNamespace, {
    message: `Namespace is invalid. Allowed values are ${Object.values(WSNamespace)?.join(', ')}`,
  })
  namespace?: WSNamespace;
}
