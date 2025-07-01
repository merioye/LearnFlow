import { IsBoolean, IsInt, IsPositive, Max } from 'class-validator';

import {
  ParseBoolean,
  ParseJson,
  ParseNumber,
  ValidateIfPresent,
} from '@/core/decorators';

import { SortDirection } from '@/enums';
import { PAGINATION } from '@/constants';

import { IsSortByObject } from '../decorators';

export class OffsetPaginationDto {
  @ValidateIfPresent()
  @ParseNumber()
  @IsPositive({ message: 'Page must be a positive number' })
  @IsInt({ message: 'Page must be a number' })
  page: number = PAGINATION.DEFAULT_PAGINATION_PAGE;

  @ValidateIfPresent()
  @ParseNumber()
  @Max(PAGINATION.MAX_PAGINATION_LIMIT, {
    message: `Limit must be at most ${PAGINATION.MAX_PAGINATION_LIMIT}`,
  })
  @IsPositive({ message: 'Limit must be a positive number' })
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
