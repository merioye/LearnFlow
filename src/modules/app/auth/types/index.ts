import { Request } from 'express';

import { Config, Role } from '@/enums';

import { JwtToken } from '../enums';

/**
 * Type for access token payload
 * @typedef TAccessTokenPayload
 */
export type TAccessTokenPayload = {
  sub: string;
  email: string;
  role: Role;
  permissions: string[];
  iat?: number;
  exp?: number;
};

/**
 * Type for refresh token payload
 * @typedef TRefreshTokenPayload
 */
export type TRefreshTokenPayload = TAccessTokenPayload & {
  jwtid: string;
};

/**
 * Type for authenticated user object
 * @typedef TAuthRequestUser
 */
export type TAuthRequestUser = {
  userId: number;
  email: string;
  role: Role;
  permissions: string[];
};

export type TCookies = {
  [JwtToken.ACCESS]?: string;
  [JwtToken.REFRESH]?: string;
  [Config.CSRF_COOKIE_NAME]?: string;
};

export type TCustomRequest = Request & {
  correlationId: string;
  user: TAuthRequestUser;
  cookies: TCookies;
};
