import { Action, Resource } from '@/enums';

export type RequiredPermission = {
  action: Action;
  resource: Resource;
};
