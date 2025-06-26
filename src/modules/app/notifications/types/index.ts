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
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    };
    /** Default from address */
    defaultFrom: string;
    /** Email-specific default options */
    defaultOptions?: TNotificationOptions;
  };

  /** SMS provider configuration */
  sms?: {
    /** Twilio account credentials */
    accountSid: string;
    authToken: string;
    /** Default from phone number */
    defaultFrom: string;
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

/**
 * Result object returned by nodemailer's sendMail method
 * Contains information about the email sending operation including delivery status and metadata
 */
export type TEmailSendResult = {
  /**
   * Unique identifier for the sent message
   * Can be used for tracking and logging purposes
   * @example "1234567890abcdef@example.com"
   */
  messageId: string;
  /**
   * Envelope information containing sender and recipient details
   * Used by the SMTP transport for actual delivery
   */
  envelope: {
    from: string;
    to: string[];
  };
  /**
   * Array of email addresses that were accepted by the SMTP server
   * These recipients should receive the email successfully
   */
  accepted: string[];
  /**
   * Array of email addresses that were rejected by the SMTP server
   * These recipients will not receive the email due to server-side issues
   */
  rejected: string[];
  /**
   * Array of email addresses that are pending delivery
   * These may be retried later by the SMTP server
   */
  pending: string[];
  /**
   * Raw response string from the SMTP server
   * Contains status codes and server messages
   * @example "250 2.0.0 OK 1234567890 - gsmtp"
   */
  response: string;
  /**
   * Time taken to send the message in milliseconds
   * Only available with some SMTP transports
   * @optional
   */
  messageTime?: number;
  /**
   * Size of the sent message in bytes
   * Only available with some SMTP transports
   * @optional
   */
  messageSize?: number;
};
