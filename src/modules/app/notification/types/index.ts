import { NotificationMedium, NotificationPriority } from '../enums';

/**
 * Base type for notification options
 */
export type TNotificationOptions = {
  /** Unique identifier for tracking the notification */
  id?: string;
  /** Notification priority level */
  priority?: NotificationPriority;
  /** Whether to retry sending notification on failure */
  retry?: boolean;
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Delay between retry attempts in milliseconds */
  retryDelay?: number;
};

/**
 * Type for notification recipient
 */
export type TNotificationRecipient = {
  /** Recipient's email address */
  email?: string;
  /** Recipient's phone number */
  phoneNumber?: string;
  /** Recipient's device token for push notifications */
  deviceToken?: string;
  /** Recipient's user ID for portal notifications */
  userId?: number;
  /** Additional recipient metadata */
  metadata?: Record<string, any>;
};

/**
 * Type for notification content
 */
export type TNotificationContent = {
  /** Notification subject/title */
  subject: string;
  /** Main notification message body */
  body: string;
  /** Optional HTML content for email notifications */
  html?: string;
  /** Optional data payload for push notifications */
  data?: Record<string, any>;
  /** Optional attachments for email notifications */
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
};

/**
 * Type for notification request
 */
export type TNotificationRequest = {
  /** Recipients of the notification */
  recipients: TNotificationRecipient | TNotificationRecipient[];
  /** Notification content */
  content: TNotificationContent;
  /** Notification medium */
  medium?: NotificationMedium;
  /** Notification options */
  options?: TNotificationOptions;
};

/**
 * Type for notification result
 */
export type TNotificationResult = {
  /** Success status of the notification */
  success: boolean;
  /** Notification ID (may be generated or provided) */
  id: string;
  /** Error message if notification failed */
  error?: string;
  /** Timestamp when notification was sent */
  timestamp: Date;
  /** Provider-specific response details */
  providerResponse?: any;
  /** Medium used to send the notification */
  medium: NotificationMedium;
  /** Number of retry attempts made (if any) */
  retryAttempts?: number;
};

/**
 * Type for notification module config
 */
export type TNotificationModuleConfig = {
  /** Global default options for all notifications */
  defaultOptions?: TNotificationOptions;

  /** Email provider configuration */
  email?: {
    /** SMTP transport options */
    transport: {
      host: string;
      port: number;
      secure?: boolean;
      auth?: {
        user: string;
        pass: string;
      };
    };
    /** Default from address */
    defaultFrom?: string;
    /** Email-specific default options */
    defaultOptions?: TNotificationOptions;
  };

  /** SMS provider configuration */
  sms?: {
    /** Twilio account credentials */
    accountSid: string;
    authToken: string;
    /** Default from phone number */
    defaultFrom?: string;
    /** SMS-specific default options */
    defaultOptions?: TNotificationOptions;
  };

  /** Push notification provider configuration */
  push?: {
    /** Firebase configuration */
    firebaseCredentials: {
      projectId: string;
      clientEmail: string;
      privateKey: string;
    };
    /** Push-specific default options */
    defaultOptions?: TNotificationOptions;
  };

  /** Portal notification configuration */
  portal?: {
    /** Portal-specific default options */
    defaultOptions?: TNotificationOptions;
  };
};
