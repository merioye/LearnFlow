import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { NotAuthorizedError } from '@/common/errors';
import { ILogger, InjectLogger } from '@/modules/common/logger';

import { UserStatus } from '@/database';

import { Config } from '@/enums';

import { UsersService } from '../../users';
import { IS_PUBLIC_DECORATOR_KEY } from '../constants';
import { TAccessTokenPayload, TCustomRequest } from '../types';

/**
 * JWT authentication guard for access token
 * @class AccessTokenGuard
 * @implements {CanActivate}
 */
@Injectable()
export class AccessTokenGuard implements CanActivate {
  public constructor(
    @InjectLogger() private readonly _logger: ILogger,
    private readonly _usersService: UsersService,
    private readonly _jwtService: JwtService,
    private readonly _configService: ConfigService,
    private readonly _reflector: Reflector
  ) {}

  /**
   * Checks if request can be activated
   * @param {ExecutionContext} context - Execution context
   * @returns {Promise<boolean>} Whether the request can be activated
   */
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is public
    const isPublic = this._reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_DECORATOR_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (isPublic) {
      return true;
    }

    // Extract access token from request
    const request = context.switchToHttp().getRequest<TCustomRequest>();
    const accessToken = this._extractToken(request);
    if (!accessToken) {
      throw new NotAuthorizedError('Access token is not provided');
    }

    // Verify access token
    try {
      const payload = await this._jwtService.verifyAsync<TAccessTokenPayload>(
        accessToken,
        {
          secret: this._configService.get<string>(Config.JWT_ACCESS_SECRET),
          audience: this._configService.get(Config.JWT_AUDIENCE),
          issuer: this._configService.get(Config.JWT_ISSUER),
          algorithms: ['HS256'],
          ignoreExpiration: false,
        }
      );

      // Check user exists in the database and is active
      const user = await this._usersService.findById({
        id: parseInt(payload.sub),
      });
      if (!user) {
        throw new NotAuthorizedError('User not found');
      }
      if (user.status !== UserStatus.ACTIVE) {
        throw new NotAuthorizedError('User is not active');
      }

      // Set authenticated user in request object
      request.user = {
        userId: parseInt(payload.sub),
        email: payload.email,
        role: payload.role,
        permissions: payload.permissions,
      };
      // Set authentication flag in request object
      request.isAuthenticated = true;

      // Grant access and proceed to next middleware
      return true;
    } catch (error) {
      this._logger.error('JWT authentication failed: ', {
        error,
      });

      // Deny access
      throw new NotAuthorizedError('Access token expired or invalid');
    }
  }

  /**
   * Extracts access token from request
   * @param {TCustomRequest} request - Request object
   * @returns {string | undefined} Access token
   */
  private _extractToken(request: TCustomRequest): string | undefined {
    const accessToken = request.cookies.accessToken;
    if (accessToken) return accessToken;

    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
