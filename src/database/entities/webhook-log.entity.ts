import { Column, Entity, Index, ManyToOne } from 'typeorm';

import {
  PaymentEvent,
  PaymentMethod,
  WebhookStatus,
} from '@/modules/app/payments';

import { BaseEntity } from './base';
import { PaymentEntity } from './payment.entity';

/**
 * Tracks all webhook events received from payment providers
 * Essential for debugging, auditing, and ensuring event processing reliability
 */
@Entity('tbl_webhook_logs')
@Index(['provider', 'eventType', 'createdAt'])
@Index(['status', 'createdAt'])
@Index(['providerEventId', 'provider'], { unique: true })
@Index(['paymentId', 'eventType'])
export class WebhookLogEntity extends BaseEntity {
  @Column({
    type: 'varchar',
    comment: 'Payment provider that sent the webhook',
  })
  provider: PaymentMethod;

  @Column({
    name: 'provider_event_id',
    comment: 'Unique event ID from the payment provider',
  })
  providerEventId: string;

  @Column({
    name: 'event_type',
    type: 'varchar',
    comment:
      'Type of webhook event (e.g., payment.succeeded, subscription.updated)',
  })
  eventType: PaymentEvent;

  @Column({
    type: 'varchar',
    default: WebhookStatus.PENDING,
    comment: 'Current processing status of the webhook',
  })
  status: WebhookStatus;

  @Column({
    type: 'jsonb',
    comment: 'Raw webhook payload as received from provider',
  })
  payload: Record<string, any>;

  @Column({
    type: 'jsonb',
    comment: 'HTTP headers from the webhook request',
  })
  headers: Record<string, string>;

  @Column({
    type: 'text',
    comment: 'Webhook signature for verification',
  })
  signature: string;

  @Column({
    name: 'signature_verified',
    default: false,
    comment: 'Whether the webhook signature was verified successfully',
  })
  signatureVerified: boolean;

  @Column({
    type: 'int',
    name: 'payment_id',
    nullable: true,
    comment: 'Associated payment ID if applicable',
  })
  paymentId: number | null;

  @ManyToOne(() => PaymentEntity, (payment) => payment.webhookLogs, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  payment: PaymentEntity | null;

  @Column({
    default: 0,
    comment: 'Number of processing attempts',
  })
  attempts: number;

  @Column({
    name: 'max_attempts',
    default: 3,
    comment: 'Maximum number of retry attempts allowed',
  })
  maxAttempts: number;

  @Column({
    name: 'last_attempt_at',
    type: 'timestamp',
    nullable: true,
    comment: 'Timestamp of the last processing attempt',
  })
  lastAttemptAt: Date | null;

  @Column({
    name: 'next_retry_at',
    type: 'timestamp',
    nullable: true,
    comment: 'Timestamp for the next retry attempt',
  })
  nextRetryAt: Date | null;

  @Column({
    name: 'last_error',
    type: 'text',
    nullable: true,
    comment: 'Error message from the last failed processing attempt',
  })
  lastError: string | null;

  @Column({
    name: 'last_error_stack',
    type: 'text',
    nullable: true,
    comment: 'Stack trace from the last failed processing attempt',
  })
  lastErrorStack: string | null;

  @Column({
    type: 'int',
    name: 'processing_duration_ms',
    nullable: true,
    comment: 'Processing duration in milliseconds',
  })
  processingDurationMs: number | null;

  @Column({
    name: 'processing_started_at',
    type: 'timestamp',
    nullable: true,
    comment: 'Timestamp when processing started',
  })
  processingStartedAt: Date | null;

  @Column({
    name: 'processing_completed_at',
    type: 'timestamp',
    nullable: true,
    comment: 'Timestamp when processing completed',
  })
  processingCompletedAt: Date | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Additional metadata for the webhook processing',
  })
  metadata: Record<string, any> | null;

  @Column({
    name: 'source_ip',
    type: 'varchar',
    length: 45, // IPv6 compatible
    nullable: true,
    comment: 'IP address from which the webhook was received',
  })
  sourceIp: string | null;

  @Column({
    name: 'user_agent',
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'User agent from the webhook request',
  })
  userAgent: string | null;

  @Column({
    default: false,
    comment:
      'Whether this webhook event should be ignored (for duplicate or invalid events)',
  })
  ignored: boolean;

  @Column({
    type: 'text',
    name: 'ignored_reason',
    nullable: true,
    comment: 'Reason for ignoring the webhook event',
  })
  ignoredReason: string | null;

  @Column({
    default: false,
    comment: 'Whether this webhook event was processed successfully',
  })
  processed: boolean;

  @Column({
    name: 'provider_event_timestamp',
    type: 'timestamp',
    nullable: true,
    comment: 'Event timestamp from the payment provider',
  })
  providerEventTimestamp: Date | null;

  @Column({
    type: 'text',
    name: 'webhook_url',
    nullable: true,
    comment: 'Webhook endpoint URL that received the event',
  })
  webhookUrl: string | null;

  @Column({
    name: 'http_method',
    type: 'varchar',
    length: 10,
    default: 'POST',
    comment: 'HTTP method used for the webhook request',
  })
  httpMethod: string;

  @Column({
    type: 'int',
    name: 'response_status_code',
    nullable: true,
    comment: 'HTTP status code returned to the webhook sender',
  })
  responseStatusCode: number | null;

  @Column({
    name: 'response_body',
    type: 'text',
    nullable: true,
    comment: 'Response body returned to the webhook sender',
  })
  responseBody: string | null;
}
