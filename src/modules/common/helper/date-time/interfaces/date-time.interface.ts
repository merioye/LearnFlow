import { DateRangeInclusion, DateTimeUnit } from '../enums';
import { TFormatLocalizedOptions } from '../types';

export interface IDateTime {
  /**
   * Current timestamp in milliseconds
   */
  readonly timestamp: number;

  /**
   * Current date time in ISO format
   */
  readonly isoString: string;

  /**
   * Get current date time
   */
  now(): Date;

  /**
   * Parse a date string/timestamp into a Date object
   * @param date - Date string, timestamp, or Date object
   * @param format - Optional format string for parsing date strings
   */
  parse(date: string | number | Date, format?: string): Date;

  /**
   * Format a date according to the specified format
   * @param date - Date to format
   * @param format - Format string
   */
  format(date: Date | string | number, format: string): string;

  /**
   * Add time to a date
   * @param date - Base date
   * @param amount - Amount to add
   * @param unit - Unit to add (years, months, days, etc.)
   */
  add(date: Date | string | number, amount: number, unit: DateTimeUnit): Date;

  /**
   * Subtract time from a date
   * @param date - Base date
   * @param amount - Amount to subtract
   * @param unit - Unit to subtract (years, months, days, etc.)
   */
  subtract(
    date: Date | string | number,
    amount: number,
    unit: DateTimeUnit
  ): Date;

  /**
   * Get difference between two dates
   * @param date1 - First date
   * @param date2 - Second date
   * @param unit - Unit of difference (default: milliseconds)
   */
  diff(
    date1: Date | string | number,
    date2: Date | string | number,
    unit?: DateTimeUnit
  ): number;

  /**
   * Check if a date is before another date
   * @param date1 - First date
   * @param date2 - Second date
   */
  isBefore(
    date1: Date | string | number,
    date2: Date | string | number
  ): boolean;

  /**
   * Check if a date is after another date
   * @param date1 - First date
   * @param date2 - Second date
   */
  isAfter(
    date1: Date | string | number,
    date2: Date | string | number
  ): boolean;

  /**
   * Check if a date is the same as another date (optionally checking only specific units)
   * @param date1 - First date
   * @param date2 - Second date
   * @param unit - Optional unit to compare (year, month, day, etc.)
   */
  isSame(
    date1: Date | string | number,
    date2: Date | string | number,
    unit?: DateTimeUnit
  ): boolean;

  /**
   * Check if a date is between two other dates
   * @param date - Date to check
   * @param startDate - Start of range
   * @param endDate - End of range
   * @param inclusivity - Include start/end in comparison (defaults to '[]', include both)
   */
  isBetween(
    date: Date | string | number,
    startDate: Date | string | number,
    endDate: Date | string | number,
    inclusivity?: DateRangeInclusion
  ): boolean;

  /**
   * Get start of time unit (e.g., start of day sets time to 00:00:00)
   * @param date - Date to get start of
   * @param unit - Unit (year, month, day, etc.)
   */
  startOf(date: Date | string | number, unit: DateTimeUnit): Date;

  /**
   * Get end of time unit (e.g., end of day sets time to 23:59:59.999)
   * @param date - Date to get end of
   * @param unit - Unit (year, month, day, etc.)
   */
  endOf(date: Date | string | number, unit: DateTimeUnit): Date;

  /**
   * Convert a date to UTC
   * @param date - Date to convert
   */
  toUTC(date: Date | string | number): Date;

  /**
   * Convert a date to a specific timezone
   * @param date - Date to convert
   * @param timezone - Target timezone (e.g., 'America/New_York')
   */
  toTimezone(date: Date | string | number, timezone: string): Date;

  /**
   * Get UTC offset for a date and timezone in minutes
   * @param date - Date to get offset for
   * @param timezone - Optional timezone (default: local)
   */
  getUtcOffset(date: Date | string | number, timezone?: string): number;

  /**
   * Check if a date is valid
   * @param date - Date to validate
   */
  isValid(date: Date | string | number): boolean;

  /**
   * Format a date for UI display according to a locale
   * @param date - Date to format
   * @param locale - Locale to use for formatting
   * @param options - Optional formatting options
   */
  formatLocalized(
    date: Date | string | number,
    locale: string,
    options?: Partial<TFormatLocalizedOptions>
  ): string;

  /**
   * Format a relative time (e.g., "2 hours ago", "in 3 days")
   * @param date - Target date
   * @param baseDate - Base date to calculate relative time from (default: now)
   * @param locale - Locale for formatting
   */
  formatRelative(
    date: Date | string | number,
    baseDate?: Date | string | number,
    locale?: string
  ): string;

  /**
   * Calculate business days between dates (excluding weekends and optionally holidays)
   * @param startDate - Start date
   * @param endDate - End date
   * @param holidays - Optional array of holiday dates to exclude
   */
  calculateBusinessDays(
    startDate: Date | string | number,
    endDate: Date | string | number,
    holidays?: Array<Date | string | number>
  ): number;

  /**
   * Add business days to a date (excluding weekends and optionally holidays)
   * @param date - Start date
   * @param days - Number of business days to add
   * @param holidays - Optional array of holiday dates to exclude
   */
  addBusinessDays(
    date: Date | string | number,
    days: number,
    holidays?: Array<Date | string | number>
  ): Date;

  /**
   * Check if a date is a business day
   * @param date - Date to check
   * @param holidays - Optional array of holiday dates
   */
  isBusinessDay(
    date: Date | string | number,
    holidays?: Array<Date | string | number>
  ): boolean;

  /**
   * Get timezone abbreviation (e.g., 'EST', 'PDT')
   * @param date - Date to get abbreviation for
   * @param timezone - Optional timezone (default: local)
   */
  getTimezoneAbbr(date: Date | string | number, timezone?: string): string;

  /**
   * Get quarter of the year (1-4)
   * @param date - Date to get quarter for
   */
  getQuarter(date: Date | string | number): number;

  /**
   * Check if year is a leap year
   * @param year - Year to check or date
   */
  isLeapYear(year: number | Date | string): boolean;

  /**
   * Get days in month
   * @param date - Date to get days in month for
   */
  getDaysInMonth(date: Date | string | number): number;

  /**
   * Get ISO week number of the year
   * @param date - Date to get week number for
   */
  getWeek(date: Date | string | number): number;

  /**
   * Format a duration between two dates
   * @param startDate - Start date
   * @param endDate - End date
   * @param format - Format for duration (e.g., 'HH:mm:ss')
   */
  formatDuration(
    startDate: Date | string | number,
    endDate: Date | string | number,
    format: string
  ): string;

  /**
   * Check if a date is a weekend (Saturday or Sunday)
   * @param date - Date to check
   */
  isWeekend(date: Date | string | number): boolean;

  /**
   * Get week day (0-6, starting from Sunday)
   * @param date - Date to get week day for
   */
  getWeekday(date: Date | string | number): number;
}
