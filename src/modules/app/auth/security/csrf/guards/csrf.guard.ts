import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ForbiddenError } from '@/common/errors';
import { ILogger, InjectLogger } from '@/modules/common/logger';

import { SKIP_CSRF_DECORATOR_KEY } from '../constants';
import { CsrfService } from '../services';

/**
 * Guard that validates CSRF tokens for protected routes
 * Integrates with JWT authentication system
 *
 * @class CsrfGuard
 * @implements {CanActivate}
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  public constructor(
    @InjectLogger() private readonly _logger: ILogger,
    private readonly _csrfService: CsrfService,
    private readonly _reflector: Reflector
  ) {}

  /**
   * Validates CSRF token for the incoming request
   * @param context - Execution context
   * @returns boolean indicating if request should proceed
   */
  public canActivate(context: ExecutionContext): boolean {
    // Check if CSRF validation should be skipped for this handler/class
    const skipCsrf = this._reflector.getAllAndOverride<boolean>(
      SKIP_CSRF_DECORATOR_KEY,
      [context.getHandler(), context.getClass()]
    );

    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method.toUpperCase();

    if (skipCsrf) {
      this._logger.debug(`CSRF validation skipped for path: ${request.path}`);
      return true;
    }

    // Skip CSRF validation for safe HTTP methods
    if (!this._csrfService.shouldValidateMethod(method)) {
      return true;
    }

    try {
      // Validate CSRF token
      const isValid = this._csrfService.validateToken(request);
      if (!isValid) {
        throw new ForbiddenError('Invalid or missing CSRF token');
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw error;
      }

      this._logger.error('Unexpected error in CSRF guard', {
        error: error,
        data: {
          method: request.method,
          url: request.url,
        },
      });

      throw new ForbiddenError('CSRF validation failed');
    }
  }
}
