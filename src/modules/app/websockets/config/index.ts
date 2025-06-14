import { Config } from '@/enums';

import { WSNamespace } from '../enums';

export const wsGatewayConfig = {
  // Specifies the WebSocket namespace/path for client connections
  namespace: WSNamespace.DEFAULT,
  cors: {
    // Allowed origins for cross-origin requests (from environment variable)
    origin: process.env[Config.ALLOWED_ORIGINS]?.split(',') || false,
    // HTTP methods allowed for CORS preflight requests
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    // Allow cookies and authentication headers in cross-origin requests
    credentials: true,
  },
  // Transport protocols supported (WebSocket and long-polling fallback)
  transports: ['websocket', 'polling'],
  // Allow Engine.IO v3 clients to connect (backward compatibility)
  allowEIO3: true,
  // Time to wait for pong response before disconnecting client (ms)
  pingTimeout: 60000,
  // Interval between ping frames sent to clients (ms)
  pingInterval: 25000,
  // Maximum time to wait for initial connection handshake (ms)
  connectTimeout: 45000,
  // Performance optimizations
  // Don't serve the Socket.IO client files (reduces bundle size)
  serveClient: false,
  // Allow transport upgrades (polling to WebSocket)
  allowUpgrades: true,
  // Maximum time to wait for transport upgrade (ms)
  upgradeTimeout: 10000,
  // Per-message compression settings
  perMessageDeflate: {
    // Only compress messages larger than 1KB
    threshold: 1024,
  },
  // Maximum size of HTTP request body (1MB)
  maxHttpBufferSize: '1e6',
  // HTTP response compression settings
  httpCompression: {
    // Only compress responses larger than 1KB
    threshold: 1024,
  },
};
