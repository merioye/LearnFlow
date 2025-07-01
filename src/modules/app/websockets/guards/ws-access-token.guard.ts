import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { WSError } from '@/common/errors';
import { ILogger, InjectLogger } from '@/modules/common/logger';
import { UserStatus } from '@/database';

import { Config } from '@/enums';

import { TAccessTokenPayload } from '../../auth';
import { IS_PUBLIC_DECORATOR_KEY } from '../../auth/constants';
import { UsersService } from '../../users';
import { TCustomSocket } from '../types';

/**
 * WSAccessTokenGuard - Handles authentication for WebSocket connections
 * Validates JWT tokens and establishes user context
 *
 * @class WSAccessTokenGuard
 * @implements {CanActivate}
 */
@Injectable()
export class WSAccessTokenGuard implements CanActivate {
  public constructor(
    @InjectLogger() private readonly _logger: ILogger,
    private readonly _usersService: UsersService,
    private readonly _jwtService: JwtService,
    private readonly _configService: ConfigService,
    private readonly _reflector: Reflector
  ) {}

  /**
   * Validate WebSocket connection authentication
   * @param context - Execution context
   * @returns Boolean indicating if connection is authorized
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

    try {
      // Extract access token from socket client
      const client = context.switchToWs().getClient<TCustomSocket>();
      const accessToken = this._extractTokenFromHandshake(client);
      if (!accessToken) {
        this._logger.warn(
          `Access token is not provided for socket: ${client.id}`
        );
        throw new WSError(
          'Access token is not provided',
          HttpStatus.UNAUTHORIZED
        );
        // return false;
      }

      // Verify access token
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
        this._logger.warn('User not found for socket', {
          data: { userId: payload.sub, socketId: client.id },
        });

        // Deny access
        throw new WSError('User not found', HttpStatus.UNAUTHORIZED);
        // return false;
      }
      if (user.status !== UserStatus.ACTIVE) {
        this._logger.warn('User is not active for socket', {
          data: { userId: payload.sub, socketId: client.id },
        });
        // Deny access
        throw new WSError('User is not active', HttpStatus.UNAUTHORIZED);
        // return false;
      }

      // Set authenticated user in socket client object
      client.data.user = {
        userId: parseInt(payload.sub),
        email: payload.email,
        role: payload.role,
        permissions: payload.permissions,
      };
      // Set authentication flag in socket client object
      client.data.isAuthenticated = true;

      // Grant access and proceed to next middleware
      return true;
    } catch (error) {
      const socketId = context.switchToWs().getClient<TCustomSocket>().id;
      this._logger.error(`JWT authentication failed for socket: ${socketId}`, {
        error,
      });

      // Deny access
      throw new WSError(
        'Access token expired or invalid',
        HttpStatus.UNAUTHORIZED
      );
      // return false;
    }
  }

  /**
   * Extract access token from socket handshake
   * @param client - Socket client
   * @returns Access token or null
   */
  private _extractTokenFromHandshake(client: TCustomSocket): string | null {
    // Try different token sources
    const token = (client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '') ||
      client.handshake.query?.token) as string | undefined;

    return token || null;
  }
}
