import { CursorPaginationDto, OffsetPaginationDto } from '@/common/pagination';
import {
  EntityManager,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  QueryRunner,
  SelectQueryBuilder,
  StrictUpdateFilter,
} from 'typeorm';

import { SOFT_DELETION_COLUMN, VERSION_COLUMN } from '../constants';
import {
  LockMode,
  RelationLoadStrategy,
  TransactionIsolationLevel,
} from '../enums';

export type TDatabaseHealth = {
  status: 'up' | 'down';
  responseTime: number;
  timestamp: Date;
  poolStats?: {
    total: number;
    idle: number;
    waiting: number;
  } | null;
  pendingMigrations?: boolean;
  error?: string;
  details: {
    isConnected: boolean;
    isInitialized: boolean;
  };
};

// #################################### TypeORM Type Helpers ####################################
export type TPrimaryKey = number | string;
export type TAuditField = 'createdBy' | 'updatedBy' | 'deletedBy';
export type TSoftDeleteField =
  | typeof SOFT_DELETION_COLUMN
  | 'deletedAt'
  | 'deletedBy';

/**
 * Type representing soft deletion filter to pass to fetch data queries
 * @typedef TSoftDeletionFilter
 */
export type TSoftDeletionFilter = {
  [SOFT_DELETION_COLUMN]?: false;
};

/**
 * Base type defining common fields for TypeORM entities
 * @typedef TBaseTypeOrmEntity
 */
export type TBaseTypeOrmEntity = {
  id: TPrimaryKey;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  [SOFT_DELETION_COLUMN]?: boolean;
  [VERSION_COLUMN]?: number;
};

/**
 * Base fields that should be omitted when creating an entity
 */
export type TTypeOrmCreateOmitField =
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | typeof VERSION_COLUMN
  | TAuditField
  | TSoftDeleteField;

/**
 * Base fields that should be omitted when updating an entity
 */
export type TTypeOrmUpdateOmitField = 'id' | 'createdAt' | TAuditField;

/**
 * Filter query type for TypeORM entities
 */
export type TTypeOrmFilterQuery<T extends TBaseTypeOrmEntity> =
  | FindOptionsWhere<T>
  | FindOptionsWhere<T>[];

/**
 * Filter query type for TypeORM entities
 */
export type TTypeOrmFilterAtomicQuery<T extends TBaseTypeOrmEntity> =
  FindOptionsWhere<T>;

/**
 * Create type for TypeORM entities
 */
export type TTypeOrmCreateEntity<T extends TBaseTypeOrmEntity> = Omit<
  T,
  TTypeOrmCreateOmitField
>;

/**
 * Update type for TypeORM entities
 */
export type TTypeOrmUpdateEntity<T extends TBaseTypeOrmEntity> =
  StrictUpdateFilter<Omit<T, TTypeOrmUpdateOmitField>>;

/**
 * Sort type for TypeORM entities
 */
export type TTypeOrmSort<T extends TBaseTypeOrmEntity> = FindOptionsOrder<T>;

// ###################################### TypeORM Query Options ######################################
/**
 * Common options for TypeORM operations
 */
export type TTypeOrmCommonOptions<T extends TBaseTypeOrmEntity> = {
  /**
   * Fields to select from the entity (projection)
   */
  select?: FindOptionsSelect<T>;

  /**
   * Relations to include in the result
   */
  relations?: FindOptionsRelations<T>;

  /**
   * Relation load strategy (join or separate queries)
   */
  relationLoadStrategy?: RelationLoadStrategy;

  /**
   * Transaction query runner
   */
  queryRunner?: QueryRunner;

  /**
   * Entity manager (alternative to query runner)
   */
  entityManager?: EntityManager;

  /**
   * Whether to include soft-deleted entities
   */
  withDeleted?: boolean;

  /**
   * Lock mode for the query
   */
  lockMode?: LockMode;

  /**
   * Version number for optimistic locking
   */
  lockVersion?: number;

  /**
   * Query cache options
   */
  cache?: boolean | number | { id: string; milliseconds: number };

  /**
   * Comment for the query (helpful for debugging)
   */
  comment?: string;
};

