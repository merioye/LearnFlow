// import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { ILogger, InjectLogger } from '@/modules/common/logger';
// import { Socket } from 'socket.io';

// import { TCustomSocket } from '../types';

// /**
//  * WebSocketAuthGuard - Handles authentication for WebSocket connections
//  * Validates JWT tokens and establishes user context
//  *
//  * @class WebSocketAuthGuard
//  * @implements {CanActivate}
//  */
// @Injectable()
// export class WebSocketAuthGuard implements CanActivate {
//   public constructor(
//     @InjectLogger() private readonly _logger: ILogger,
//     private readonly _jwtService: JwtService,
//     private readonly _configService: ConfigService
//   ) {}

//   /**
//    * Validate WebSocket connection authentication
//    * @param context - Execution context
//    * @returns Boolean indicating if connection is authorized
//    */
//   public async canActivate(context: ExecutionContext): Promise<boolean> {
//     try {
//       const client = context.switchToWs().getClient<TCustomSocket>();
//       const token = this._extractTokenFromHandshake(client);

//       if (!token) {
//         this._logger.warn(`No token provided for socket: ${client.id}`);
//         return false;
//       }

//       // const payload = await this.jwtService.verifyAsync(token, {
//       //   secret: this.configService.get<string>('JWT_SECRET'),
//       // });

//       // Attach user to socket for later use
//       client.data.user = payload;
//       client.data.userId = payload.sub || payload.id;

//       this._logger.debug(
//         `Authenticated socket: ${client.id} for user: ${client.data.userId}`
//       );
//       return true;
//     } catch (error) {
//       this._logger.error(
//         `Authentication failed for socket: ${context.switchToWs().getClient().id}`,
//         error
//       );
//       return false;
//     }
//   }

//   /**
//    * Extract JWT token from socket handshake
//    * @param client - Socket client
//    * @returns JWT token or null
//    */
//   private _extractTokenFromHandshake(client: Socket): string | null {
//     // Try different token sources
//     const token = (client.handshake.auth?.token ||
//       client.handshake.headers?.authorization?.replace('Bearer ', '') ||
//       client.handshake.query?.token) as string | undefined;

//     return token || null;
//   }
// }
