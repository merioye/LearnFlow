/**
 * Relation load strategy for TypeORM (similar to eager/lazy loading)
 */
export enum RelationLoadStrategy {
  JOIN = 'join',
  QUERY = 'query',
}

export enum LockMode {
  OPTIMISTIC = 'optimistic',
  PESSIMISTIC_READ = 'pessimistic_read',
  PESSIMISTIC_WRITE = 'pessimistic_write',
  DIRTY_READ = 'dirty_read',
}

export enum TransactionIsolationLevel {
  READ_UNCOMMITTED = 'READ UNCOMMITTED',
  READ_COMMITTED = 'READ COMMITTED',
  REPEATABLE_READ = 'REPEATABLE READ',
  SERIALIZABLE = 'SERIALIZABLE',
}

export enum AuditOperation {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}
