import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, ILike } from 'typeorm';

import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
import {
  PermissionGroupEntity,
  TTypeOrmFilterQuery,
  TTypeOrmSort,
} from '@/database';
import { BaseTypeOrmService } from '@/database/services';

import { TOffsetPaginatedResult } from '@/types';
import { SortDirection } from '@/enums';

import { GetPermissionListDto } from '../dtos';

/**
 * Service for managing permission groups.
 *
 * @class PermissionGroupsService
 * @extends {BaseTypeOrmService}
 */
@Injectable()
export class PermissionGroupsService extends BaseTypeOrmService<PermissionGroupEntity> {
  public constructor(
    @InjectDateTime() dateTime: IDateTime,
    @InjectDataSource() dataSource: DataSource
  ) {
    super(dateTime, dataSource, PermissionGroupEntity, {
      softDelete: false,
      defaultRelations: {
        permissions: true,
      },
    });
  }

  /**
   * Retrieves a list of permission groups.
   * Supports filtering, searching, sorting, and pagination.
   *
   * @param {GetPermissionListDto} query - Query parameters for fetching permission groups.
   * @returns {Promise<PermissionGroup[] | OffsetPaginatedResult<PermissionGroup>>}
   * - If `withoutPagination` is true, returns an array of `PermissionGroupEntity[]`.
   * - Otherwise, returns a paginated result of `TOffsetPaginatedResult<PermissionGroupEntity>`.
   */
  public async findAll(
    input: GetPermissionListDto
  ): Promise<
    PermissionGroupEntity[] | TOffsetPaginatedResult<PermissionGroupEntity>
  > {
    const { limit, page, search, withoutPagination, sortBy } = input;

    const filter: TTypeOrmFilterQuery<PermissionGroupEntity> = search
      ? [{ name: ILike(`%${search}%`) }, { description: ILike(`%${search}%`) }]
      : {};

    const sort: TTypeOrmSort<PermissionGroupEntity> = {
      sortOrder: SortDirection.ASC,
      ...Object.keys(sortBy).reduce((acc, key) => {
        acc[key as keyof PermissionGroupEntity] = sortBy[key];
        return acc;
      }, {} as TTypeOrmSort<PermissionGroupEntity>),
    };

    if (withoutPagination) {
      return this.findMany({
        filter,
        sort,
      });
    }

    return this.paginateOffset({
      pagination: {
        limit,
        page,
        withoutPagination,
        sortBy,
      },
      filter,
      sort,
    });
  }
}
