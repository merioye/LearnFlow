import { Injectable } from '@nestjs/common';
import { ForbiddenError, NotAuthorizedError } from '@/common/errors';
import { IHashService, InjectHashService } from '@/modules/common/hash';

import { UserStatus } from '@/database';

import { Role } from '@/enums';

import { UserPermissionsService } from '../../permissions';
import { UsersService } from '../../users';
import { LoginDto } from '../dtos';
import {
  TAccessTokenPayload,
  TAuthTokens,
  TRefreshTokenPayload,
  TSelf,
} from '../types';
import { RefreshTokensService } from './refresh-tokens.service';
import { TokensService } from './tokens.service';

/**
 * AuthService is a service that handles authentication operations.
 * It provides methods for logging in, refreshing tokens, and logging out.
 *
 * @class AuthService
 */
@Injectable()
export class AuthService {
  public constructor(
    @InjectHashService() private readonly _hashService: IHashService,
    private readonly _userPermissionsService: UserPermissionsService,
    private readonly _usersService: UsersService,
    private readonly _tokensService: TokensService,
    private readonly _refreshTokensService: RefreshTokensService
  ) {}

  /**
   * Logins the user
   * @param {LoginDto} input - Login credentials
   * @returns {Promise<TAuthTokens>} Access token and refresh token
   */
  public async login(input: LoginDto): Promise<TAuthTokens> {
    const { email, password } = input;

    // Check user exists and is active
    const user = await this._usersService.findOne({ filter: { email } });
    if (!user) {
      throw new NotAuthorizedError('Invalid credentials');
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenError('User is not active');
    }

    // Verify password
    const isPasswordValid = await this._hashService.compare(
      password,
      user.password
    );
    if (!isPasswordValid) {
      throw new NotAuthorizedError('Invalid credentials');
    }

    // Get permissions of the user
    const permissions = await this._userPermissionsService.findAll(user.id);
    const permissionSlugs = permissions?.map((permission) => permission.slug);

    return this._generateJwtTokens({
      user,
      permissions: permissionSlugs,
    });
  }

  /**
   * Refreshes the authentication tokens using refresh token
   * @param {TRefreshTokenPayload} input - Refresh token payload
   * @returns {Promise<TAuthTokens>} New access token and refresh token
   */
  public async refresh(input: TRefreshTokenPayload): Promise<TAuthTokens> {
    // Delete old refresh token from database
    await this._refreshTokensService.deleteById({
      id: parseInt(input.jwtid),
    });

    return this._generateJwtTokens({
      user: {
        id: parseInt(input.sub),
        email: input.email,
        role: input.role,
      },
      permissions: input.permissions,
    });
  }

  /**
   * Logs out the user
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  public async logout(userId: number): Promise<void> {
    // Delete refresh tokens from db
    await this._refreshTokensService.deleteMany({
      filter: { userId },
    });
  }

  /**
   * Retrieves the user details
   * @param {number} id - User ID
   * @returns {Promise<TSelf>} User details
   */
  public async self(id: number): Promise<TSelf> {
    const user = await this._usersService.findById({ id });
    if (!user) {
      throw new NotAuthorizedError('User not found');
    }
    delete (user as { password?: string })?.password;

    const userPermissions = await this._userPermissionsService.findAll(id);

    return {
      ...user,
      permissions: userPermissions,
    };
  }

  /**
   * Generates JWT tokens for user
   * @param {UserEntity} user - User entity
   * @param {string[]} permissions - User permissions
   * @returns {Promise<AuthTokens>} Access token and refresh token
   */
  private async _generateJwtTokens({
    user,
    permissions,
  }: {
    user: { id: number; email: string; role: Role };
    permissions: string[];
  }): Promise<TAuthTokens> {
    // Persist refresh token in database
    const persistedRefreshToken = await this._refreshTokensService.persist(
      user.id
    );

    // Generate JWT tokens
    const tokenPayload: TAccessTokenPayload = {
      sub: user.id?.toString(),
      email: user.email,
      role: user.role,
      permissions,
    };
    const accessToken = this._tokensService.generateAccessToken(tokenPayload);
    const refreshToken = this._tokensService.generateRefreshToken({
      ...tokenPayload,
      jwtid: persistedRefreshToken.id?.toString(),
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}

// Example on how to record custom metrics to prometheus
// export class AuthService {
//   public constructor(private readonly _usersMetrics: UsersMetrics) {}

//   @RecordMetric('user_creation', MetricType.HISTOGRAM, () => ({
//     source: 'api',
//   }))
//   public registerUser(): void {
//     // Implementation

//     // Track successful registration
//     this._usersMetrics.trackRegistration('success');
//   }

//   public findAllUsers(): any[] {
//     // Implementation
//     const users: any[] = [];

//     // Track active users count
//     this._usersMetrics.trackActiveUsers(users.length);

//     return users;
//   }
// }
