import { OffsetPaginationDto } from '@/common/pagination';
import { TrimString, ValidateIfPresent } from '@/core/decorators';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { UserStatus } from '@/database';

import { Role } from '@/enums';

export class GetUserListDto extends OffsetPaginationDto {
  @ValidateIfPresent()
  @TrimString()
  @IsString({ message: 'Search must be a string' })
  @IsNotEmpty({ message: 'Search is required' })
  search?: string;

  @ValidateIfPresent()
  @TrimString()
  @IsEnum(UserStatus, {
    message: `Status is invalid. Allowed values are ${Object.values(UserStatus)?.join(', ')}`,
  })
  status?: UserStatus;

  @ValidateIfPresent()
  @TrimString()
  @IsEnum(Role, {
    message: `Role is invalid. Allowed values are ${Object.values(Role).join(
      ', '
    )}`,
  })
  role?: Role;
}
