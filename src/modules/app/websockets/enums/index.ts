export enum WSEvent {
  // Connection events
  CONNECTION_SUCCESS = 'connection:success',
  CONNECTION_ERROR = 'connection:error',
  RECONNECTION_SUCCESS = 'reconnection:success',

  // Generic room events
  JOIN_ROOM = 'room:join',
  LEAVE_ROOM = 'room:leave',
  ROOM_JOINED = 'room:joined',
  ROOM_LEFT = 'room:left',
  ROOM_MEMBER_JOINED = 'room:member_joined',
  ROOM_MEMBER_LEFT = 'room:member_left',
  PORTAL_NOTIFICATION = 'portal:notification',

  // Utility events
  PING = 'ping',
  PONG = 'pong',
  SERVER_STATS = 'server:stats',
  USER_STATUS = 'user:status',

  // Broadcast events
  BROADCAST_ALL = 'broadcast:all',
  BROADCAST_ROOM = 'broadcast:room',
  BROADCAST_USER = 'broadcast:user',

  // Error events
  ERROR = 'error',
  UNAUTHORIZED = 'unauthorized',
  RATE_LIMITED = 'rate_limited',
}

export enum WSRoom {}

export enum WSNamespace {
  DEFAULT = '/',
  CHAT = '/chat',
  NOTIFICATIONS = '/notifications',
  ADMIN = '/admin',
}

export enum WS_ERROR_CODE {
  CONNECTION_SETUP_ERROR = 'CONNECTION_SETUP_ERROR',
  SERVER_DISCONNECT = 'SERVER_DISCONNECT',
  CONNECTION_LIMIT_EXCEEDED = 'CONNECTION_LIMIT_EXCEEDED',
  EXCEPTION_FILTER_ERROR = 'EXCEPTION_FILTER_ERROR',
}
