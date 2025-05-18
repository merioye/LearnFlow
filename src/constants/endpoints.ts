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
    Post: {
      Login: '/auth/login',
    },
  },
} as const;

export const PUBLIC_ENDPOINTS = [ENDPOINTS.Auth.Post.Login] as const;
