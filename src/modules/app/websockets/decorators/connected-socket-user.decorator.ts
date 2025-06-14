import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { TAuthRequestUser } from '../../auth';
import { TCustomSocket } from '../types';

/**
 * Decorator to inject the current socket user into a controller or service
 *
 * @param {keyof TAuthRequestUser} [key] - Optional key to access a specific property of the user object
 * @returns {TAuthRequestUser | TAuthRequestUser[keyof TAuthRequestUser]} - The current user or a specific property of the user object
 */
export const ConnectedSocketUser = createParamDecorator(
  (key: keyof TAuthRequestUser, ctx: ExecutionContext) => {
    const client = ctx.switchToWs().getClient<TCustomSocket>();
    return key ? client.data.user[key] : client.data.user;
  }
);
