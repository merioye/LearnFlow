export const ENDPOINTS = {
  Health: {
    Get: {
      HealthCheck: '/healthcheck',
      Ping: '/ping',
    },
  },
  Metrics: {
    Base: '/metrics',
  },
  Auth: {
    Base: '/auth',
    Post: {
      Login: '/login',
    },
  },
} as const;

export const PUBLIC_ENDPOINTS = [ENDPOINTS.Auth.Post.Login] as const;
