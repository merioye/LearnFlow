import { IsNotEmpty, IsString } from 'class-validator';

import { OffsetPaginationDto } from '@/common/pagination';
import { TrimString, ValidateIfPresent } from '@/core/decorators';

export class GetPermissionListDto extends OffsetPaginationDto {
  @ValidateIfPresent()
  @TrimString()
  @IsString({ message: 'Search must be a string' })
  @IsNotEmpty({ message: 'Search is required' })
  search?: string;
}
