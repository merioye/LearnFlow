import { Socket } from 'socket.io';

import { TAuthRequestUser } from '../../auth';
import { WSNamespace } from '../enums';

export type TSocketConnectionInfo = {
  socketId: string;
  userId: number;
  userAgent?: string;
  ipAddress?: string;
  namespace: WSNamespace;
  connectedAt: Date;
  lastActivity: Date;
};

export type TSocketConnectionData = {
  userId: number;
  userAgent?: string;
  ipAddress?: string;
  namespace: WSNamespace;
  connectedAt: Date;
};

export type TSocketRoomInfo = {
  room: string;
  namespace: WSNamespace;
  memberCount: number;
  members: string[];
};

export type TCustomSocket = Socket<
  any, // ListenEvents
  any, // EmitEvents
  any, // ServerSideEvents
  {
    user: TAuthRequestUser;
    isAuthenticated?: boolean;
    metadata?: Record<string, any>;
  } // SocketData
>;

export type TSocketServerStats = {
  connectedClients: number;
  totalNamespaces: number;
  uptime: number;
  memory: NodeJS.MemoryUsage;
  timestamp: number;
  namespaceStats: Record<string, number>;
};

// ############################################# Socket Message handler Responses ##############################################
export type TSocketJoinRoomResult = {
  success: boolean;
  room: string;
  memberCount: number;
};

export type TSocketLeaveRoomResult = {
  success: boolean;
  room: string;
  memberCount: number;
};

export type TSocketRoomBroadcastResult = {
  success: boolean;
  room: string;
  event: string;
};

export type TSocketUserBroadcastResult = {
  success: boolean;
  targetUserId: number;
  event: string;
};

export type TSocketDirectMessageResult = {
  sent: boolean;
  targetUserId: number;
  messageId?: string;
};

export type TSocketPongResult = {
  success: boolean;
  latency: number | null;
};
