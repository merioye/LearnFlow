import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { doubleCsrf, DoubleCsrfProtection } from 'csrf-csrf';

import { ForbiddenError } from '@/common/errors';
import { IHashService, InjectHashService } from '@/modules/common/hash';
import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
import { ILogger, InjectLogger } from '@/modules/common/logger';

import { Config, Environment } from '@/enums';

import { JwtToken } from '../../../enums';
import { TCustomRequest } from '../../../types';
import { CsrfTokenResponse } from '../types';

/**
 * Service responsible for CSRF token generation and validation
 *
 * @class CsrfService
 */
@Injectable()
export class CsrfService {
  private readonly _doubleCsrfInstance: ReturnType<typeof doubleCsrf>;

  public constructor(
    @InjectLogger() private readonly _logger: ILogger,
    @InjectHashService() private readonly _hashService: IHashService,
    @InjectDateTime() private readonly _dateTime: IDateTime,
    private readonly _configService: ConfigService
  ) {
    const isProduction =
      this._configService.get<Environment>(Config.NODE_ENV) ===
      Environment.PROD;
    try {
      // Initialize csrf-csrf with configuration
      this._doubleCsrfInstance = doubleCsrf({
        getSecret: () => this._configService.get<string>(Config.CSRF_SECRET)!,
        getSessionIdentifier: (req: Request) => {
          // Use JWT token as session identifier
          // This ties CSRF tokens to specific user sessions
          const accessToken =
            (req as TCustomRequest)?.cookies?.[JwtToken.ACCESS] ||
            req.headers.authorization?.split(' ')[1];

          if (accessToken) {
            try {
              // Use a hash of the JWT as session identifier for better security
              // This ensures CSRF tokens are tied to specific sessions
              return this._hashService.hashSync(accessToken).substring(0, 32);
            } catch (error) {
              this._logger.warn('Failed to hash JWT for session identifier', {
                error,
              });
              // Fallback to substring if hashing fails
              return accessToken.substring(0, 32);
            }
          }

          // Fallback to IP + User-Agent for anonymous sessions
          // This is less secure but allows CSRF protection for non-authenticated routes
          const userAgent = req.headers['user-agent'] || '';
          const ip = req.ip || req.socket.remoteAddress || '';
          const fallbackId = `${ip}-${userAgent}`;

          try {
            return this._hashService.hashSync(fallbackId).substring(0, 32);
          } catch (error) {
            this._logger.warn(
              'Failed to hash fallback ID for session identifier',
              {
                error,
              }
            );
            // Final fallback
            return fallbackId.substring(0, 32);
          }
        },
        cookieName: this._configService.get<string>(Config.CSRF_COOKIE_NAME),
        cookieOptions: {
          secure: isProduction,
          httpOnly: true,
          sameSite: isProduction ? 'none' : 'lax',
          maxAge: this._configService.get<number>(Config.CSRF_EXPIRATION_TIME),
        },
        size: 64, // Token size in bytes
        ignoredMethods: ['GET', 'HEAD', 'OPTIONS'], // Methods to ignore CSRF validation
        getCsrfTokenFromRequest: (req: Request) => {
          // Check multiple sources for CSRF token
          return (
            (req as TCustomRequest).cookies?.[Config.CSRF_COOKIE_NAME] ||
            ((req as TCustomRequest).headers?.[
              Config.CSRF_COOKIE_NAME
            ] as string)
          );
        },
      });

      this._logger.info('CSRF protection initialized successfully');
    } catch (error) {
      this._logger.error('Failed to initialize CSRF protection', { error });
      throw new Error('CSRF initialization failed');
    }
  }

  /**
   * Generates a new CSRF token for the given request/response
   * @param req - Express request object
   * @param res - Express response object
   * @returns The CSRF token
   */
  public generateToken(req: Request, res: Response): CsrfTokenResponse {
    try {
      const { generateCsrfToken } = this._doubleCsrfInstance;
      const csrfToken = generateCsrfToken(req, res);

      this._logger.debug('CSRF token generated successfully', {
        data: {
          userAgent: req.headers['user-agent'],
          ip: req.ip,
          timestamp: this._dateTime.timestamp,
        },
      });

      return { csrfToken };
    } catch (error) {
      this._logger.error('Failed to generate CSRF token', {
        error: error,
        data: {
          userAgent: req.headers['user-agent'],
          ip: req.ip,
        },
      });
      throw new ForbiddenError('Failed to generate CSRF token');
    }
  }

  /**
   * Validates the CSRF token from the request
   * @param req - Express request object
   * @returns boolean indicating validation result
   */
  public validateToken(req: Request): boolean {
    try {
      const { validateRequest } = this._doubleCsrfInstance;
      const isValid = validateRequest(req);

      if (!isValid) {
        this._logger.warn('CSRF token validation failed', {
          data: {
            userAgent: req.headers['user-agent'],
            ip: req.ip,
            method: req.method,
            url: req.url,
            timestamp: this._dateTime.timestamp,
          },
        });
      } else {
        this._logger.debug('CSRF token validated successfully', {
          data: {
            userAgent: req.headers['user-agent'],
            ip: req.ip,
            method: req.method,
            url: req.url,
          },
        });
      }

      return isValid;
    } catch (error) {
      this._logger.error('CSRF token validation error', {
        error: error,
        data: {
          userAgent: req.headers['user-agent'],
          ip: req.ip,
          method: req.method,
          url: req.url,
        },
      });
      return false;
    }
  }

  /**
   * Generates CSRF middleware for Express
   * @returns Express middleware function
   */
  public getMiddleware(): DoubleCsrfProtection {
    const { doubleCsrfProtection } = this._doubleCsrfInstance;
    return doubleCsrfProtection;
  }

  /**
   * Checks if the request method should be validated for CSRF
   * @param method - HTTP method
   * @returns boolean indicating if validation is required
   */
  public shouldValidateMethod(method: string): boolean {
    const ignoredMethods = ['GET', 'HEAD', 'OPTIONS'];
    return !ignoredMethods.includes(method.toUpperCase());
  }
}
