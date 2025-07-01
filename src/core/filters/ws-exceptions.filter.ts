import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { WSError } from '@/common/errors';
import {
  TCustomSocket,
  WS_ERROR_CODE,
  WSEvent,
} from '@/modules/app/websockets';
import { ILogger, InjectLogger } from '@/modules/common/logger';

/**
 * WebSocket exception filter for handling errors during WebSocket operations
 *
 * @class WSExceptionsFilter
 * @implements {ExceptionFilter}
 */
@Catch(WSError)
export class WSExceptionsFilter implements ExceptionFilter {
  public constructor(@InjectLogger() private readonly _logger: ILogger) {}

  /**
   * Catches and handles all unhandled websocket exceptions in the application.
   *
   * @param exception - The unhandled exception.
   * @param host - Provides methods for accessing the underlying platform-specific socket client.
   */
  public catch(exception: WSError, host: ArgumentsHost): void {
    const client = host.switchToWs().getClient<TCustomSocket>();
    const errorId = uuidv4();

    this._logger.error(`Socket Error: ${exception?.message}`, {
      meta: {
        id: errorId,
        socketId: client.id,
        userId: client.data?.user?.userId || null,
        stack: exception?.stack || null,
        statusCode: exception?.getStatus(),
      },
    });

    // Send error to client with event name based on the callback or a default
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const callback = host.getArgByIndex(2);

    if (typeof callback === 'function') {
      // If a callback exists, use it
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      callback({
        code: WS_ERROR_CODE.EXCEPTION_FILTER_ERROR,
        message: exception?.message,
      });
    } else {
      // Otherwise emit generic error event
      client.emit(WSEvent.ERROR, {
        code: WS_ERROR_CODE.EXCEPTION_FILTER_ERROR,
        message: exception?.message,
      });
    }
  }
}
