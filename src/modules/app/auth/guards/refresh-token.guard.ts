import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MoreThan } from 'typeorm';

import { NotAuthorizedError } from '@/common/errors';
import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
import { ILogger, InjectLogger } from '@/modules/common/logger';
import { UserStatus } from '@/database';

import { Config } from '@/enums';

import { UsersService } from '../../users';
import { RefreshTokensService } from '../services';
import { TCustomRequest, TRefreshTokenPayload } from '../types';

/**
 * JWT authentication guard for refresh token
 * @class RefreshTokenGuard
 * @implements {CanActivate}
 */
@Injectable()
export class RefreshTokenGuard implements CanActivate {
  public constructor(
    @InjectLogger() private readonly _logger: ILogger,
    @InjectDateTime() private readonly _dateTime: IDateTime,
    private readonly _jwtService: JwtService,
    private readonly _configService: ConfigService,
    private readonly _usersService: UsersService,
    private readonly _refreshTokensService: RefreshTokensService
  ) {}

  /**
   * Checks if request can be activated
   * @param {ExecutionContext} context - Execution context
   * @returns {Promise<boolean>} Whether the request can be activated
   */
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    // Extract refresh token from request
    const request = context.switchToHttp().getRequest<TCustomRequest>();
    const refreshToken = this._extractToken(request);
    if (!refreshToken) {
      throw new NotAuthorizedError('Refresh token is not provided');
    }

    // Verify refresh token
    try {
      const payload = await this._jwtService.verifyAsync<TRefreshTokenPayload>(
        refreshToken,
        {
          secret: this._configService.get<string>(Config.JWT_REFRESH_SECRET),
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

      // Check if token exists in the database and is not revoked
      const refreshTokenExists = await this._refreshTokensService.findOne({
        filter: {
          id: parseInt(payload.jwtid),
          isRevoked: false,
          expiresAt: MoreThan(this._dateTime.toUTC(this._dateTime.timestamp)),
        },
      });
      if (!refreshTokenExists) {
        throw new NotAuthorizedError('Invalid refresh token provided');
      }

      // Set refresh token payload in request object
      request.refreshTokenPayload = payload;

      // Grant access and proceed to next middleware
      return true;
    } catch (error) {
      this._logger.error('JWT authentication failed: ', {
        error,
      });

      // Deny access
      throw new NotAuthorizedError('Refresh token expired or invalid');
    }
  }

  /**
   * Extracts refresh token from request
   * @param {TCustomRequest} request - Request object
   * @returns {string | undefined} Refresh token
   */
  private _extractToken(request: TCustomRequest): string | undefined {
    return request.cookies?.refreshToken;
  }
}
