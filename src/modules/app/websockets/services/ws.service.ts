// import { Injectable } from '@nestjs/common';
// import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
// import { ILogger, InjectLogger } from '@/modules/common/logger';

// import { WsEvent, WsRoom } from '../enums';
// import { MainWebSocketGateway } from '../gateways';
// import { RedisService } from './redis.service';

// /**
//  * WebSocketService - Provides methods to emit WebSocket events from HTTP controllers
//  * Enables seamless integration between REST API and WebSocket functionality
//  *
//  * @class WebSocketService
//  */
// @Injectable()
// export class WebSocketService {
//   public constructor(
//     @InjectLogger() private readonly _logger: ILogger,
//     @InjectDateTime() private readonly _dateTime: IDateTime,
//     private readonly _mainGateway: MainWebSocketGateway,
//     private readonly _redisService: RedisService
//   ) {}

//   /**
//    * Emit event to all connected clients
//    * @param event - Event name
//    * @param data - Event data
//    */
//   public async emitToAll(event: WsEvent, data: any): Promise<void> {
//     await this._mainGateway.broadcastToAll(event, data);
//   }

//   /**
//    * Emit event to specific user
//    * @param userId - Target user ID
//    * @param event - Event name
//    * @param data - Event data
//    */
//   public async emitToUser(
//     userId: string,
//     event: WsEvent,
//     data: any
//   ): Promise<void> {
//     await this._mainGateway.sendToUser(userId, event, data);
//   }

//   /**
//    * Emit event to room
//    * @param room - Room name
//    * @param event - Event name
//    * @param data - Event data
//    */
//   public async emitToRoom(
//     room: WsRoom,
//     event: WsEvent,
//     data: any
//   ): Promise<void> {
//     await this._mainGateway.sendToRoom(room, event, data);
//   }

//   /**
//    * Check if user is online
//    * @param userId - User ID to check
//    * @returns Boolean indicating if user is online
//    */
//   public async isUserOnline(userId: string): Promise<boolean> {
//     const sockets = await this._redisService.getUserSockets(userId);
//     return sockets.length > 0;
//   }

//   /**
//    * Get online users count
//    * @returns Number of online users
//    */
//   public async getOnlineUsersCount(): Promise<number> {
//     // This would need to be implemented based on your user tracking strategy
//     return this._mainGateway.getServerStats().connectedClients;
//   }

//   /**
//    * Send notification with delivery guarantee
//    * @param userId - Target user ID
//    * @param notification - Notification data
//    * @param options - Delivery options
//    */
//   public async sendNotificationWithGuarantee(
//     userId: string,
//     notification: any,
//     options: { ttl?: number; retries?: number } = {}
//   ): Promise<void> {
//     const messageId = `notif_${this._dateTime.timestamp}_${Math.random().toString(36).substring(2, 9)}`;
//     const { ttl = 3600, retries = 3 } = options;

//     // Store notification for delivery guarantee
//     await this._redisService.storeMessage(
//       messageId,
//       {
//         userId,
//         notification,
//         attempts: 0,
//         maxRetries: retries,
//         createdAt: this._dateTime.timestamp,
//       },
//       ttl
//     );

//     // Attempt delivery
//     await this._attemptNotificationDelivery(messageId, userId, notification);
//   }

//   /**
//    * Attempt notification delivery with retry logic
//    * @param messageId - Message ID
//    * @param userId - Target user ID
//    * @param notification - Notification data
//    * @private
//    */
//   private async _attemptNotificationDelivery(
//     messageId: string,
//     userId: string,
//     notification: any
//   ): Promise<void> {
//     const isOnline = await this.isUserOnline(userId);

//     if (isOnline) {
//       await this._mainGateway.sendToUser(userId, 'notification', {
//         ...notification,
//         messageId,
//         requiresAck: true,
//       });
//     } else {
//       // User is offline, notification will be delivered when they reconnect
//       this.wsLogger.logMessage('notification', userId, notification, {
//         type: 'queued_for_offline_user',
//         messageId,
//       });
//     }
//   }

//   /**
//    * Get server statistics
//    * @returns Server statistics
//    */
//   public getServerStats(): any {
//     return this._mainGateway.getServerStats();
//   }
// }
