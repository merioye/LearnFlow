import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { BaseTypeOrmService } from '@/database/services';
import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
import { DataSource, ILike } from 'typeorm';

import {
  PermissionEntity,
  TTypeOrmFilterQuery,
  TTypeOrmSort,
} from '@/database';

import { TOffsetPaginatedResult } from '@/types';
import { SortDirection } from '@/enums';

import { GetPermissionListDto } from '../dtos';

/**
 * Service for managing permissions.
 *
 * @class PermissionsService
 * @extends {BaseTypeOrmService}
 */
@Injectable()
export class PermissionsService extends BaseTypeOrmService<PermissionEntity> {
  public constructor(
    @InjectDateTime() dateTime: IDateTime,
    @InjectDataSource() dataSource: DataSource
  ) {
    super(dateTime, dataSource, PermissionEntity, {
      softDelete: false,
      defaultRelations: {
        permissionGroup: true,
      },
    });
  }

  /**
   * Retrieves a list of permissions.
   * Supports filtering, searching, sorting, and pagination.
   *
   * @param {GetPermissionListDto} query - Query parameters for fetching permissions.
   * @returns {Promise<PermissionEntity[] | TOffsetPaginatedResult<PermissionEntity>>}
   * - If `withoutPagination` is true, returns an array of `PermissionEntity[]`.
   * - Otherwise, returns a paginated result of `TOffsetPaginatedResult<PermissionEntity>`.
   */
  public async findAll(
    input: GetPermissionListDto
  ): Promise<PermissionEntity[] | TOffsetPaginatedResult<PermissionEntity>> {
    const { limit, page, search, withoutPagination, sortBy } = input;

    const filter: TTypeOrmFilterQuery<PermissionEntity> = search
      ? { name: ILike(`%${search}%`) }
      : {};

    const sort: TTypeOrmSort<PermissionEntity> = {
      permissionGroup: {
        id: SortDirection.ASC,
      },
      sortOrder: SortDirection.ASC,
      ...Object.keys(sortBy).reduce((acc, key) => {
        acc[key as keyof PermissionEntity] = sortBy[key];
        return acc;
      }, {} as TTypeOrmSort<PermissionEntity>),
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
