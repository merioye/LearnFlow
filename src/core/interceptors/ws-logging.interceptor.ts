import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

import { TCustomSocket } from '@/modules/app/websockets';
import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
import { ILogger, InjectLogger } from '@/modules/common/logger';

/**
 * Interceptor for logging WebSocket requests and responses
 *
 * @class WsLoggingInterceptor
 * @implements {NestInterceptor}
 */
@Injectable()
export class WSLoggingInterceptor implements NestInterceptor {
  public constructor(
    @InjectLogger() private readonly _logger: ILogger,
    @InjectDateTime() private readonly _dateTime: IDateTime
  ) {}

  /**
   * Intercepts Websocket requests and responses for logging
   *
   * @param {ExecutionContext} context - The execution context
   * @param {CallHandler} next - The next handler in the chain
   * @returns {Observable<any>} - Observable of the response
   */
  public intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<any> {
    const client = context.switchToWs().getClient<TCustomSocket>();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const [eventName, data] = context.getArgs();

    // Get user info if available
    const userId = client.data?.user?.userId || 'anonymous';

    const startTime = this._dateTime.timestamp;
    // Log start of handler execution
    this._logger.debug(
      `WS:BEGIN ${eventName} from user ${userId} with data: ${JSON.stringify(data)}`
    );

    return next.handle().pipe(
      tap(() => {
        // Log end of handler execution
        const executionTime = this._dateTime.timestamp - startTime;
        this._logger.debug(`WS:END ${eventName} - ${executionTime}ms`);
      })
    );
  }
}