/**
 * Options for finding a single entity
 */
export type TTypeOrmFindOneParams<T extends TBaseTypeOrmEntity> =
  TTypeOrmCommonOptions<T> & {
    /**
     * Filter conditions for the entity
     */
    filter: TTypeOrmFilterQuery<T>;

    /**
     * Sorting options
     */
    sort?: TTypeOrmSort<T>;
  };

/**
 * Options for finding multiple entities
 */
export type TTypeOrmFindManyParams<T extends TBaseTypeOrmEntity> = Partial<
  TTypeOrmFindOneParams<T>
> & {
  /**
   * Number of entities to skip
   */
  skip?: number;

  /**
   * Maximum number of entities to return
   */
  limit?: number;

  /**
   * Custom query builder for advanced querying
   */
  queryBuilder?: (qb: SelectQueryBuilder<T>) => SelectQueryBuilder<T>;
};

/**
 * Options for counting entities
 */
export type TTypeOrmCountParams<T extends TBaseTypeOrmEntity> = {
  /**
   * Filter conditions for the entity
   */
  filter?: TTypeOrmFilterQuery<T>;

  /**
   * Field to count distinct values of
   */
  distinct?: keyof T;

  /**
   * Transaction query runner
   */
  queryRunner?: QueryRunner;

  /**
   * Entity manager (alternative to query runner)
   */
  entityManager?: EntityManager;

  /**
   * Whether to include soft-deleted entities
   */
  withDeleted?: boolean;
};

/**
 * Options for updating entities
 */
export type TTypeOrmUpdateOptions<T extends TBaseTypeOrmEntity> = Omit<
  TTypeOrmCommonOptions<T>,
  'withDeleted'
> & {
  /**
   * Whether to reload the entity after update
   */
  reload?: boolean;
};

/**
 * Options for deleting entities
 */
export type TTypeOrmDeleteOptions<T extends TBaseTypeOrmEntity> = Omit<
  TTypeOrmCommonOptions<T>,
  'withDeleted'
> & {
  /**
   * Whether to perform a hard delete even if soft delete is enabled
   */
  hardDelete?: boolean;
};

/**
 * Options for restoring soft-deleted entities
 */
export type TTypeOrmRestoreOptions<T extends TBaseTypeOrmEntity> = Omit<
  TTypeOrmCommonOptions<T>,
  'withDeleted'
>;

/**
 * Parameters for bulk operations
 */
export type TTypeOrmBulkOperationsParam<T extends TBaseTypeOrmEntity> = {
  /**
   * Entities to create
   */
  create?: TTypeOrmCreateEntity<T>[];

  /**
   * Entities to update
   */
  update?: {
    filter: TTypeOrmFilterAtomicQuery<T>;
    data: TTypeOrmUpdateEntity<T>;
  }[];

  /**
   * Entities to delete (by filter)
   */
  delete?: TTypeOrmFilterAtomicQuery<T>[];

  /**
   * Query runner for transaction handling
   */
  queryRunner?: QueryRunner;

  /**
   * Entity manager (alternative to query runner)
   */
  entityManager?: EntityManager;
};

/**
 * Parameters for offset-based pagination
 */
export type TTypeOrmOffsetPaginationParams<T extends TBaseTypeOrmEntity> =
  Partial<TTypeOrmFindOneParams<T>> & {
    pagination: OffsetPaginationDto;
  };

/**
 * Parameters for cursor-based pagination
 */
export type TTypeOrmCursorPaginationParams<T extends TBaseTypeOrmEntity> =
  Partial<TTypeOrmFindOneParams<T>> & {
    pagination: CursorPaginationDto;
    /**
     * The field to use as cursor
     * @default 'id'
     */
    cursorField?: keyof T;
  };

/**
 * Parameters for advanced queries using query builder
 */
