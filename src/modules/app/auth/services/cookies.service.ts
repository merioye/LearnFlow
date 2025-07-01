import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';

import { Config, Environment } from '@/enums';

import { JwtToken } from '../enums';
import { TCookieJwtToken } from '../types';

/**
 * Cookies service for handling cookies related operations
 *
 * @class CookiesService
 */
@Injectable()
export class CookiesService {
  public constructor(
    @InjectDateTime() private readonly _dateTime: IDateTime,
    private readonly _configService: ConfigService
  ) {}

  /**
   * Attaches JWT tokens to the cookie of the response sent to the client
   * @param {Response} res - Response object
   * @param {CookieJwtToken[]} tokens - Array of cookie JWT tokens
   * @returns {void}
   */
  public attachJwtTokens(res: Response, tokens: TCookieJwtToken[]): void {
    const jwtTokenExpiry = {
      [JwtToken.ACCESS]: this._configService.get<number>(
        Config.JWT_ACCESS_EXPIRATION_TIME
      ),
      [JwtToken.REFRESH]: this._configService.get<number>(
        Config.JWT_REFRESH_EXPIRATION_TIME
      ),
    };
    const isProduction =
      this._configService.get<Environment>(Config.NODE_ENV) ===
      Environment.PROD;

    tokens.forEach((token) => {
      res.cookie(token.type, token.token, {
        expires: this._dateTime.toUTC(
          this._dateTime.timestamp + Number(jwtTokenExpiry[token.type])
        ),
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction,
        httpOnly: true,
      });
    });
  }

  /**
   * Clears the specified JWT tokens from the cookie of the response sent to the client
   * @param {Response} res - Response object
   * @param {JwtToken[]} tokens - Array of JWT tokens to clear
   * @returns {void}
   */
  public clearJwtTokens(res: Response, tokens: JwtToken[]): void {
    tokens.forEach((token) => {
      res.clearCookie(token);
    });
  }
}
