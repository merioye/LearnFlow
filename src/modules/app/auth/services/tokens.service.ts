import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { Config } from '@/enums';

import { TAccessTokenPayload, TRefreshTokenPayload } from '../types';

/**
 * Tokens service for managing JWT access and refresh tokens
 * @class TokensService
 */
@Injectable()
export class TokensService {
  public constructor(
    private readonly _jwtService: JwtService,
    private readonly _configService: ConfigService
  ) {}

  /**
   * Generates JWT access token
   * @param {AccessTokenPayload} payload - Access token payload
   * @returns {string} JWT access token
   */
  public generateAccessToken(payload: TAccessTokenPayload): string {
    return this._jwtService.sign(payload, {
      secret: this._configService.get(Config.JWT_ACCESS_SECRET),
      algorithm: 'HS256',
      expiresIn: this._configService.get(Config.JWT_ACCESS_EXPIRATION_TIME),
      issuer: this._configService.get(Config.JWT_ISSUER),
      audience: this._configService.get(Config.JWT_AUDIENCE),
    });
  }

  /**
   * Generates JWT refresh token
   * @param {RefreshTokenPayload} payload - Refresh token payload
   * @returns {string} JWT refresh token
   */
  public generateRefreshToken(payload: TRefreshTokenPayload): string {
    return this._jwtService.sign(payload, {
      secret: this._configService.get(Config.JWT_REFRESH_SECRET),
      algorithm: 'HS256',
      expiresIn: this._configService.get(Config.JWT_REFRESH_EXPIRATION_TIME),
      issuer: this._configService.get(Config.JWT_ISSUER),
      audience: this._configService.get(Config.JWT_AUDIENCE),
      jwtid: payload.jwtid,
    });
  }
}
