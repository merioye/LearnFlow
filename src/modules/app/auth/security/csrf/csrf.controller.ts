import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { ApiResponse } from '@/common/utils';
import { ILogger, InjectLogger } from '@/modules/common/logger';

import { ENDPOINTS } from '@/constants';

import { SkipCsrf } from './decorators';
import { CsrfService } from './services';
import { CsrfTokenResponse } from './types';

/**
 * Controller for CSRF token management
 * Provides endpoints for token generation and validation
 *
 * @class CsrfController
 */
@Controller(ENDPOINTS.Csrf.Base)
export class CsrfController {
  public constructor(
    @InjectLogger() private readonly _logger: ILogger,
    private readonly _csrfService: CsrfService
  ) {}

  /**
   * Generates a new CSRF token for authenticated users
   * @param req - Express request object
   * @param res - Express response object
   * @returns CSRF token response
   */
  @Get(ENDPOINTS.Csrf.Get.Token)
  @HttpCode(HttpStatus.OK)
  @SkipCsrf() // Skip CSRF validation for token generation endpoint
  public generateToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): ApiResponse<CsrfTokenResponse> {
    try {
      this._logger.debug('Generating CSRF token for authenticated user', {
        data: {
          userAgent: req.headers['user-agent'],
          ip: req.ip,
        },
      });
      const tokenResponse = this._csrfService.generateToken(req, res);

      this._logger.info('CSRF token generated for authenticated user', {
        data: {
          userAgent: req.headers['user-agent'],
          ip: req.ip,
        },
      });

      return new ApiResponse({
        result: tokenResponse,
      });
    } catch (error) {
      this._logger.error('Failed to generate CSRF token', {
        error,
        data: {
          userAgent: req.headers['user-agent'],
          ip: req.ip,
        },
      });
      throw error;
    }
  }
}
