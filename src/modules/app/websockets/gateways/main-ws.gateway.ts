// import {
//   OnGatewayConnection,
//   OnGatewayDisconnect,
//   OnGatewayInit,
//   WebSocketGateway,
//   WebSocketServer,
// } from '@nestjs/websockets';
// import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
// import { ILogger, InjectLogger } from '@/modules/common/logger';
// import { createAdapter } from '@socket.io/redis-adapter';
// import { Server, Socket } from 'socket.io';

// import { Config } from '@/enums';

// import { RedisService } from '../services';
// import { TCustomSocket } from '../types';

// /**
//  * MainWebSocketGateway - Primary WebSocket gateway handling all real-time communications
//  * Implements horizontal scaling with Redis adapter, authentication, and comprehensive event handling
//  *
//  * @class MainWebSocketGateway
//  * @implements {OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect}
//  */
// @WebSocketGateway({
//   // namespace: '/ws',
//   cors: {
//     origin: process.env[Config.ALLOWED_ORIGINS]?.split(',') || '*',
//     credentials: true,
//   },
//   transports: ['websocket', 'polling'],
//   allowEIO3: true,
//   pingTimeout: 60000,
//   pingInterval: 25000,
//   // Performance optimizations
//   serveClient: false,
//   allowUpgrades: true,
//   perMessageDeflate: {
//     threshold: 1024,
//   },
//   httpCompression: {
//     threshold: 1024,
//   },
// })
// // @UseGuards(WebSocketAuthGuard)
// export class MainWebSocketGateway
//   implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
// {
//   @WebSocketServer()
//   public server: Server;
//   private readonly _maxReconnectAttempts = 5;
//   private readonly _reconnectInterval = 3000;

//   public constructor(
//     @InjectLogger() private readonly _logger: ILogger,
//     @InjectDateTime() private readonly _dateTime: IDateTime,
//     private readonly _redisService: RedisService
//   ) {}

//   /**
//    * Initialize WebSocket server with Redis adapter
//    * @param server - Socket.IO server instance
//    * @returns {void}
//    */
//   public afterInit(server: Server): void {
//     // Setup Redis adapter for horizontal scaling
//     const pubClient = this._redisService.getClient();
//     const subClient = pubClient.duplicate();

//     server.adapter(createAdapter(pubClient, subClient));

//     // Configure server options for production
//     server.engine.generateId = (): string => {
//       return `${this._dateTime.timestamp}-${Math.random().toString(36).substring(2, 9)}`;
//     };

//     this._logger.log('WebSocket Gateway initialized with Redis adapter');
//   }

//   /**
//    * Handle client connection
//    * @param client - Socket client
//    */
//   public async handleConnection(client: TCustomSocket): Promise<void> {
//     try {
//       const userId = client.data.user.userId;
//       const userAgent = client.handshake.headers['user-agent'];
//       const ipAddress = client.handshake.address;

//       // Store connection in Redis
//       await this._redisService.storeSocketConnection(client.id, userId, {
//         userAgent,
//         ipAddress,
//         namespace: client.nsp.name,
//       });

//       // Join user to their personal room for direct messaging
//       await client.join(`user:${userId}`);
//       await this._redisService.addToRoom(client.id, `user:${userId}`);

//       this._logger.info(`User ${userId} connected`, {
//         data: {
//           socketId: client.id,
//           userId,
//           userAgent,
//           ipAddress,
//           namespace: client.nsp.name,
//           totalConnections: this.server.engine.clientsCount,
//         },
//       });

//       // Emit connection success
//       client.emit('connection:success', {
//         socketId: client.id,
//         timestamp: this._dateTime.timestamp,
//       });

//       // Setup connection recovery
//       this._setupConnectionRecovery(client);
//     } catch (error) {
//       this._logger.error('Socket connection failed', {
//         error,
//         data: {
//           socketId: client.id,
//         },
//       });
//       client.emit('connection:error', { message: 'Connection setup failed' });
//       client.disconnect(true);
//     }
//   }

//   /**
//    * Handle client disconnection
//    * @param client - Socket client
//    */
//   async handleDisconnect(client: TCustomSocket): Promise<void> {
//     try {
//       const userId = client.data.user.userId;

//       // Remove from Redis
//       await this._redisService.removeSocketConnection(client.id);

