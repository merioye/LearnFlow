import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { OffsetPaginationDto } from '@/common/pagination';
import { TrimString, ValidateIfPresent } from '@/core/decorators';

import { Role } from '@/enums';

import { UserStatus } from '../enums';

export class GetUserListDto extends OffsetPaginationDto {
  @ValidateIfPresent()
  @TrimString()
  @IsString({ message: 'Search must be a string' })
  @IsNotEmpty({ message: 'Search is required' })
  search?: string;

  @ValidateIfPresent()
  @TrimString()
  @IsEnum(UserStatus, {
    message: `Invalid status, allowed values are ${Object.values(UserStatus)?.join(', ')}`,
  })
  status?: UserStatus;

  @ValidateIfPresent()
  @TrimString()
  @IsEnum(Role, {
    message: `Invalid role, allowed values are ${Object.values(Role).join(
      ', '
    )}`,
  })
  role?: Role;
}
