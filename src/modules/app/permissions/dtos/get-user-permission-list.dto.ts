import { OffsetPaginationDto } from '@/common/pagination';
import { TrimString, ValidateIfPresent } from '@/core/decorators';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetPermissionListDto extends OffsetPaginationDto {
  @ValidateIfPresent()
  @TrimString()
  @IsString({ message: 'Search must be a string' })
  @IsNotEmpty({ message: 'Search is required' })
  search?: string;
}
