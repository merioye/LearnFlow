import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
import { WebhookLogEntity } from '@/database';
import { BaseTypeOrmService } from '@/database/services';

import { PaymentMethod, WebhookStatus } from '../enums';

/**
 * Service class for managing webhook logs
 * @class WebhookLogsService
 * @extends BaseTypeOrmService<WebhookLogEntity>
 */
@Injectable()
export class WebhookLogsService extends BaseTypeOrmService<WebhookLogEntity> {
  public constructor(
    @InjectDateTime() dateTime: IDateTime,
    @InjectDataSource() dataSource: DataSource
  ) {
    super(dateTime, dataSource, WebhookLogEntity, {
      softDelete: false,
    });
  }

  /**
   * Helper method to check if webhook is in final state
   * @param webhookLog - The webhook log to check
   * @returns true if the webhook is in a final state
   */
  public isInFinalState(webhookLog: WebhookLogEntity): boolean {
    return (
      [WebhookStatus.PROCESSED, WebhookStatus.IGNORED].includes(
        webhookLog.status
      ) || webhookLog.attempts >= webhookLog.maxAttempts
    );
  }

  /**
   * Helper method to check if webhook can be retried
   * @param webhookLog - The webhook log to check
   * @returns true if the webhook can be retried
   */
  public canRetry(webhookLog: WebhookLogEntity): boolean {
    return (
      webhookLog.status === WebhookStatus.FAILED &&
      webhookLog.attempts < webhookLog.maxAttempts &&
      !webhookLog.ignored
    );
  }

  /**
   * Helper method to mark webhook as processed
   * @param webhookLog - The webhook log to mark as processed
   * @param processingDuration - The processing duration in milliseconds
   * @returns {void}
   */
  public markAsProcessed(
    webhookLog: WebhookLogEntity,
    processingDurationMs?: number
  ): void {
    webhookLog.status = WebhookStatus.PROCESSED;
    webhookLog.processed = true;
    webhookLog.processingCompletedAt = this.dateTime.toUTC(this.dateTime.now());
    if (processingDurationMs) {
      webhookLog.processingDurationMs = processingDurationMs;
    }
  }

  /**
   * Helper method to mark webhook as failed
   * @param webhookLog - The webhook log to mark as failed
   * @param error - The error message
   * @param errorStack - The error stack
   * @returns {void}
   */
  public markAsFailed(
    webhookLog: WebhookLogEntity,
    error: string,
    errorStack?: string
  ): void {
    if (!error) {
      throw new Error('Error message is required');
    }

    webhookLog.status = WebhookStatus.FAILED;
    webhookLog.lastError = error;
    webhookLog.lastErrorStack = errorStack ?? null;
    webhookLog.lastAttemptAt = this.dateTime.toUTC(this.dateTime.now());
    webhookLog.attempts += 1;

    // Calculate next retry time with exponential backoff
    if (this.canRetry(webhookLog)) {
      const backoffMinutes = Math.pow(2, webhookLog.attempts - 1) * 5; // 5, 10, 20 minutes
      webhookLog.nextRetryAt = this.dateTime.toUTC(
        this.dateTime.timestamp + backoffMinutes * 60 * 1000
      );
    }
  }

  /**
   * Helper method to mark webhook as ignored
   * @param webhookLog - The webhook log to mark as ignored
   * @param reason - The reason for ignoring the webhook
   * @returns {void}
   */
  public markAsIgnored(webhookLog: WebhookLogEntity, reason: string): void {
    webhookLog.status = WebhookStatus.IGNORED;
    webhookLog.ignored = true;
    webhookLog.ignoredReason = reason;
  }

  /**
   * Helper method to start processing
   * @param webhookLog - The webhook log to start processing
   * @returns {void}
   */
  public startProcessing(webhookLog: WebhookLogEntity): void {
    webhookLog.status = WebhookStatus.PROCESSING;
    webhookLog.processingStartedAt = this.dateTime.toUTC(this.dateTime.now());
    webhookLog.attempts += 1;
    webhookLog.lastAttemptAt = this.dateTime.toUTC(this.dateTime.now());
  }

  /**
   * Helper method to get processing summary
   * @param webhookLog - The webhook log to get the processing summary for
   * @returns {Object} - The processing summary
   */
  public getProcessingSummary(webhookLog: WebhookLogEntity): {
    id: number;
    provider: PaymentMethod;
    eventType: string;
    status: WebhookStatus;
    attempts: number;
    processed: boolean;
    duration: number | null;
    error: string | null;
  } {
    return {
      id: webhookLog.id,
      provider: webhookLog.provider,
      eventType: webhookLog.eventType,
      status: webhookLog.status,
      attempts: webhookLog.attempts,
      processed: webhookLog.processed,
      duration: webhookLog.processingDurationMs,
      error: webhookLog.lastError,
    };
  }
}
