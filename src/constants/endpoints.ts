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
      Refresh: '/refresh',
      Logout: '/logout',
    },
    Get: {
      Self: '/self',
    },
  },
  Permission: {
    Base: 'permissions',
    Get: {
      PermissionList: '/',
      PermissionGroupList: '/groups',
      UserPermissions: '/users/:userId',
    },
    Post: {
      AssignPermissionsToUser: '/users/assign',
    },
    Delete: {
      RevokePermissionFromUser: '/users/:userId/:permissionId',
    },
  },
  User: {
    Base: 'users',
    Post: {
      CreateUser: '/',
    },
    Put: {
      UpdateUser: '/:userId',
    },
    Delete: {
      DeleteUser: '/:userId',
    },
    Get: {
      UserList: '/',
      SingleUser: '/:userId',
    },
  },
  Storage: {
    Base: '/files',
    Get: {
      GenerateUploadUrl: '/generate-upload-url',
    },
    Delete: {
      DeleteFile: '/:file-path',
    },
    Update: {
      ConfirmUpload: '/:file-path/confirm-upload',
    },
  },
  Course: {
    Base: '/courses',
    Post: {
      CreateCourse: '/',
      EnrollInCourse: '/:id/enroll',
    },
    Get: {
      CourseList: '/',
      CourseById: '/:id',
    },
    Put: {
      UpdateCourse: '/:id',
    },
    Delete: {
      DeleteCourse: '/:id',
    },
  },
  SubscriptionTier: {
    Base: '/subscription-tier',
    Post: {
      CreateSubscriptionTier: '/',
    },
    Put: {
      UpdateSubscriptionTier: '/:id',
    },
    Delete: {
      DeleteSubscriptionTier: '/:id',
    },
    Get: {
      SubscriptionTierList: '/',
    },
  },
} as const;