//       this._logger.info(`User ${userId} disconnected`, {
//         data: {
//           socketId: client.id,
//           userId,
//           namespace: client.nsp.name,
//           totalConnections: this.server.engine.clientsCount - 1,
//         },
//       });
//     } catch (error) {
//       this._logger.error('Socket disconnection failed', {
//         error,
//         data: {
//           socketId: client.id,
//         },
//       });
//     }
//   }

//   /**
//    * Setup connection recovery mechanism
//    * @param client - Socket client
//    * @private
//    */
//   private _setupConnectionRecovery(client: TCustomSocket): void {
//     let reconnectAttempts = 0;

//     client.on('disconnect', async (reason) => {
//       if (reason === 'transport close' || reason === 'transport error') {
//         const recoveryData = {
//           socketId: client.id,
//           userId: client.data.user.userId,
//           rooms: Array.from(client.rooms),
//           lastSeen: this._dateTime.timestamp,
//         };

//         // Store recovery data
//         await this._redisService.storeMessage(
//           `recovery:${client.id}`,
//           recoveryData,
//           300 // 5 minutes
//         );
//       }
//     });

//     client.on('reconnect', () => {
//       reconnectAttempts++;
//       this.wsLogger.logConnection(
//         client.id,
//         client.data.userId,
//         'reconnect_attempt',
//         { attempt: reconnectAttempts }
//       );
//     });
//   }

//   /**
//    * Generic message handler - handles any event with acknowledgment support
//    * @param event - Event name
//    * @param data - Event data
//    * @param client - Socket client
//    * @returns Promise<any>
//    */
//   @SubscribeMessage('*')
//   @UsePipes(new ValidationPipe({ transform: true }))
//   async handleGenericMessage(
//     @MessageBody() data: any,
//     @ConnectedSocket() client: Socket
//   ): Promise<any> {
//     try {
//       const event = data.event;
//       const payload = data.payload;
//       const requiresAck = data.requiresAck || false;

//       this.wsLogger.logMessage(event, client.id, payload, {
//         userId: client.data.userId,
//         requiresAck,
//       });

//       // Process message based on event type
//       const result = await this.processMessage(event, payload, client);

//       if (requiresAck) {
//         return {
//           success: true,
//           data: result,
//           timestamp: new Date().toISOString(),
//           messageId: data.messageId,
//         };
//       }
//     } catch (error) {
//       this.wsLogger.logError(error, 'handleGenericMessage', {
//         socketId: client.id,
//         event: data.event,
//       });

//       if (data.requiresAck) {
//         return {
//           success: false,
//           error: error.message,
//           timestamp: new Date().toISOString(),
//           messageId: data.messageId,
//         };
//       }

//       throw new WsException(error.message);
//     }
//   }

//   /**
//    * Process different types of messages
//    * @param event - Event name
//    * @param payload - Message payload
//    * @param client - Socket client
//    * @returns Promise<any>
//    * @private
//    */
//   private async processMessage(
//     event: string,
//     payload: any,
//     client: Socket
//   ): Promise<any> {
//     switch (event) {
//       case 'join:room':
//         return this.handleJoinRoom(payload, client);
//       case 'leave:room':
//         return this.handleLeaveRoom(payload, client);
//       case 'broadcast:room':
//         return this.handleRoomBroadcast(payload, client);
//       case 'message:direct':
//         return this.handleDirectMessage(payload, client);
//       case 'ping':
//         return this.handlePing(payload, client);
//       default:
//         // For extensibility - delegate to feature-specific handlers
//         return this.delegateToFeatureHandler(event, payload, client);
//     }
//   }

//   /**
//    * Handle room join requests
//    * @param payload - Join room payload
//    * @param client - Socket client
//    * @private
//    */
//   private async handleJoinRoom(payload: any, client: Socket): Promise<any> {
//     const { room, namespace = 'default' } = payload;

//     await client.join(room);
//     await this.redisService.addToRoom(client.id, room, namespace);

//     const roomSockets = await this.redisService.getRoomSockets(room, namespace);

//     // Notify room members
//     client.to(room).emit('room:member_joined', {
//       userId: client.data.userId,
//       room,
//       timestamp: new Date().toISOString(),
//       memberCount: roomSockets.length,
//     });

//     return { room, joined: true, memberCount: roomSockets.length };
//   }

//   /**
//    * Handle room leave requests
//    * @param payload - Leave room payload
//    * @param client - Socket client
//    * @private
//    */
//   private async handleLeaveRoom(payload: any, client: Socket): Promise<any> {
//     const { room, namespace = 'default' } = payload;

//     await client.leave(room);
//     await this.redisService.removeFromRoom(client.id, room, namespace);

