import {
  HttpStatus,
  Injectable,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { createAdapter } from '@socket.io/redis-adapter';
import { Namespace, Server } from 'socket.io';

import { WSError } from '@/common/errors';
import { WSLoggingInterceptor } from '@/core/interceptors';
import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
import { ILogger, InjectLogger } from '@/modules/common/logger';

import { wsValidationPipeOptions } from '@/config';

import { wsGatewayConfig } from '../config';
import { ConnectedSocketUser } from '../decorators';
import {
  BroadcastRoomDto,
  BroadcastUserDto,
  JoinRoomDto,
  LeaveRoomDto,
  PingDto,
} from '../dtos';
import { WS_ERROR_CODE, WSEvent, WSNamespace } from '../enums';
import { WSAccessTokenGuard } from '../guards';
import { WSRedisService } from '../services';
import {
  TCustomSocket,
  TSocketConnectionInfo,
  TSocketJoinRoomResult,
  TSocketLeaveRoomResult,
  TSocketPongResult,
  TSocketRoomBroadcastResult,
  TSocketRoomInfo,
  TSocketServerStats,
  TSocketUserBroadcastResult,
} from '../types';

/**
 * MainWebSocketGateway - Core WebSocket gateway handling connection management,
 * generic room operations, and cross-namespace utilities
 *
 * @class MainWSGateway
 * @implements {OnGatewayInit} - Handles gateway initialization
 * @implements {OnGatewayConnection} - Handles new client connections
 * @implements {OnGatewayDisconnect} - Handles client disconnections
 */
@WebSocketGateway({ ...wsGatewayConfig })
@UseGuards(WSAccessTokenGuard)
@UseInterceptors(WSLoggingInterceptor)
@Injectable()
export class MainWSGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  public readonly server: Server;

  /**
   * Connection store mapping socket IDs to connection information
   *
   * Stores detailed information about each active WebSocket connection,
   * including user data, authentication status, and connection metadata.
   *
   * Key: Socket ID (string)
   * Value: Socket connection information object
   *
   * @private
   * @readonly
   * @type {Map<string, TSocketConnectionInfo>}
   */
  private readonly _connectionStore = new Map<string, TSocketConnectionInfo>();

  /**
   * User connections mapping user IDs to their active socket connections
   *
   * Tracks multiple socket connections per user to handle scenarios where
   * a user has multiple browser tabs/devices connected simultaneously.
   *
   * Key: User ID (number)
   * Value: Set of socket IDs belonging to that user
   *
   * @private
   * @readonly
   * @type {Map<number, Set<string>>}
   */
  private readonly _userConnections = new Map<number, Set<string>>();

  /**
   * Room members mapping room names to connected socket IDs
   *
   * Manages room memberships for group communications, chat rooms,
   * or any feature requiring multiple users in a shared context.
   *
   * Key: Room name/ID (string)
   * Value: Set of socket IDs currently in that room
   *
   * @private
   * @readonly
   * @type {Map<string, Set<string>>}
   */
  private readonly _roomMembers = new Map<string, Set<string>>();

  /**
   * Maximum allowed concurrent connections per user
   *
   * Limits the number of simultaneous WebSocket connections a single user
   * can maintain to prevent resource abuse and ensure fair usage.
   *
   * @private
   * @readonly
   * @type {number}
   * @default 5
   */
  private readonly _MAX_CONNECTIONS_PER_USER = 5;

  /**
   * Heartbeat interval in milliseconds
   *
   * Defines how frequently heartbeat messages are sent to maintain
   * active connections and detect disconnected clients.
   *
   * @private
   * @readonly
   * @type {number}
   * @default 30000 (30 seconds)
   */
  private readonly _HEARTBEAT_INTERVAL = 30000;

  /**
   * Heartbeat timer reference
   *
   * Stores the timer reference for the periodic heartbeat mechanism
   * to allow proper cleanup when the gateway is destroyed.
   *
   * @private
   * @type {NodeJS.Timeout | undefined}
   */
  private _heartbeatTimer?: NodeJS.Timeout;

  public constructor(
    @InjectLogger() private readonly _logger: ILogger,
    @InjectDateTime() private readonly _dateTime: IDateTime,
    private readonly _redisService: WSRedisService
  ) {}

  /**
   * Clean up resources on module destroy
   * @returns {void}
   */
  public onModuleDestroy(): void {
    if (this._heartbeatTimer) {
      clearInterval(this._heartbeatTimer);
    }
  }

  /**
   * Initialize WebSocket server with Redis adapter and configurations
   * @param namespace - Socket namespace instance
   * @returns {Promise<void>}
   */
  public async afterInit(namespace: Namespace): Promise<void> {
    try {
      this._logger.info('Initializing Main WebSocket Gateway...');

      // Setup Redis adapter for horizontal scaling with proper async handling
      await this._setupRedisAdapter(namespace);

      // Start heartbeat monitoring
      this._startHeartbeatMonitoring();

      // Setup global error handlers
      namespace.server.engine.on('connection_error', (err: unknown) => {
        this._logger.error('Socket.IO connection error', { error: err });
      });

      this._logger.info('Main WebSocket Gateway initialized', {
        data: {
          namespace: WSNamespace.DEFAULT,
          redisAdapter: true,
          heartbeatInterval: this._HEARTBEAT_INTERVAL,
        },
      });
    } catch (error) {
      this._logger.error('Failed to initialize Main WebSocket gateway', {
        error,
      });
      throw error;
    }
  }

  /**
   * Handle client connection
   * @param client - Socket client
   */
  public async handleConnection(client: TCustomSocket): Promise<void> {
    try {
      const userId = client.data?.user?.userId;
      const userAgent = client.handshake.headers['user-agent'];
      const ipAddress = client.handshake.address;

      // Check connection limits per user
      this._enforceConnectionLimits(userId, client);

      // Store connection information
      const connectionInfo: TSocketConnectionInfo = {
        socketId: client.id,
        userId,
        userAgent,
        ipAddress,
        namespace: WSNamespace.DEFAULT,
        connectedAt: this._dateTime.toUTC(this._dateTime.timestamp),
        lastActivity: this._dateTime.toUTC(this._dateTime.timestamp),
      };

      this._connectionStore.set(client.id, connectionInfo);
      this._addUserConnection(userId, client.id);

      // Store in Redis for cross-server communication
      await this._redisService.storeSocketConnection(client.id, userId, {
        userAgent,
        ipAddress,
        namespace: WSNamespace.DEFAULT,
        connectedAt: this._dateTime.toUTC(this._dateTime.timestamp),
      });

      // Join user to their personal room for direct messaging
      const userRoom = `user:${userId}`;
      await client.join(userRoom);
      await this._redisService.addToRoom(
        client.id,
        userRoom,
        WSNamespace.DEFAULT
      );

      // Setup client event handlers
      this._setupClientEventHandlers(client);

      // Send connection success
      client.emit(WSEvent.CONNECTION_SUCCESS, {
        socketId: client.id,
        userId,
        timestamp: this._dateTime.timestamp,
        serverTime: this._dateTime.toUTC(this._dateTime.timestamp),
        features: {
          heartbeat: true,
          rooms: true,
          directMessaging: true,
          broadcasting: true,
        },
      });

      // Notify about user status
      this._broadcastUserStatus(userId, 'online', { exclude: client.id });

      this._logger.info('User connected to main gateway', {
        data: {
          socketId: client.id,
          userId,
          userAgent,
          ipAddress,
          namespace: WSNamespace.DEFAULT,
          totalConnections: this._connectionStore.size,
          userConnections: this._userConnections.get(userId)?.size || 0,
        },
      });
    } catch (error) {
      this._logger.error('Connection setup failed', {
        error,
        data: {
          socketId: client.id,
          userId: client.data?.user?.userId,
        },
      });

      client.emit(WSEvent.CONNECTION_ERROR, {
        message: 'Connection setup failed',
        code: WS_ERROR_CODE.CONNECTION_SETUP_ERROR,
        timestamp: this._dateTime.timestamp,
      });
      client.disconnect(true);
    }
  }

  /**
   * Handle client disconnection
   * @param client - Socket client
   */
  public async handleDisconnect(client: TCustomSocket): Promise<void> {
    try {
      const connectionInfo = this._connectionStore.get(client.id);
      const userId = connectionInfo?.userId;

      if (connectionInfo) {
        // Remove from local storage
        this._connectionStore.delete(client.id);
        this._removeUserConnection(userId!, client.id);

        // Remove from Redis
        await this._redisService.removeSocketConnection(client.id);

        // Update user status if no more connections
        const remainingConnections =
          this._userConnections.get(userId!)?.size || 0;
        if (remainingConnections === 0) {
          this._broadcastUserStatus(userId!, 'offline');
          this._userConnections.delete(userId!);
        }

        this._logger.info('User disconnected from main gateway', {
          data: {
            socketId: client.id,
            userId,
            namespace: connectionInfo.namespace,
            connectionDuration:
              this._dateTime.timestamp - connectionInfo.connectedAt.getTime(),
            totalConnections: this._connectionStore.size,
            userConnections: remainingConnections,
          },
        });
      }
    } catch (error) {
      this._logger.error('Disconnect handling failed', {
        error,
        data: {
          socketId: client.id,
          userId: client.data?.user?.userId,
        },
      });
    }
  }

  // ==========================================
  // MESSAGE HANDLERS
  // ==========================================

  @SubscribeMessage(WSEvent.JOIN_ROOM)
  @UsePipes(new ValidationPipe(wsValidationPipeOptions))
  public async handleJoinRoom(
    @ConnectedSocket() client: TCustomSocket,
    @ConnectedSocketUser('userId') userId: number,
    @MessageBody() data: JoinRoomDto
  ): Promise<TSocketJoinRoomResult> {
    try {
      const { room, namespace = WSNamespace.DEFAULT, metadata } = data;

      // Validate room name
      if (!this._isValidRoomName(room)) {
        throw new WSError('Invalid room name');
      }

      // Join socket room
      await client.join(room);

      // Store in Redis
      await this._redisService.addToRoom(client.id, room, namespace);

      // Update local room tracking
      if (!this._roomMembers.has(room)) {
        this._roomMembers.set(room, new Set());
      }
      this._roomMembers.get(room)!.add(client.id);

      // Get room member count
      const memberCount = this._roomMembers.get(room)!.size;

      // Notify other room members
      client.to(room).emit(WSEvent.ROOM_MEMBER_JOINED, {
        userId,
        room,
        namespace,
        user: client.data?.user,
        metadata,
        memberCount,
        timestamp: this._dateTime.timestamp,
      });

      // Confirm to client
      client.emit(WSEvent.ROOM_JOINED, {
        room,
        namespace,
        memberCount,
        timestamp: this._dateTime.timestamp,
      });

      this._logger.info('User joined room', {
        data: { userId, room, namespace, memberCount },
      });

      return { success: true, room, memberCount };
    } catch (error) {
      this._logger.error('Error joining room', {
        error,
        data: {
          userId,
          room: data.room,
          namespace: data.namespace ?? WSNamespace.DEFAULT,
        },
      });
      throw new WSError(
        'Failed to join room',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @SubscribeMessage(WSEvent.LEAVE_ROOM)
  @UsePipes(new ValidationPipe(wsValidationPipeOptions))
  public async handleLeaveRoom(
    @ConnectedSocket() client: TCustomSocket,
    @ConnectedSocketUser('userId') userId: number,
    @MessageBody() data: LeaveRoomDto
  ): Promise<TSocketLeaveRoomResult> {
    try {
      const { room, namespace = WSNamespace.DEFAULT } = data;

      // Leave socket room
      await client.leave(room);

      // Remove from Redis
      await this._redisService.removeFromRoom(client.id, room, namespace);

      // Update local room tracking
      if (this._roomMembers.has(room)) {
        this._roomMembers.get(room)!.delete(client.id);
        if (this._roomMembers.get(room)!.size === 0) {
          this._roomMembers.delete(room);
        }
      }

      const memberCount = this._roomMembers.get(room)?.size || 0;

      // Notify remaining room members
      client.to(room).emit(WSEvent.ROOM_MEMBER_LEFT, {
        userId,
        room,
        namespace,
        user: client.data?.user,
        memberCount,
        timestamp: this._dateTime.timestamp,
      });

      // Confirm to client
      client.emit(WSEvent.ROOM_LEFT, {
        room,
        namespace,
        memberCount,
        timestamp: this._dateTime.timestamp,
      });

      this._logger.info('User left room', {
        data: { userId, room, namespace, memberCount },
      });

      return { success: true, room, memberCount };
    } catch (error) {
      this._logger.error('Error leaving room', {
        error,
        data: {
          userId,
          room: data.room,
          namespace: data.namespace ?? WSNamespace.DEFAULT,
        },
      });
      throw new WSError(
        'Failed to leave room',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @SubscribeMessage(WSEvent.BROADCAST_ROOM)
  @UsePipes(new ValidationPipe(wsValidationPipeOptions))
  public handleBroadcastRoom(
    @ConnectedSocket() client: TCustomSocket,
    @ConnectedSocketUser('userId') userId: number,
    @MessageBody() data: BroadcastRoomDto
  ): TSocketRoomBroadcastResult {
    try {
      const {
        room,
        event,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: payload,
        excludeSelf,
        namespace = WSNamespace.DEFAULT,
      } = data;

      const broadcast = excludeSelf ? client.to(room) : this.server.to(room);

      broadcast.emit(event, {
        from: userId,
        room,
        namespace,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: payload,
        timestamp: this._dateTime.timestamp,
      });

      this._logger.info('Room broadcast sent', {
        data: { from: userId, room, namespace, event, excludeSelf },
      });

      return { success: true, room, event };
    } catch (error) {
      this._logger.error('Error broadcasting to room', {
        error,
        data: {
          from: userId,
          room: data.room,
          event: data.event,
          excludeSelf: data.excludeSelf,
          namespace: data?.namespace ?? WSNamespace.DEFAULT,
        },
      });
      throw new WSError(
        'Failed to broadcast to room',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @SubscribeMessage(WSEvent.BROADCAST_USER)
  @UsePipes(new ValidationPipe(wsValidationPipeOptions))
  public handleBroadcastUser(
    @ConnectedSocketUser('userId') fromUserId: number,
    @MessageBody() data: BroadcastUserDto
  ): TSocketUserBroadcastResult {
    try {
      const {
        targetUserId,
        event,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: payload,
        namespace = WSNamespace.DEFAULT,
      } = data;

      this.server.to(`user:${targetUserId}`).emit(event, {
        from: fromUserId,
        namespace,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: payload,
        timestamp: this._dateTime.timestamp,
      });

      this._logger.info('Direct message sent', {
        data: { from: fromUserId, namespace, to: targetUserId, event },
      });

      return { success: true, targetUserId, event };
    } catch (error) {
      this._logger.error('Error sending direct message', {
        error,
        data: {
          from: fromUserId,
          to: data.targetUserId,
          namespace: data.namespace ?? WSNamespace.DEFAULT,
        },
      });
      throw new WSError(
        'Failed to send direct message',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @SubscribeMessage(WSEvent.PING)
  @UsePipes(new ValidationPipe(wsValidationPipeOptions))
  public handlePing(
    @ConnectedSocket() client: TCustomSocket,
    @MessageBody() data: PingDto
  ): TSocketPongResult {
    const connectionInfo = this._connectionStore.get(client.id);
    if (connectionInfo) {
      connectionInfo.lastActivity = this._dateTime.toUTC(
        this._dateTime.timestamp
      );
    }

    const now = this._dateTime.timestamp;
    const latency = data.timestamp ? now - data.timestamp : null;

    client.emit(WSEvent.PONG, {
      timestamp: now,
      latency,
      message: data.message || 'pong',
      serverTime: this._dateTime.toUTC(this._dateTime.timestamp),
    });

    return { success: true, latency };
  }

  @SubscribeMessage(WSEvent.SERVER_STATS)
  public handleGetServerStats(): TSocketServerStats {
    return this.getServerStats();
  }

  // ==========================================
  // PUBLIC UTILITY METHODS
  // ==========================================

  /**
   * Broadcast message to all connected clients
   * @param event - Event name
   * @param data - Event data
   * @returns {void}
   */
  public broadcastToAll<T = any>(event: WSEvent, data: T): void {
    this.server.emit(event, {
      ...data,
      timestamp: this._dateTime.timestamp,
    });

    this._logger.info('Message broadcasted to all clients', {
      data: { event, recipientCount: this._connectionStore.size },
    });
  }

  /**
   * Send message to specific user across all their connections
   * @param userId - Target user ID
   * @param event - Event name
   * @param data - Event data
   * @returns {void}
   */
  public sendToUser<T = any>(userId: number, event: WSEvent, data: T): void {
    this.server.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: this._dateTime.timestamp,
    });

    const userConnections = this._userConnections.get(userId)?.size || 0;
    this._logger.info('Message sent to user', {
      data: { userId, event, connectionCount: userConnections },
    });
  }

  /**
   * Send message to room
   * @param room - Room name
   * @param event - Event name
   * @param data - Event data
   * @returns {void}
   */
  public sendToRoom<T = any>(room: string, event: WSEvent, data: T): void {
    this.server.to(room).emit(event, {
      ...data,
      timestamp: this._dateTime.timestamp,
    });

    const roomSize = this._roomMembers.get(room)?.size || 0;
    this._logger.info('Message sent to room', {
      data: { room, event, memberCount: roomSize },
    });
  }

  /**
   * Get comprehensive server statistics
   * @returns {TSocketServerStats} Socket server statistics
   */
  public getServerStats(): TSocketServerStats {
    const namespaceStats: Record<string, number> = {};

    // Count connections per namespace
    for (const [, connectionInfo] of this._connectionStore) {
      const ns = connectionInfo.namespace;
      namespaceStats[ns] = (namespaceStats[ns] || 0) + 1;
    }

    return {
      connectedClients: this._connectionStore.size,
      totalNamespaces: Object.keys(namespaceStats).length,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: this._dateTime.timestamp,
      namespaceStats,
    };
  }

  /**
   * Get room information
   * @param room - Room name
   * @returns {TSocketRoomInfo | null} Room information or null if room does not exist
   */
  public getRoomInfo(room: string): TSocketRoomInfo | null {
    const members = this._roomMembers.get(room);
    if (!members) return null;

    return {
      room,
      namespace: WSNamespace.DEFAULT,
      memberCount: members.size,
      members: Array.from(members),
    };
  }

  /**
   * Get user connection information
   * @param userId - User ID
   * @returns {TSocketConnectionInfo[]} Array of connection information
   */
  public getUserConnections(userId: number): TSocketConnectionInfo[] {
    const socketIds = this._userConnections.get(userId);
    if (!socketIds) return [];

    return Array.from(socketIds)
      .map((id) => this._connectionStore.get(id))
      .filter(Boolean) as TSocketConnectionInfo[];
  }

  /**
   * Disconnect user from all sessions
   * @param userId - User ID
   * @param reason - Reason for disconnection
   * @returns {Promise<void>}
   */
  public disconnectUser(userId: number, reason?: string): void {
    const socketIds = this._userConnections.get(userId);
    if (!socketIds) return;

    for (const socketId of socketIds) {
      const socket = this.server.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit(WSEvent.ERROR, {
          message: reason || 'Disconnected by server',
          code: WS_ERROR_CODE.SERVER_DISCONNECT,
          timestamp: this._dateTime.timestamp,
        });
        socket.disconnect(true);
      }
    }

    this._logger.info('User disconnected by server', {
      data: { userId, reason, connectionCount: socketIds.size },
    });
  }

  /**
   * Check if user is online
   * @param userId - User ID to check
   * @returns Boolean indicating if user is online
   */
  public async isUserOnline(userId: number): Promise<boolean> {
    const sockets = await this._redisService.getUserSockets(userId);
    return sockets.length > 0;
  }

  /**
   * Get online users count
   * @returns Number of online users
   */
  public getOnlineUsersCount(): number {
    // This would need to be implemented based on your user tracking strategy
    return this.getServerStats().connectedClients;
  }

  // ==========================================
  // PRIVATE HELPER METHODS
  // ==========================================

  /**
   * Setup Redis adapter with proper error handling and connection verification
   * @param namespace - Socket namespace instance
   * @returns {Promise<void>}
   */
  private async _setupRedisAdapter(namespace: Namespace): Promise<void> {
    try {
      this._logger.info('Setting up Websocket Redis adapter...');

      const pubClient = this._redisService.getClient();

      // Verify primary Redis connection
      await pubClient.ping();
      this._logger.info('Primary Websocket Redis client verified');

      // Create and verify subscriber client
      const subClient = pubClient.duplicate();
      await subClient.ping();
      this._logger.info('Subscriber Websocket Redis client verified');

      // Create and apply Redis adapter
      const redisAdapter = createAdapter(pubClient, subClient);
      namespace.server.adapter(redisAdapter);

      this._logger.log('✅ Websocket Redis adapter successfully configured');
    } catch (error) {
      this._logger.error('❌ Redis adapter setup failed:', { error });
      this._logger.warn('Continuing with default memory adapter');
      // Don't throw - allow fallback to memory adapter
    }
  }

  /**
   * Enforce connection limits per user
   * @param userId - User ID
   * @param client - Client socket
   * @returns {void}
   */
  private _enforceConnectionLimits(
    userId: number,
    client: TCustomSocket
  ): void {
    const existingConnections = this._userConnections.get(userId)?.size || 0;

    if (existingConnections >= this._MAX_CONNECTIONS_PER_USER) {
      this._logger.warn(`Connection limit exceeded for user ${userId}`, {
        data: {
          userId,
          currentConnections: existingConnections,
          limit: this._MAX_CONNECTIONS_PER_USER,
        },
      });

      client.emit(WSEvent.ERROR, {
        message: 'Connection limit exceeded',
        code: WS_ERROR_CODE.CONNECTION_LIMIT_EXCEEDED,
        maxConnections: this._MAX_CONNECTIONS_PER_USER,
      });

      throw new WSError('Connection limit exceeded');
    }
  }

  /**
   * Add user connection
   * @param userId - User ID
   * @param socketId - Socket ID
   * @returns {void}
   */
  private _addUserConnection(userId: number, socketId: string): void {
    if (!this._userConnections.has(userId)) {
      this._userConnections.set(userId, new Set());
    }
    this._userConnections.get(userId)!.add(socketId);
  }

  /**
   * Remove user connection
   * @param userId - User ID
   * @param socketId - Socket ID
   * @returns {void}
   */
  private _removeUserConnection(userId: number, socketId: string): void {
    const connections = this._userConnections.get(userId);
    if (connections) {
      connections.delete(socketId);
      if (connections.size === 0) {
        this._userConnections.delete(userId);
      }
    }
  }

  /**
   * Setup client event handlers
   * @param client - Client socket
   * @returns {void}
   */
  private _setupClientEventHandlers(client: TCustomSocket): void {
    // Handle client errors
    client.on('error', (error) => {
      this._logger.error('Client socket error', {
        error,
        data: { socketId: client.id, userId: client.data?.user?.userId },
      });
    });

    // Update activity on any message
    client.onAny(() => {
      const connectionInfo = this._connectionStore.get(client.id);
      if (connectionInfo) {
        connectionInfo.lastActivity = this._dateTime.toUTC(
          this._dateTime.timestamp
        );
      }
    });
  }

  /**
   * Broadcast user status
   * @param userId - User ID
   * @param status - User status
   * @param options - Broadcast options
   * @returns {void}
   */
  private _broadcastUserStatus(
    userId: number,
    status: 'online' | 'offline',
    options?: { exclude?: string }
  ): void {
    const event = WSEvent.USER_STATUS;
    const data = {
      userId,
      status,
      timestamp: this._dateTime.timestamp,
    };

    if (options?.exclude) {
      this.server.except(options.exclude).emit(event, data);
    } else {
      this.server.emit(event, data);
    }
  }

  /**
   * Validate room name
   * @param room - Room name
   * @returns {boolean} True if room name is valid
   */
  private _isValidRoomName(room: string): boolean {
    // Room name validation - customize as needed
    const validPattern = /^[a-zA-Z0-9_:-]{1,50}$/;
    return validPattern.test(room) && !room.startsWith('user:');
  }

  /**
   * Start heartbeat monitoring
   * @returns {void}
   */
  private _startHeartbeatMonitoring(): void {
    this._heartbeatTimer = setInterval(() => {
      const now = this._dateTime.timestamp;
      const staleConnections: string[] = [];

      for (const [socketId, connectionInfo] of this._connectionStore) {
        const timeSinceActivity = now - connectionInfo.lastActivity.getTime();

        if (timeSinceActivity > this._HEARTBEAT_INTERVAL * 3) {
          staleConnections.push(socketId);
        }
      }

      // Clean up stale connections
      for (const socketId of staleConnections) {
        const socket = this.server.sockets.sockets.get(socketId);
        if (socket) {
          this._logger.warn(`Disconnecting stale connection: ${socketId}`);
          socket.disconnect(true);
        }
      }
    }, this._HEARTBEAT_INTERVAL);
  }
}
