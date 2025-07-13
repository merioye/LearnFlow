import { FindManyOptions, FindOneOptions } from 'typeorm';

import {
  TBaseTypeOrmEntity,
  TTypeOrmFindManyParams,
  TTypeOrmFindOneParams,
} from '../types';

/**
 * Converts TypeORM options to FindOneOptions
 * @internal
 */
export function toFindOneOptions<T extends TBaseTypeOrmEntity>(
  params: TTypeOrmFindOneParams<T>
): FindOneOptions<T> {
  const {
    filter,
    sort,
    select,
    relations,
    relationLoadStrategy,
    withDeleted,
    lockMode,
    lockVersion,
    cache,
    comment,
  } = params;

  return {
    where: filter,
    order: sort,
    select: select,
    relations: relations,
    relationLoadStrategy: relationLoadStrategy,
    withDeleted: withDeleted,
    lock:
      lockMode && lockVersion
        ? {
            mode: lockMode,
            version: lockVersion,
          }
        : undefined,
    cache: cache,
    comment: comment,
  };
}

/**
 * Converts TypeORM options to FindManyOptions
 * @internal
 */
export function toFindManyOptions<T extends TBaseTypeOrmEntity>(
  params: TTypeOrmFindManyParams<T>
): FindManyOptions<T> {
  const {
    filter,
    sort,
    select,
    relations,
    relationLoadStrategy,
    skip,
    limit,
    withDeleted,
    lockMode,
    lockVersion,
    cache,
    comment,
  } = params;

  return {
    where: filter,
    order: sort,
    select: select,
    relations: relations,
    relationLoadStrategy: relationLoadStrategy,
    skip: skip,
    take: limit,
    withDeleted: withDeleted,
    lock:
      lockMode && lockVersion
        ? {
            mode: lockMode,
            version: lockVersion,
          }
        : undefined,
    cache: cache,
    comment: comment,
  };
}

// Custom transformer for decimal precision
export class PriceTransformer {
  public to(value: number): string {
    return value?.toFixed(4);
  }

  public from(value: string): number {
    return parseFloat(value);
  }
}