export type TTypeOrmQueryBuilderParams<T extends TBaseTypeOrmEntity, R = T> = {
  /**
   * Function to customize the query builder
   */
  builderFn: (queryBuilder: SelectQueryBuilder<T>) => SelectQueryBuilder<T>;

  /**
   * Transaction query runner
   */
  queryRunner?: QueryRunner;

  /**
   * Entity manager (alternative to query runner)
   */
  entityManager?: EntityManager;

  /**
   * Whether to include soft-deleted entities
   */
  withDeleted?: boolean;

  /**
   * Types for input and output (for type safety)
   */
  typing?: {
    inputType?: T;
    outputType?: R;
  };
};

/**
 * Transaction options for managing transaction boundaries
 */
export type TTransactionOptions = {
  /**
   * Isolation level for the transaction
   */
  isolationLevel?: TransactionIsolationLevel;

  /**
   * Timeout for the transaction in milliseconds
   */
  timeout?: number;
};

export type TTypeOrmCreateParams<T extends TBaseTypeOrmEntity> = {
  data: TTypeOrmCreateEntity<T>;
  options?: TTypeOrmUpdateOptions<T>;
};

export type TTypeOrmCreateManyParams<T extends TBaseTypeOrmEntity> = {
  dataArray: TTypeOrmCreateEntity<T>[];
  options?: TTypeOrmUpdateOptions<T>;
};

export type TTypeOrmUpdateByIdParams<T extends TBaseTypeOrmEntity> = {
  id: TPrimaryKey;
  data: TTypeOrmUpdateEntity<T>;
  options?: TTypeOrmUpdateOptions<T>;
};

export type TTypeOrmUpdateManyParams<T extends TBaseTypeOrmEntity> = {
  filter: TTypeOrmFilterAtomicQuery<T>;
  data: TTypeOrmUpdateEntity<T>;
  options?: TTypeOrmUpdateOptions<T>;
};

export type TTypeOrmFindByIdParams<T extends TBaseTypeOrmEntity> = {
  id: TPrimaryKey;
  options?: Omit<TTypeOrmFindOneParams<T>, 'filter'>;
};

export type TTypeOrmDeleteByIdParams<T extends TBaseTypeOrmEntity> = {
  id: TPrimaryKey;
  options?: TTypeOrmDeleteOptions<T>;
};

export type TTypeOrmHardDeleteByIdParams<T extends TBaseTypeOrmEntity> = {
  id: TPrimaryKey;
  options?: Omit<TTypeOrmDeleteOptions<T>, 'hardDelete'>;
};

export type TTypeOrmDeleteManyParams<T extends TBaseTypeOrmEntity> = {
  filter: TTypeOrmFilterAtomicQuery<T>;
  options?: TTypeOrmDeleteOptions<T>;
};

export type TTypeOrmHardDeleteManyParams<T extends TBaseTypeOrmEntity> = {
  filter: TTypeOrmFilterAtomicQuery<T>;
  options?: Omit<TTypeOrmDeleteOptions<T>, 'hardDelete'>;
};

export type TTypeOrmRestoreByIdParams<T extends TBaseTypeOrmEntity> = {
  id: TPrimaryKey;
  options?: TTypeOrmRestoreOptions<T>;
};

export type TTypeOrmRestoreManyParams<T extends TBaseTypeOrmEntity> = {
  filter: TTypeOrmFilterAtomicQuery<T>;
  options?: TTypeOrmRestoreOptions<T>;
};

export type TTypeOrmWithTransactionParams<R> = {
  fn: (queryRunner: QueryRunner) => Promise<R>;
  options?: TTransactionOptions;
};

export type TTypeOrmUpsertParams<T extends TBaseTypeOrmEntity> = {
  filter: TTypeOrmFilterAtomicQuery<T>;
  data: TTypeOrmCreateEntity<T>;
  options?: TTypeOrmUpdateOptions<T>;
};

export type TTypeOrmCreateWithLockParams<T extends TBaseTypeOrmEntity> = {
  data: TTypeOrmCreateEntity<T>;
  options?: TTypeOrmUpdateOptions<T> & { lockVersion?: number };
};

export type TTypeOrmUpdateWithLockParams<T extends TBaseTypeOrmEntity> = {
  id: TPrimaryKey;
  data: TTypeOrmUpdateEntity<T>;
  options?: TTypeOrmUpdateOptions<T> & { lockVersion?: number };
};
