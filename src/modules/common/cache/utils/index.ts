import { ExecutionContext } from '@nestjs/common';

import { TAuthRequestUser } from '@/modules/app/auth';

/**
 * Cache suffix based on user property
 * @param {string} [property='userId'] - Property to use for cache key
 * @returns {MethodDecorator} Cache suffix function
 */
export const UserBasedCacheSuffix =
  (property: keyof TAuthRequestUser = 'userId') =>
  (ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<{ user: TAuthRequestUser }>();
    return `user_${request.user[property]?.toString()}`;
  };
