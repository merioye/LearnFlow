import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { TrimString, ValidateIfPresent } from '@/core/decorators';

import { WSNamespace } from '../enums';

export class LeaveRoomDto {
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
}
