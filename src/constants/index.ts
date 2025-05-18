import { Role } from '@/enums';

export const APP_NAME = 'LearnFlow';
export const CORRELATION_ID = 'correlationId';

export const PAGINATION = {
  DEFAULT_PAGINATION_PAGE: 1,
  DEFAULT_PAGINATION_LIMIT: 10,
  MIN_PAGINATION_LIMIT: 1,
  MAX_PAGINATION_LIMIT: 100,
  MIN_PAGINATION_PAGE: 1,
} as const;

export const SYSTEM_USER = {
  firstName: 'System',
  lastName: 'User',
  role: Role.SYSTEM,
} as const;

export const ADMIN_USER = {
  firstName: 'Admin',
  lastName: 'User',
  role: Role.ADMIN,
} as const;

export * from './endpoints';
