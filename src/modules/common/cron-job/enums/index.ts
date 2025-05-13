export enum CronJobStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
}

/**
 * Enum containing commonly used cron job expressions
 */
export enum CronJobExpression {
  EVERY_SECOND = '* * * * * *',
  EVERY_MINUTE = '0 * * * * *',
  EVERY_HOUR = '0 0 * * * *',
  EVERY_DAY_MIDNIGHT = '0 0 0 * * *',
  DAILY_NOON = '0 0 12 * * *',
  WEEKLY_MONDAY = '0 0 0 * * 1',
  WEEKLY_SUNDAY = '0 0 0 * * 0',
  MONTHLY_FIRST_DAY = '0 0 0 1 * *',
  MONTHLY_LAST_DAY = '59 23 L * *',
  QUARTERLY = '0 0 0 1 1,4,7,10 *',
  YEARLY = '0 0 0 1 1 *',
  EVERY_5_MINUTES = '0 */5 * * * *',
  EVERY_15_MINUTES = '0 */15 * * * *',
  EVERY_30_MINUTES = '0 */30 * * * *',
  EVERY_HOUR_AT_30 = '0 30 * * * *',
  WORKDAY_9AM = '0 0 9 * * 1-5',
  WORKDAY_5PM = '0 0 17 * * 1-5',
}
