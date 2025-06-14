import { OmitType, PartialType } from '@nestjs/mapped-types';
import {
  IsAtLeastOneFieldProvided,
  TrimString,
  ValidateIfPresent,
} from '@/core/decorators';
import { IsEnum, IsString } from 'class-validator';

import { UserStatus } from '@/database';

import { CreateUserDto } from './create-user.dto';

@IsAtLeastOneFieldProvided()
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['role', 'password'] as const)
) {
  @ValidateIfPresent()
  @TrimString()
  @IsString({ message: 'Profile URL must be a string' })
  profileUrl?: string;

  @ValidateIfPresent()
  @TrimString()
  @IsEnum(UserStatus, {
    message: `Status is invalid. Allowed values are ${Object.values(UserStatus)?.join(', ')}`,
  })
  status?: UserStatus;
}
