import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { TrimString, ValidateIfPresent } from '@/core/decorators';

import { WSNamespace } from '../enums';

export class BroadcastRoomDto {
  @TrimString()
  @IsString({ message: 'Room must be a string' })
  @IsNotEmpty({ message: 'Room is required' })
  room: string;

  @TrimString()
  @IsString({ message: 'Event must be a string' })
  @IsNotEmpty({ message: 'Event is required' })
  event: string;

  @IsNotEmpty({ message: 'Data is required' })
  data: any;

  @ValidateIfPresent()
  @IsBoolean({ message: 'Exclude self must be a boolean' })
  excludeSelf?: boolean = true;

  @ValidateIfPresent()
  @TrimString()
  @IsEnum(WSNamespace, {
    message: `Invalid namespace, allowed values are ${Object.values(WSNamespace)?.join(', ')}`,
  })
  namespace?: WSNamespace;
}