//     const roomSockets = await this.redisService.getRoomSockets(room, namespace);

//     // Notify remaining room members
//     client.to(room).emit('room:member_left', {
//       userId: client.data.userId,
//       room,
//       timestamp: new Date().toISOString(),
//       memberCount: roomSockets.length,
//     });

//     return { room, left: true, memberCount: roomSockets.length };
//   }

//   /**
//    * Handle room broadcasting
//    * @param payload - Broadcast payload
//    * @param client - Socket client
//    * @private
//    */
//   private async handleRoomBroadcast(
//     payload: any,
//     client: Socket
//   ): Promise<any> {
//     const { room, message, excludeSelf = true } = payload;

//     const broadcast = excludeSelf ? client.to(room) : this.server.to(room);

//     broadcast.emit('room:broadcast', {
//       from: client.data.userId,
//       room,
//       message,
//       timestamp: new Date().toISOString(),
//     });

//     return { broadcasted: true, room };
//   }

//   /**
//    * Handle direct messages
//    * @param payload - Direct message payload
//    * @param client - Socket client
//    * @private
//    */
//   private async handleDirectMessage(
//     payload: any,
//     client: Socket
//   ): Promise<any> {
//     const { targetUserId, message, messageId } = payload;

//     // Store message for delivery guarantee
//     if (messageId) {
//       await this.redisService.storeMessage(messageId, {
//         from: client.data.userId,
//         to: targetUserId,
//         message,
//         timestamp: new Date().toISOString(),
//       });
//     }

//     // Send to target user's room
//     this.server.to(`user:${targetUserId}`).emit('message:direct', {
//       from: client.data.userId,
//       message,
//       messageId,
//       timestamp: new Date().toISOString(),
//     });

//     return { sent: true, targetUserId, messageId };
//   }

//   /**
//    * Handle ping requests
//    * @param payload - Ping payload
//    * @param client - Socket client
//    * @private
//    */
//   private async handlePing(payload: any, client: Socket): Promise<any> {
//     return {
//       pong: true,
//       timestamp: new Date().toISOString(),
//       latency: payload.timestamp ? Date.now() - payload.timestamp : null,
//     };
//   }

//   /**
//    * Delegate to feature-specific handlers (for extensibility)
//    * @param event - Event name
//    * @param payload - Event payload
//    * @param client - Socket client
//    * @private
//    */
//   private async delegateToFeatureHandler(
//     event: string,
//     payload: any,
//     client: Socket
//   ): Promise<any> {
//     // This is where you would delegate to specific feature handlers
//     // For example: chat handlers, notification handlers, etc.

//     this.logger.warn(`No handler found for event: ${event}`);
//     return { error: 'Event not supported', event };
//   }

//   /**
//    * Broadcast to all connected clients
//    * @param event - Event name
//    * @param data - Data to broadcast
//    */
//   async broadcastToAll(event: string, data: any): Promise<void> {
//     this.server.emit(event, {
//       ...data,
//       timestamp: new Date().toISOString(),
//     });

//     this.wsLogger.logMessage(event, 'broadcast', data, {
//       type: 'global_broadcast',
//     });
//   }

//   /**
//    * Send message to specific user
//    * @param userId - Target user ID
//    * @param event - Event name
//    * @param data - Data to send
//    */
//   async sendToUser(userId: string, event: string, data: any): Promise<void> {
//     this.server.to(`user:${userId}`).emit(event, {
//       ...data,
//       timestamp: new Date().toISOString(),
//     });

//     this.wsLogger.logMessage(event, `user:${userId}`, data, {
//       type: 'direct_message',
//     });
//   }

//   /**
//    * Send message to room
//    * @param room - Room name
//    * @param event - Event name
//    * @param data - Data to send
//    * @param namespace - Namespace (optional)
//    */
//   async sendToRoom(
//     room: string,
//     event: string,
//     data: any,
//     namespace = 'default'
//   ): Promise<void> {
//     this.server.to(room).emit(event, {
//       ...data,
//       timestamp: new Date().toISOString(),
//     });

//     this.wsLogger.logMessage(event, room, data, {
//       type: 'room_broadcast',
//       namespace,
//     });
//   }

//   /**
//    * Get server statistics
//    * @returns Server statistics
//    */
//   getServerStats(): any {
//     return {
//       connectedClients: this.server.engine.clientsCount,
//       uptime: process.uptime(),
//       memory: process.memoryUsage(),
//       timestamp: new Date().toISOString(),
//     };
//   }
// }
