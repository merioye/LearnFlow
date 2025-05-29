export const ENDPOINTS = {
  Health: {
    Base: 'health',
    Get: {
      HealthCheck: '/healthcheck',
      Ping: '/ping',
    },
  },
  Csrf: {
    Base: 'csrf',
    Get: {
      Token: '/token',
    },
  },
  Metrics: {
    Base: 'metrics',
  },
  Auth: {
    Base: 'auth',
    Post: {
      Login: '/login',
    },
  },
} as const;
