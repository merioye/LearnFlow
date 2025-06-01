import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '@/common/utils';
import { ILogger, InjectLogger } from '@/modules/common/logger';

import { ENDPOINTS } from '@/constants';

import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dtos';
import { JwtToken } from './enums';
import { RefreshTokenGuard } from './guards';
import { AuthService, CookiesService } from './services';
import { TAuthRequestUser, TAuthTokens, TCustomRequest, TSelf } from './types';

/**
 * Authentication controller
 * @class AuthController
 */
@Controller(ENDPOINTS.Auth.Base)
export class AuthController {
  public constructor(
    @InjectLogger() private readonly _logger: ILogger,
    private readonly _authService: AuthService,
    private readonly _cookiesService: CookiesService
  ) {}

  /**
   * Login user endpoint
   * @param {LoginDto} input - Login credentials
   * @param {Response} res - Response object
   * @returns {Promise<ApiResponse<AuthTokens>>} Access token and refresh token
   */
  @Public()
  @Post(ENDPOINTS.Auth.Post.Login)
  @HttpCode(HttpStatus.OK)
  public async login(
    @Body() input: LoginDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<ApiResponse<TAuthTokens>> {
    this._logger.debug('Login request for user', {
      data: {
        email: input.email,
        password: '******',
      },
    });

    const tokens = await this._authService.login(input);
    this._cookiesService.attachJwtTokens(res, [
      { token: tokens.accessToken, type: JwtToken.ACCESS },
      { token: tokens.refreshToken, type: JwtToken.REFRESH },
    ]);

    this._logger.info('Login successful for user', {
      data: {
        email: input.email,
      },
    });

    return new ApiResponse({
      message: 'User logged in successfully',
      result: tokens,
      statusCode: HttpStatus.OK,
    });
  }

  /**
   * Refresh token endpoint
   * @param {Response} res - Response object
   * @param {TCustomRequest} req - Request object
   * @returns {Promise<ApiResponse<AuthTokens>>} New Access token and refresh token
   */
  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post(ENDPOINTS.Auth.Post.Refresh)
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Res({ passthrough: true }) res: Response,
    @Req() req: TCustomRequest
  ): Promise<ApiResponse<TAuthTokens>> {
    const refreshPayload = req.refreshTokenPayload;

    const loggerMetadata = {
      userId: refreshPayload.sub,
      email: refreshPayload.email,
      jwtId: refreshPayload.jwtid,
    };
    this._logger.debug('Refresh token request', {
      data: loggerMetadata,
    });

    const tokens = await this._authService.refresh(refreshPayload);
    this._cookiesService.attachJwtTokens(res, [
      { token: tokens.accessToken, type: JwtToken.ACCESS },
      { token: tokens.refreshToken, type: JwtToken.REFRESH },
    ]);

    this._logger.info('Refresh token successful', {
      data: loggerMetadata,
    });

    return new ApiResponse({
      message: 'Tokens refreshed successfully',
      result: tokens,
      statusCode: HttpStatus.OK,
    });
  }

  /**
   * Logout endpoint
   * @param {Response} res - Response object
   * @param {TAuthRequestUser} user - Currently logged in user
   * @returns {Promise<ApiResponse<null>>}
   */
  @Post(ENDPOINTS.Auth.Post.Logout)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: TAuthRequestUser
  ): Promise<ApiResponse<null>> {
    const loggerMetadata = {
      userId: user.userId,
      email: user.email,
    };
    this._logger.debug('Logout request', {
      data: loggerMetadata,
    });

    await this._authService.logout(user.userId);
    this._cookiesService.clearJwtTokens(res, [
      JwtToken.ACCESS,
      JwtToken.REFRESH,
    ]);

    this._logger.info('Logout successful', {
      data: loggerMetadata,
    });

    return new ApiResponse({
      message: 'User logged out successfully',
      result: null,
      statusCode: HttpStatus.NO_CONTENT,
    });
  }

  /**
   * Get current user info endpoint
   * @param {TAuthRequestUser} user - Currently logged in user
   * @returns {Promise<ApiResponse<TSelf>>} User info
   */
  @Get(ENDPOINTS.Auth.Get.Self)
  async getSelf(
    @CurrentUser() user: TAuthRequestUser
  ): Promise<ApiResponse<TSelf>> {
    this._logger.debug('Get self info request', {
      data: {
        userId: user.userId,
        email: user.email,
      },
    });

    const data = await this._authService.self(user.userId);

    return new ApiResponse({
      message: 'Data fetched successfully',
      result: data,
      statusCode: HttpStatus.OK,
    });
  }
}
