import {
  ParseBoolean,
  ParseJson,
  ParseNumber,
  ValidateIfPresent,
} from '@/core/decorators';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsPositive,
  IsString,
  Max,
} from 'class-validator';

import { CursorPaginateDirection, SortDirection } from '@/enums';
import { PAGINATION } from '@/constants';

import { IsSortByObject } from '../decorators';

export class CursorPaginationDto {
  @ValidateIfPresent()
  @IsString({ message: 'Cursor must be a string' })
  cursor?: string;

  @ValidateIfPresent()
  @IsEnum(CursorPaginateDirection, {
    message: `Direction must be one of the following: ${Object.values(CursorPaginateDirection).join(', ')}`,
  })
  @IsString({ message: 'Direction must be a string' })
  direction: CursorPaginateDirection = CursorPaginateDirection.NEXT;

  @ValidateIfPresent()
  @ParseNumber()
  @Max(PAGINATION.MAX_PAGINATION_LIMIT, {
    message: `Limit must be at most ${PAGINATION.MAX_PAGINATION_LIMIT}`,
  })
  @IsPositive({ message: 'Page must be a positive number' })
  @IsInt({ message: 'Limit must be a number' })
  limit: number = PAGINATION.DEFAULT_PAGINATION_LIMIT;

  @ValidateIfPresent()
  @ParseBoolean()
  @IsBoolean({ message: 'WithoutPagination must be a boolean' })
  withoutPagination: boolean = false;

  @ValidateIfPresent()
  @ParseJson()
  @IsSortByObject()
  sortBy: Record<string, SortDirection> = {
    createdAt: SortDirection.ASC,
  };
}
