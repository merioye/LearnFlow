import { Config } from '@/enums';

import { NotificationPriority } from '../enums';
import { TNotificationModuleConfig } from '../types';

export const notificationsModuleConfig: TNotificationModuleConfig = {
  defaultOptions: {
    retry: true,
    maxRetries: 3,
    retryDelay: 1000,
    priority: NotificationPriority.LOW,
  },
  email: {
    transport: {
      host: process.env[Config.SMTP_HOST]!,
      port: parseInt(process.env[Config.SMTP_PORT]!),
      secure: process.env[Config.SMTP_SECURE] == 'true',
      auth: {
        user: process.env[Config.SMTP_USER]!,
        pass: process.env[Config.SMTP_PASSWORD]!,
      },
    },
    defaultFrom: process.env[Config.SMTP_FROM]!,
    defaultOptions: {
      retry: true,
      maxRetries: 3,
    },
  },
  sms: {
    accountSid: process.env[Config.TWILIO_ACCOUNT_SID]!,
    authToken: process.env[Config.TWILIO_AUTH_TOKEN]!,
    defaultFrom: process.env[Config.TWILIO_PHONE_NUMBER]!,
    defaultOptions: {
      retry: true,
      maxRetries: 2,
    },
  },
  push: {
    firebaseCredentials: {
      projectId: process.env[Config.FIREBASE_PROJECT_ID]!,
      clientEmail: process.env[Config.FIREBASE_CLIENT_EMAIL]!,
      privateKey:
        process.env[Config.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')]!,
    },
    defaultOptions: {
      retry: true,
      maxRetries: 2,
    },
  },
  portal: {},
};
