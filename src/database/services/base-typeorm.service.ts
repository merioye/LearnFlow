import {
  DataSource,
  DeepPartial,
  EntityManager,
  EntityMetadata,
  EntityTarget,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  In,
  LessThan,
  MoreThan,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { DatabaseError, NotFoundError } from '@/common/errors';
import { RequestContextNamespace } from '@/core/middlewares';
import { TCustomRequest } from '@/modules/app/auth';
import { IDateTime } from '@/modules/common/helper/date-time';

import { TCursorPaginatedResult, TOffsetPaginatedResult } from '@/types';
import { CursorPaginateDirection, SortDirection } from '@/enums';
import { NS_REQUEST } from '@/constants';

import { SOFT_DELETION_COLUMN, VERSION_COLUMN } from '../constants';
import { AuditOperation, LockMode } from '../enums';
import {
  TBaseTypeOrmEntity,
  TTypeOrmBulkOperationsParam,
  TTypeOrmCountParams,
  TTypeOrmCreateManyParams,
  TTypeOrmCreateParams,
  TTypeOrmCreateWithLockParams,
  TTypeOrmCursorPaginationParams,
  TTypeOrmDeleteByIdParams,
  TTypeOrmDeleteManyParams,
  TTypeOrmFilterQuery,
  TTypeOrmFindByIdParams,
  TTypeOrmFindManyParams,
  TTypeOrmFindOneParams,
  TTypeOrmHardDeleteByIdParams,
  TTypeOrmHardDeleteManyParams,
  TTypeOrmOffsetPaginationParams,
  TTypeOrmQueryBuilderParams,
  TTypeOrmRestoreByIdParams,
  TTypeOrmRestoreManyParams,
  TTypeOrmSort,
  TTypeOrmUpdateByIdParams,
  TTypeOrmUpdateEntity,
  TTypeOrmUpdateManyParams,
  TTypeOrmUpdateWithLockParams,
  TTypeOrmUpsertParams,
  TTypeOrmWithTransactionParams,
} from '../types';
import { toFindManyOptions, toFindOneOptions } from '../utils';

/**
 * Base TypeORM service implementation
 * Provides a comprehensive set of operations for entity management
 *
 * @class BaseTypeOrmService
 * @template T - Type of the entity
 */
export class BaseTypeOrmService<T extends TBaseTypeOrmEntity> {
  protected entityMetadata: EntityMetadata;
  protected columns: ColumnMetadata[];
  protected columnNames: string[];

  /**
   * Creates a new BaseTypeOrmService
   * @param dateTime Date time helper
   * @param dataSource TypeORM data source
   * @param entityTarget Entity target class or name
   * @param options Additional options for the service
   */
  public constructor(
    protected readonly dateTime: IDateTime,
    protected readonly dataSource: DataSource,
    protected readonly entityTarget: EntityTarget<T>,
    protected readonly options: {
      /**
       * Whether to use soft delete
       * @default true
       */
      softDelete?: boolean;

      /**
       * Whether to use automatic audit fields
       * @default true
       */
      useAuditFields?: boolean;

      /**
       * Function to get the current user ID for audit fields
       */
      getCurrentUserId?: () => string | number | null;

      /**
       * Default relations to include in queries
       */
      defaultRelations?: FindOptionsRelations<T>;

      /**
       * Default sort order for queries
       */
      defaultSort?: TTypeOrmSort<T>;
    } = {}
  ) {
    // Get entity metadata
    this.entityMetadata = this.dataSource.getMetadata(entityTarget);
    // Get all columns of the entity
    this.columns = this.entityMetadata.columns;
    // Get just the column names if needed
    this.columnNames = this.columns.map((column) => column.propertyName);

    this.options = {
      softDelete: true,
      useAuditFields: true,
      ...options,
    };
  }

  /**
   * Starts a new query runner for transaction management.
   * @returns A promise that resolves with the started query runner.
   */
  public async startTransaction(): Promise<QueryRunner> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    return queryRunner;
  }

  /**
   * Commits the transaction in the given query runner.
   * @param queryRunner - The query runner to commit.
   */
  public async commitTransaction(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.commitTransaction();
    await queryRunner.release();
  }

  /**
   * Rolls back the transaction in the given query runner.
   * @param queryRunner - The query runner to rollback.
   */
  public async rollbackTransaction(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  }

  /**
   * Gets the repository for the entity, optionally using a transaction
   * @param queryRunner Optional query runner for transaction
   * @returns TypeORM repository
   */
  public getRepository(queryRunner?: QueryRunner): Repository<T> {
    if (queryRunner) {
      return queryRunner.manager.getRepository(this.entityTarget);
    }
    return this.dataSource.getRepository(this.entityTarget);
  }

  /**
   * Gets the entity manager, optionally from a query runner
   * @param options Options containing queryRunner or entityManager
   * @returns EntityManager
   */
  public getEntityManager(options?: {
    queryRunner?: QueryRunner;
    entityManager?: EntityManager;
  }): EntityManager {
    if (options?.entityManager) {
      return options.entityManager;
    }
    if (options?.queryRunner) {
      return options.queryRunner.manager;
    }
    return this.dataSource.manager;
  }

  /**
   * Creates a new entity
   * @param data Entity data
   * @param options Creation options
   * @returns Created entity
   */
  public async create({ data, options }: TTypeOrmCreateParams<T>): Promise<T> {
    const entityManager = this.getEntityManager(options);
    const repository = entityManager.getRepository(this.entityTarget);

    // Apply audit fields if enabled
    const entityData = this._applyAuditFields(data, AuditOperation.CREATE);

    // Create the entity
    const entity = repository.create(entityData as unknown as DeepPartial<T>);
    const savedEntity = await repository.save(entity);

    // Reload if requested
    if (options?.reload) {
      return this.findById({
        id: savedEntity.id,
        options: {
          relations: options.relations,
          select: options.select,
          relationLoadStrategy: options.relationLoadStrategy,
          queryRunner: options.queryRunner,
          entityManager: options.entityManager,
        },
      }) as Promise<T>;
    }

    return savedEntity;
  }

  /**
   * Creates multiple entities
   * @param dataArray Array of entity data
   * @param options Creation options
   * @returns Created entities
   */
  public async createMany({
    dataArray,
    options,
  }: TTypeOrmCreateManyParams<T>): Promise<T[]> {
    if (!dataArray.length) {
      return [];
    }

    const entityManager = this.getEntityManager(options);
    const repository = entityManager.getRepository(this.entityTarget);

    // Apply audit fields if enabled
    const entitiesData = dataArray.map((data) =>
      this._applyAuditFields(data, AuditOperation.CREATE)
    );

    // Create the entities
    const entities = entitiesData.map((data) =>
      repository.create(data as unknown as DeepPartial<T>)
    );
    const savedEntities = await repository.save(entities);

    // Reload if requested
    if (options?.reload) {
      const ids = savedEntities.map((entity) => entity.id);
      const filter: FindOptionsWhere<T> = {
        id: In(ids),
      } as FindOptionsWhere<T>;

      return this.findMany({
        filter,
        relations: options.relations,
        select: options.select,
        relationLoadStrategy: options.relationLoadStrategy,
        queryRunner: options.queryRunner,
        entityManager: options.entityManager,
      });
    }

    return savedEntities;
  }

  /**
   * Updates an entity by ID
   * @param id Entity ID
   * @param data Update data
   * @param options Update options
   * @returns Updated entity
   */
  public async updateById({
    id,
    data,
    options,
  }: TTypeOrmUpdateByIdParams<T>): Promise<T> {
    const entityManager = this.getEntityManager(options);
    const repository = entityManager.getRepository(this.entityTarget);

    // Check if entity exists
    const entity = await this.findById({
      id,
      options: {
        select: {
          id: true,
        } as FindOptionsSelect<T>,
        queryRunner: options?.queryRunner,
        entityManager: options?.entityManager,
        lockMode: options?.lockMode,
        lockVersion: options?.lockVersion,
      },
    });

    if (!entity) {
      throw new NotFoundError(`Entity with ID ${id} not found`);
    }

    // Apply audit fields if enabled
    const updateData = this._applyAuditFields(data, AuditOperation.UPDATE);

    // Handle optimistic locking if specified
    if (
      options?.lockMode === LockMode.OPTIMISTIC &&
      options.lockVersion !== undefined
    ) {
      const currentVersion = entity[VERSION_COLUMN];

      if (currentVersion !== options.lockVersion) {
        throw new DatabaseError(
          `Optimistic lock failed: Current version ${currentVersion} does not match expected version ${options.lockVersion}`
        );
      }

      // Increment version
      // @ts-expect-error False error due to lack of type inference
      updateData[VERSION_COLUMN] = currentVersion + 1;
    }

    // Update the entity
    await repository.update(id, updateData as QueryDeepPartialEntity<T>);

    // Return updated entity
    return this.findById({
      id,
      options: {
        relations: options?.relations,
        select: options?.select,
        relationLoadStrategy: options?.relationLoadStrategy,
        queryRunner: options?.queryRunner,
        entityManager: options?.entityManager,
      },
    }) as Promise<T>;
  }

  /**
   * Updates multiple entities matching a filter
   * @param filter Filter to match entities
   * @param data Update data
   * @param options Update options
   * @returns Number of affected rows
   */
  public async updateMany({
    filter,
    data,
    options,
  }: TTypeOrmUpdateManyParams<T>): Promise<number> {
    const entityManager = this.getEntityManager(options);
    const repository = entityManager.getRepository(this.entityTarget);

    // Apply audit fields if enabled
    const updateData = this._applyAuditFields(data, AuditOperation.UPDATE);

    // Update the entities
    const result = await repository.update(
      filter,
      updateData as QueryDeepPartialEntity<T>
    );

    return result.affected || 0;
  }

  /**
   * Finds an entity by ID
   * @param id Entity ID
   * @param options Find options
   * @returns Entity or null if not found
   */
  public async findById({
    id,
    options,
  }: TTypeOrmFindByIdParams<T>): Promise<T | null> {
    const filter = {
      id,
    } as TTypeOrmFilterQuery<T>;

    return this.findOne({
      filter,
      ...options,
    });
  }

  /**
   * Finds one entity matching a filter
   * @param params Find parameters
   * @returns Entity or null if not found
   */
  public async findOne(params: TTypeOrmFindOneParams<T>): Promise<T | null> {
    const entityManager = this.getEntityManager(params);
    const repository = entityManager.getRepository(this.entityTarget);

    // Apply soft delete filter if enabled and not explicitly overridden
    const findOptions = toFindOneOptions(params);

    // Include default relations if specified and not overridden
    if (this.options.defaultRelations && !findOptions.relations) {
      findOptions.relations = this.options.defaultRelations;
    }

    // Include default sort if specified and not overridden
    if (this.options.defaultSort && !findOptions.order) {
      findOptions.order = this.options.defaultSort;
    }

    // Handle soft delete
    if (this.options.softDelete && findOptions.withDeleted !== true) {
      const whereOptions = Array.isArray(findOptions.where)
        ? findOptions.where
        : [findOptions.where || {}];

      findOptions.where = whereOptions.map((where) => ({
        ...where,
        [SOFT_DELETION_COLUMN]: false,
      })) as FindOptionsWhere<T>[];
    }

    // Execute query
    return repository.findOne(findOptions);
  }

  /**
   * Finds multiple entities matching parameters
   * @param params Find parameters
   * @returns Array of entities
   */
  public async findMany(params?: TTypeOrmFindManyParams<T>): Promise<T[]> {
    const entityManager = this.getEntityManager(params);
    const repository = entityManager.getRepository(this.entityTarget);

    // Handle empty params
    const findParams = params || {};

    // Apply custom query builder if provided
    if (findParams.queryBuilder) {
      const alias = 'entity';
      const queryBuilder = repository.createQueryBuilder(alias);
      const customQueryBuilder = findParams.queryBuilder(queryBuilder);

      // Apply soft delete filter if enabled and not explicitly overridden
      if (this.options.softDelete && findParams.withDeleted !== true) {
        customQueryBuilder.andWhere(
          `${alias}.${SOFT_DELETION_COLUMN} = :isDeleted`,
          {
            isDeleted: false,
          }
        );
      }

      // Apply filter conditions
      if (findParams.filter) {
        this._applyWhereConditions(
          customQueryBuilder,
          findParams.filter,
          alias
        );
      }

      // Apply sorting
      if (findParams.sort) {
        this._applyOrderBy(customQueryBuilder, findParams.sort, alias);
      } else if (this.options.defaultSort) {
        // Apply default sort if no custom sort is provided
        this._applyOrderBy(customQueryBuilder, this.options.defaultSort, alias);
      }

      // Apply field selection
      if (findParams.select) {
        this._applySelect(customQueryBuilder, findParams.select, alias);
      }

      // Apply relations
      const relationsToLoad =
        findParams.relations || this.options.defaultRelations;
      if (relationsToLoad) {
        this._applyRelations(customQueryBuilder, relationsToLoad, alias);
      }

      // Apply locking
      if (findParams.lockMode) {
        if (findParams.lockVersion) {
          customQueryBuilder.setLock(
            findParams.lockMode as LockMode.OPTIMISTIC,
            findParams.lockVersion
          );
        } else {
          customQueryBuilder.setLock(
            findParams.lockMode as LockMode.PESSIMISTIC_READ
          );
        }
      }

      // Apply caching
      if (findParams.cache !== undefined) {
        if (typeof findParams.cache === 'boolean') {
          customQueryBuilder.cache(findParams.cache);
        } else if (typeof findParams.cache === 'number') {
          customQueryBuilder.cache(findParams.cache);
        } else if (typeof findParams.cache === 'object') {
          customQueryBuilder.cache(
            findParams.cache.id,
            findParams.cache.milliseconds
          );
        }
      }

      // Apply comment
      if (findParams.comment) {
        customQueryBuilder.comment(findParams.comment);
      }

      // Apply pagination
      if (findParams.skip !== undefined) {
        customQueryBuilder.skip(findParams.skip);
      }

      if (findParams.limit !== undefined) {
        customQueryBuilder.take(findParams.limit);
      }

      return customQueryBuilder.getMany();
    }

    // Apply standard query options
    const findOptions = toFindManyOptions(findParams);

    // Include default relations if specified and not overridden
    if (this.options.defaultRelations && !findOptions.relations) {
      findOptions.relations = this.options.defaultRelations;
    }

    // Include default sort if specified and not overridden
    if (this.options.defaultSort && !findOptions.order) {
      findOptions.order = this.options.defaultSort;
    }

    // Handle soft delete
    if (this.options.softDelete && findOptions.withDeleted !== true) {
      const whereOptions = Array.isArray(findOptions.where)
        ? findOptions.where
        : [findOptions.where || {}];

      findOptions.where = whereOptions.map((where) => ({
        ...where,
        [SOFT_DELETION_COLUMN]: false,
      })) as FindOptionsWhere<T>[];
    }

    // Execute query
    return repository.find(findOptions);
  }

  /**
   * Counts entities matching a filter
   * @param params Count parameters
   * @returns Count of matching entities
   */
  public async count(params?: TTypeOrmCountParams<T>): Promise<number> {
    const entityManager = this.getEntityManager(params);
    const repository = entityManager.getRepository(this.entityTarget);

    let filter = params?.filter || {};

    // Handle soft delete
    if (this.options.softDelete && params?.withDeleted !== true) {
      if (Array.isArray(filter)) {
        filter = filter.map((where: FindOptionsWhere<T>) => ({
          ...where,
          [SOFT_DELETION_COLUMN]: false,
        }));
      } else {
        filter = {
          ...filter,
          [SOFT_DELETION_COLUMN]: false,
        };
      }
    }

    // Handle distinct count
    if (params?.distinct) {
      const distinctField = params.distinct as string;
      const queryBuilder = repository.createQueryBuilder('entity');

      queryBuilder.select(`COUNT(DISTINCT entity.${distinctField})`);

      // Apply filter
      if (Object.keys(filter).length > 0) {
        queryBuilder.where(filter);
      }

      const result = await queryBuilder.getRawOne<{ count: string }>();
      return parseInt(result?.count || '0', 10);
    }

    // Standard count
    return repository.count({ where: filter });
  }

  /**
   * Soft deletes an entity by ID
   * @param id Entity ID
   * @param options Delete options
   * @returns Deleted entity
   */
  public async deleteById({
    id,
    options,
  }: TTypeOrmDeleteByIdParams<T>): Promise<T> {
    const entityManager = this.getEntityManager(options);
    const repository = entityManager.getRepository(this.entityTarget);

    // Find the entity first to ensure it exists
    const entity = await this.findById({
      id,
      options: {
        queryRunner: options?.queryRunner,
        entityManager: options?.entityManager,
      },
    });

    if (!entity) {
      throw new NotFoundError(`Entity with ID ${id} not found`);
    }

    // Check if hard delete is requested
    if (options?.hardDelete) {
      await this.hardDeleteById({ id, options });
      return entity;
    }

    // If soft delete is not enabled, perform hard delete
    if (!this.options.softDelete) {
      await repository.delete(id);
      return entity;
    }

    // Apply soft delete
    const updateData: TTypeOrmUpdateEntity<T> = {
      // @ts-expect-error False error due to lack of type inference
      [SOFT_DELETION_COLUMN]: true,
      deletedAt: this.dateTime.toUTC(this.dateTime.now()),
    };

    // Add deleted by if available
    const currentUserId =
      this._getCurrentUserIdFromNS() ?? this.options?.getCurrentUserId?.();
    if (
      this.options.useAuditFields &&
      this.columnNames.includes('deletedBy') &&
      currentUserId
    ) {
      // @ts-expect-error False error due to lack of type inference
      updateData['deletedBy'] = { id: currentUserId };
    }

    await repository.update(id, updateData as QueryDeepPartialEntity<T>);

    return entity;
  }

  /**
   * Hard deletes an entity by ID (bypasses soft delete)
   * @param id Entity ID
   * @param options Delete options
   * @returns Whether the entity was deleted
   */
  public async hardDeleteById({
    id,
    options,
  }: TTypeOrmHardDeleteByIdParams<T>): Promise<boolean> {
    const entityManager = this.getEntityManager(options);
    const repository = entityManager.getRepository(this.entityTarget);

    // Delete the entity
    const result = await repository.delete(id);

    return result.affected !== 0;
  }

  /**
   * Soft deletes multiple entities matching a filter
   * @param filter Filter to match entities
   * @param options Delete options
   * @returns Number of affected rows
   */
  public async deleteMany({
    filter,
    options,
  }: TTypeOrmDeleteManyParams<T>): Promise<number> {
    // Check if hard delete is requested
    if (options?.hardDelete) {
      return this.hardDeleteMany({ filter, options });
    }

    const entityManager = this.getEntityManager(options);
    const repository = entityManager.getRepository(this.entityTarget);

    // If soft delete is not enabled, perform hard delete
    if (!this.options.softDelete) {
      const result = await repository.delete(filter);
      return result.affected || 0;
    }

    // Apply soft delete
    const updateData: TTypeOrmUpdateEntity<T> = {
      // @ts-expect-error False error due to lack of type inference
      [SOFT_DELETION_COLUMN]: true,
      deletedAt: this.dateTime.toUTC(this.dateTime.now()),
    };

    // Add deleted by if available
    const currentUserId =
      this._getCurrentUserIdFromNS() ?? this.options?.getCurrentUserId?.();
    if (
      this.options.useAuditFields &&
      this.columnNames.includes('deletedBy') &&
      currentUserId
    ) {
      // @ts-expect-error False error due to lack of type inference
      updateData['deletedBy'] = { id: currentUserId };
    }

    const result = await repository.update(
      filter,
      updateData as QueryDeepPartialEntity<T>
    );
    return result.affected || 0;
  }

  /**
   * Hard deletes multiple entities matching a filter (bypasses soft delete)
   * @param filter Filter to match entities
   * @param options Delete options
   * @returns Number of affected rows
   */
  public async hardDeleteMany({
    filter,
    options,
  }: TTypeOrmHardDeleteManyParams<T>): Promise<number> {
    const entityManager = this.getEntityManager(options);
    const repository = entityManager.getRepository(this.entityTarget);

    // Delete the entities
    const result = await repository.delete(filter);

    return result.affected || 0;
  }

  /**
   * Restores a soft-deleted entity by ID
   * @param id Entity ID
   * @param options Restore options
   * @returns Restored entity
   */
  public async restoreById({
    id,
    options,
  }: TTypeOrmRestoreByIdParams<T>): Promise<T> {
    const entityManager = this.getEntityManager(options);
    const repository = entityManager.getRepository(this.entityTarget);

    // Check if soft delete is enabled
    if (!this.options.softDelete) {
      throw new DatabaseError(
        'Restore operation is not available when soft delete is disabled'
      );
    }

    // Find the entity first to ensure it exists (including deleted)
    const entity = await this.findById({
      id,
      options: {
        queryRunner: options?.queryRunner,
        entityManager: options?.entityManager,
        withDeleted: true,
      },
    });

    if (!entity) {
      throw new NotFoundError(`Entity with ID ${id} not found`);
    }

    if (!entity[SOFT_DELETION_COLUMN]) {
      return entity; // Already active
    }

    // Apply restore
    const updateData: TTypeOrmUpdateEntity<T> = {
      // @ts-expect-error False error due to lack of type inference
      [SOFT_DELETION_COLUMN]: false,
      deletedAt: null,
      deletedBy: null,
    };

    await repository.update(id, updateData as QueryDeepPartialEntity<T>);

    return this.findById({
      id,
      options: {
        relations: options?.relations,
        select: options?.select,
        relationLoadStrategy: options?.relationLoadStrategy,
        queryRunner: options?.queryRunner,
        entityManager: options?.entityManager,
      },
    }) as Promise<T>;
  }

  /**
   * Restores multiple soft-deleted entities matching a filter
   * @param filter Filter to match entities
   * @param options Restore options
   * @returns Number of affected rows
   */
  public async restoreMany({
    filter,
    options,
  }: TTypeOrmRestoreManyParams<T>): Promise<number> {
    const entityManager = this.getEntityManager(options);
    const repository = entityManager.getRepository(this.entityTarget);

    // Check if soft delete is enabled
    if (!this.options.softDelete) {
      throw new DatabaseError(
        'Restore operation is not available when soft delete is disabled'
      );
    }

    // Apply restore
    const updateData: TTypeOrmUpdateEntity<T> = {
      // @ts-expect-error False error due to lack of type inference
      [SOFT_DELETION_COLUMN]: false,
      deletedAt: null,
      deletedBy: null,
    };

    const result = await repository.update(
      {
        ...filter,
        [SOFT_DELETION_COLUMN]: true,
      },
      updateData as QueryDeepPartialEntity<T>
    );
    return result.affected || 0;
  }

  /**
   * Performs bulk operations (create, update, delete) in a single transaction
   * @param params Bulk operation parameters
   * @returns Result of bulk operations
   */
  public async bulkOperations(params: TTypeOrmBulkOperationsParam<T>): Promise<{
    created?: T[];
    updated?: number;
    deleted?: number;
  }> {
    // Use provided query runner or create a new one for transaction
    const useProvidedTransaction = !!params.queryRunner;
    const queryRunner =
      params.queryRunner || this.dataSource.createQueryRunner();

    try {
      // Start transaction if not already started
      if (!useProvidedTransaction) {
        await queryRunner.connect();
        await queryRunner.startTransaction();
      }

      const result: {
        created?: T[];
        updated?: number;
        deleted?: number;
      } = {};

      // Process create operations
      if (params.create?.length) {
        result.created = await this.createMany({
          dataArray: params.create,
          options: { queryRunner },
        });
      }

      // Process update operations
      if (params.update?.length) {
        let totalUpdated = 0;

        for (const { filter, data } of params.update) {
          const affected = await this.updateMany({
            filter,
            data,
            options: { queryRunner },
          });
          totalUpdated += affected;
        }

        result.updated = totalUpdated;
      }

      // Process delete operations
      if (params.delete?.length) {
        let totalDeleted = 0;

        for (const filter of params.delete) {
          const affected = await this.deleteMany({
            filter,
            options: { queryRunner },
          });
          totalDeleted += affected;
        }

        result.deleted = totalDeleted;
      }

      // Commit transaction if we started it
      if (!useProvidedTransaction) {
        await queryRunner.commitTransaction();
      }

      return result;
    } catch (error) {
      // Rollback transaction if we started it
      if (!useProvidedTransaction && queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      throw error;
    } finally {
      // Release query runner if we created it
      if (!useProvidedTransaction) {
        await queryRunner.release();
      }
    }
  }

  /**
   * Executes offset-based pagination
   * @param params Pagination parameters
   * @returns Paginated result
   */
  public async paginateOffset(
    params: TTypeOrmOffsetPaginationParams<T>
  ): Promise<TOffsetPaginatedResult<T>> {
    const { pagination, ...findParams } = params;
    const { page, limit } = pagination;

    // Calculate offset
    const offset = (page - 1) * limit;

    // Fetch items and total count in parallel
    const [items, totalItems] = await Promise.all([
      this.findMany({
        ...findParams,
        skip: offset,
        limit,
      }),
      this.count({
        filter: findParams.filter,
        withDeleted: findParams.withDeleted,
        queryRunner: findParams.queryRunner,
        entityManager: findParams.entityManager,
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      items,
      limit,
      page,
      totalItems,
      totalPages,
    };
  }

  /**
   * Executes cursor-based pagination
   * @param params Cursor pagination parameters
   * @returns Paginated result
   */
  public async paginateCursor(
    params: TTypeOrmCursorPaginationParams<T>
  ): Promise<TCursorPaginatedResult<T>> {
    const { pagination, cursorField = 'id' as keyof T, ...findParams } = params;
    const { cursor, limit, direction } = pagination;

    // Clone filter to avoid modifying the original
    const filter = this._cloneFilter(findParams.filter || {});

    // Apply cursor condition if cursor is provided
    if (cursor) {
      // Decode the cursor (base64)
      const decodedCursor = Buffer.from(cursor, 'base64').toString('utf8');
      const cursorValue = (JSON.parse(decodedCursor) as Record<string, string>)
        .value;

      // Apply filter based on direction
      if (direction === CursorPaginateDirection.NEXT) {
        this._applyFilter(filter, cursorField, MoreThan(cursorValue));
      } else {
        this._applyFilter(filter, cursorField, LessThan(cursorValue));
      }
    }

    // Sort by cursor field (ascending for next, descending for previous)
    const sort = {
      ...(findParams.sort || {}),
      [cursorField]:
        direction === CursorPaginateDirection.NEXT
          ? SortDirection.ASC
          : SortDirection.DESC,
    } as unknown as TTypeOrmSort<T>;

    // Get items (fetch limit + 1 to determine if there are more items)
    const items = await this.findMany({
      ...findParams,
      filter,
      sort,
      limit: limit + 1,
    });

    // Check if there are more items
    const hasMore = items.length > limit;
    if (hasMore) {
      items.pop(); // Remove the extra item
    }

    // If direction is 'previous', reverse the items to maintain chronological order
    if (direction === CursorPaginateDirection.PREVIOUS) {
      items.reverse();
    }

    // Generate next and previous cursors
    let nextCursor: string | undefined;
    let prevCursor: string | undefined;

    if (items.length > 0) {
      const lastItem = items[items.length - 1];
      const firstItem = items[0];

      if (hasMore) {
        // Create next cursor from the last item
        nextCursor = Buffer.from(
          JSON.stringify({ value: lastItem?.[cursorField] })
        ).toString('base64');
      }

      // Create previous cursor from the first item
      if (cursor || items.length > 0) {
        prevCursor = Buffer.from(
          JSON.stringify({ value: firstItem?.[cursorField] })
        ).toString('base64');
      }
    }

    return {
      items,
      limit,
      nextCursor: nextCursor ?? null,
      prevCursor: prevCursor ?? null,
      hasMore,
    };
  }

  /**
   * Gets a new query builder instance
   * @param alias Entity alias for the query
   * @param queryRunner Optional query runner for transactions
   * @returns Query builder
   */
  public getQueryBuilder(
    alias: string,
    queryRunner?: QueryRunner
  ): SelectQueryBuilder<T> {
    if (queryRunner) {
      return queryRunner.manager
        .getRepository(this.entityTarget)
        .createQueryBuilder(alias);
    }
    return this.dataSource
      .getRepository(this.entityTarget)
      .createQueryBuilder(alias);
  }

  /**
   * Executes a query using query builder with custom logic
   * @param params Query builder parameters
   * @returns Query result
   */
  public async executeCustomQuery<R = T>(
    params: TTypeOrmQueryBuilderParams<T, R>
  ): Promise<R[]> {
    const { builderFn, queryRunner, entityManager, withDeleted } = params;

    // Get the repository based on transaction options
    const repository = this.getEntityManager({
      queryRunner,
      entityManager,
    }).getRepository(this.entityTarget);

    // Create base query builder
    const alias = 'entity';
    const queryBuilder = repository.createQueryBuilder(alias);

    // Apply soft delete filter if enabled and not explicitly overridden
    if (this.options.softDelete && withDeleted !== true) {
      queryBuilder.andWhere(`${alias}.${SOFT_DELETION_COLUMN} = :isDeleted`, {
        isDeleted: false,
      });
    }

    // Apply custom query building logic
    const customQueryBuilder = builderFn(queryBuilder);

    // Execute the query
    return customQueryBuilder.getMany() as unknown as Promise<R[]>;
  }

  /**
   * Executes a function within a transaction
   * @param fn Function to execute within transaction
   * @param options Transaction options
   * @returns Result of the function execution
   */
  public async withTransaction<R>({
    fn,
    options,
  }: TTypeOrmWithTransactionParams<R>): Promise<R> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction(options?.isolationLevel);

      const result = await fn(queryRunner);

      await queryRunner.commitTransaction();

      return result;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Upserts an entity (creates if not exists, updates if exists)
   * @param filter Filter to find existing entity
   * @param data Entity data
   * @param options Upsert options
   * @returns Upserted entity
   */
  public async upsert({
    filter,
    data,
    options,
  }: TTypeOrmUpsertParams<T>): Promise<T> {
    // Try to find existing entity
    const existing = await this.findOne({
      filter,
      queryRunner: options?.queryRunner,
      entityManager: options?.entityManager,
    });

    if (existing) {
      // Update existing entity
      return this.updateById({
        id: existing.id,
        data: data as unknown as TTypeOrmUpdateEntity<T>,
        options,
      });
    }

    // Create new entity
    return this.create({ data, options });
  }

  /**
   * Creates an optimistic lock-enabled entity
   * @param data Entity data
   * @param options Create options with lock version
   * @returns Created entity
   */
  async createWithLock({
    data,
    options,
  }: TTypeOrmCreateWithLockParams<T>): Promise<T> {
    // Initialize version to 1 if entity uses optimistic locking
    const entityData = {
      ...data,
      [VERSION_COLUMN]: 1,
    };

    return this.create({ data: entityData, options });
  }

  /**
   * Updates an entity with optimistic locking
   * @param id Entity ID
   * @param data Update data
   * @param options Update options with lock version
   * @returns Updated entity
   */
  async updateWithLock({
    id,
    data,
    options,
  }: TTypeOrmUpdateWithLockParams<T>): Promise<T> {
    return this.updateById({
      id,
      data,
      options: {
        ...options,
        lockMode: LockMode.OPTIMISTIC,
      },
    });
  }

  // #################################### Helper Methods ####################################

  /**
   * Applies audit fields to an entity
   * @param data Entity data
   * @param operation Operation type (create or update)
   * @returns Entity data with audit fields
   */
  private _applyAuditFields<D>(data: D, operation: AuditOperation): D {
    if (!this.options.useAuditFields) {
      return data;
    }

    const result = { ...data } as Record<string, any>;
    const now = this.dateTime.toUTC(this.dateTime.now());

    if (operation === AuditOperation.CREATE) {
      result.createdAt = now;
      result.updatedAt = now;

      const currentUserId =
        this._getCurrentUserIdFromNS() ?? this.options?.getCurrentUserId?.();
      if (
        currentUserId &&
        this.columnNames.includes('createdBy') &&
        this.columnNames.includes('updatedBy')
      ) {
        result.createdBy = { id: currentUserId };
        result.updatedBy = { id: currentUserId };
      }
    } else if (operation === AuditOperation.UPDATE) {
      result.updatedAt = now;

      const currentUserId =
        this._getCurrentUserIdFromNS() ?? this.options?.getCurrentUserId?.();
      if (currentUserId && this.columnNames.includes('updatedBy')) {
        result.updatedBy = { id: currentUserId };
      }
    }

    return result as D;
  }

  /**
   * Clones a filter to avoid modifying the original
   * @param filter Original filter
   * @returns Cloned filter
   */
  private _cloneFilter(filter: TTypeOrmFilterQuery<T>): TTypeOrmFilterQuery<T> {
    if (Array.isArray(filter)) {
      return filter.map((f) => ({ ...f }));
    }
    return { ...filter };
  }

  /**
   * Applies a condition to a filter
   * @param filter Filter to modify
   * @param field Field to filter on
   * @param condition Condition to apply
   */
  private _applyFilter(
    filter: TTypeOrmFilterQuery<T>,
    field: keyof T,
    condition: any
  ): void {
    if (Array.isArray(filter)) {
      for (const f of filter) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        f[field] = condition;
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      filter[field] = condition;
    }
  }

  /**
   * Gets the current user ID from the request context
   * @returns Current user ID or null if not found
   */
  private _getCurrentUserIdFromNS(): number | null {
    return (RequestContextNamespace.get(NS_REQUEST) as TCustomRequest)?.user
      ?.userId;
  }

  // ############################## Query Builder findMany helper methods ####################################
  /**
   * Apply where conditions to query builder
   * @private
   */
  private _applyWhereConditions(
    queryBuilder: SelectQueryBuilder<T>,
    filter: TTypeOrmFilterQuery<T>,
    alias: string
  ): void {
    if (Array.isArray(filter)) {
      // Handle OR conditions
      filter.forEach((condition, index) => {
        const whereExpression = this._buildWhereExpression(
          condition,
          alias,
          `filter_${index}`
        );
        if (index === 0) {
          queryBuilder.where(
            whereExpression.condition,
            whereExpression.parameters
          );
        } else {
          queryBuilder.orWhere(
            whereExpression.condition,
            whereExpression.parameters
          );
        }
      });
    } else {
      // Handle single condition
      const whereExpression = this._buildWhereExpression(
        filter,
        alias,
        'filter'
      );
      queryBuilder.where(whereExpression.condition, whereExpression.parameters);
    }
  }

  /**
   * Build where expression from filter object
   * @private
   */
  private _buildWhereExpression(
    filter: FindOptionsWhere<T>,
    alias: string,
    paramPrefix: string
  ): { condition: string; parameters: Record<string, any> } {
    const conditions: string[] = [];
    const parameters: Record<string, any> = {};

    Object.entries(filter).forEach(([key, value]) => {
      const paramKey = `${paramPrefix}_${key}`;
      conditions.push(`${alias}.${key} = :${paramKey}`);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      parameters[paramKey] = value;
    });

    return {
      condition: conditions.join(' AND '),
      parameters,
    };
  }

  /**
   * Apply order by to query builder
   * @private
   */
  private _applyOrderBy(
    queryBuilder: SelectQueryBuilder<T>,
    sort: TTypeOrmSort<T>,
    alias: string
  ): void {
    Object.entries(sort).forEach(([field, direction], index) => {
      const orderField = `${alias}.${field}`;
      if (index === 0) {
        queryBuilder.orderBy(orderField, direction as 'ASC' | 'DESC');
      } else {
        queryBuilder.addOrderBy(orderField, direction as 'ASC' | 'DESC');
      }
    });
  }

  /**
   * Apply select fields to query builder
   * @private
   */
  private _applySelect(
    queryBuilder: SelectQueryBuilder<T>,
    select: FindOptionsSelect<T>,
    alias: string
  ): void {
    const selectFields: string[] = [];

    if (Array.isArray(select)) {
      selectFields.push(...select.map((field) => `${alias}.${String(field)}`));
    } else if (typeof select === 'object') {
      Object.entries(select).forEach(([field, shouldSelect]) => {
        if (shouldSelect) {
          selectFields.push(`${alias}.${field}`);
        }
      });
    }

    if (selectFields.length > 0) {
      queryBuilder.select(selectFields);
    }
  }

  /**
   * Apply relations to query builder
   * @private
   */
  private _applyRelations(
    queryBuilder: SelectQueryBuilder<T>,
    relations: FindOptionsRelations<T>,
    alias: string
  ): void {
    if (Array.isArray(relations)) {
      relations.forEach((relation) => {
        queryBuilder.leftJoinAndSelect(
          `${alias}.${String(relation)}`,
          String(relation)
        );
      });
    } else if (typeof relations === 'object') {
      this._applyNestedRelations(queryBuilder, relations, alias);
    }
  }

  /**
   * Apply nested relations to query builder
   * @private
   */
  private _applyNestedRelations(
    queryBuilder: SelectQueryBuilder<T>,
    relations: FindOptionsRelations<T>,
    parentAlias: string
  ): void {
    Object.entries(relations).forEach(([relationName, nestedRelations]) => {
      const relationAlias = `${parentAlias}_${relationName}`;
      queryBuilder.leftJoinAndSelect(
        `${parentAlias}.${relationName}`,
        relationAlias
      );

      // Handle nested relations recursively
      if (
        typeof nestedRelations === 'object' &&
        nestedRelations !== null &&
        nestedRelations !== true
      ) {
        this._applyNestedRelations(
          queryBuilder,
          nestedRelations as FindOptionsRelations<T>,
          relationAlias
        );
      }
    });
  }
}
