import { Request } from 'express';

import { PermissionEntity, UserEntity } from '@/database';

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
  isAuthenticated?: boolean;
  refreshTokenPayload: TRefreshTokenPayload;
  cookies: TCookies;
};

export type TCookieJwtToken = {
  token: string;
  type: JwtToken;
};

export type TAuthTokens = {
  [JwtToken.ACCESS]: string;
  [JwtToken.REFRESH]: string;
};

export type TSelf = Omit<UserEntity, 'password'> & {
  permissions: PermissionEntity[];
};
