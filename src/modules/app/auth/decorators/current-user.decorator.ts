import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TAuthRequestUser } from '@/modules/app/auth';

/**
 * Decorator to inject the current user into a controller or service
 *
 * @param {keyof TAuthRequestUser} [key] - Optional key to access a specific property of the user object
 * @returns {TAuthRequestUser | TAuthRequestUser[keyof TAuthRequestUser]} - The current user or a specific property of the user object
 */
export const CurrentUser = createParamDecorator(
  (key: keyof TAuthRequestUser, context: ExecutionContext) => {
    const request = context
      .switchToHttp()
      .getRequest<{ user: TAuthRequestUser }>();
    return key ? request.user[key] : request.user;
  }
);
