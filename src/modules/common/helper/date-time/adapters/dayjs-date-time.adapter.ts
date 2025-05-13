import { Injectable } from '@nestjs/common';
import dayjs, { locale as dayjsLocale, extend, ManipulateType } from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import duration from 'dayjs/plugin/duration';
import isBetween from 'dayjs/plugin/isBetween';
import isLeapYear from 'dayjs/plugin/isLeapYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';

import { DateRangeInclusion, DateTimeUnit } from '../enums';
import { IDateTime } from '../interfaces';
import { TFormatLocalizedOptions } from '../types';

// Load plugins
extend(utc);
extend(timezone);
extend(isBetween);
extend(relativeTime);
extend(weekOfYear);
extend(quarterOfYear);
extend(duration);
extend(customParseFormat);
extend(advancedFormat);
extend(localizedFormat);
extend(isLeapYear);
extend(weekday);
extend(isoWeek);

@Injectable()
export class DayjsDateTimeAdapter implements IDateTime {
  // Helper to convert various input types to dayjs object
  private _toDayjs(date: Date | string | number): dayjs.Dayjs {
    return dayjs(date);
  }

  /**
   * @inheritdoc
   */
  public get timestamp(): number {
    return Date.now();
  }

  /**
   * @inheritdoc
   */
  public get isoString(): string {
    return new Date().toISOString();
  }

  /**
   * @inheritdoc
   */
  public now(): Date {
    return new Date();
  }

  /**
   * @inheritdoc
   */
  public parse(date: string | number | Date, format?: string): Date {
    return format ? dayjs(date, format).toDate() : dayjs(date).toDate();
  }

  /**
   * @inheritdoc
   */
  public format(date: Date | string | number, format: string): string {
    return this._toDayjs(date).format(format);
  }

  /**
   * @inheritdoc
   */
  public add(
    date: Date | string | number,
    amount: number,
    unit: DateTimeUnit
  ): Date {
    return this._toDayjs(date)
      .add(amount, unit as ManipulateType)
      .toDate();
  }

  /**
   * @inheritdoc
   */
  public subtract(
    date: Date | string | number,
    amount: number,
    unit: DateTimeUnit
  ): Date {
    return this._toDayjs(date)
      .subtract(amount, unit as ManipulateType)
      .toDate();
  }

  /**
   * @inheritdoc
   */
  public diff(
    date1: Date | string | number,
    date2: Date | string | number,
    unit?: DateTimeUnit
  ): number {
    return this._toDayjs(date1).diff(this._toDayjs(date2), unit);
  }

  /**
   * @inheritdoc
   */
  public isBefore(
    date1: Date | string | number,
    date2: Date | string | number
  ): boolean {
    return this._toDayjs(date1).isBefore(this._toDayjs(date2));
  }

  /**
   * @inheritdoc
   */
  public isAfter(
    date1: Date | string | number,
    date2: Date | string | number
  ): boolean {
    return this._toDayjs(date1).isAfter(this._toDayjs(date2));
  }

  /**
   * @inheritdoc
   */
  public isSame(
    date1: Date | string | number,
    date2: Date | string | number,
    unit?: DateTimeUnit
  ): boolean {
    return this._toDayjs(date1).isSame(
      this._toDayjs(date2),
      unit as ManipulateType
    );
  }

  /**
   * @inheritdoc
   */
  public isBetween(
    date: Date | string | number,
    startDate: Date | string | number,
    endDate: Date | string | number,
    inclusivity: DateRangeInclusion
  ): boolean {
    return this._toDayjs(date).isBetween(
      this._toDayjs(startDate),
      this._toDayjs(endDate),
      null,
      inclusivity
    );
  }

  /**
   * @inheritdoc
   */
  public startOf(date: Date | string | number, unit: DateTimeUnit): Date {
    return this._toDayjs(date).startOf(unit).toDate();
  }

  /**
   * @inheritdoc
   */
  public endOf(date: Date | string | number, unit: DateTimeUnit): Date {
    return this._toDayjs(date).endOf(unit).toDate();
  }

  /**
   * @inheritdoc
   */
  public toUTC(date: Date | string | number): Date {
    return this._toDayjs(date).utc().toDate();
  }

  /**
   * @inheritdoc
   */
  public toTimezone(date: Date | string | number, timezone: string): Date {
    return this._toDayjs(date).tz(timezone).toDate();
  }

  /**
   * @inheritdoc
   */
  public getUtcOffset(date: Date | string | number, timezone?: string): number {
    const dt = this._toDayjs(date);
    return timezone ? dt.tz(timezone).utcOffset() : dt.utcOffset();
  }

  /**
   * @inheritdoc
   */
  public isValid(date: Date | string | number): boolean {
    return this._toDayjs(date).isValid();
  }

  /**
   * @inheritdoc
   */
  public formatLocalized(
    date: Date | string | number,
    locale: string,
    options?: Partial<TFormatLocalizedOptions>
  ): string {
    // Use dayjs with locale
    const dt = this._toDayjs(date);
    // Set locale temporarily
    const oldLocale = dayjsLocale();
    dayjsLocale(locale);

    let formatStr = 'L LT'; // Default format (date & time)

    if (options) {
      // Map date style
      const dateStyles = {
        full: 'LL',
        long: 'LL',
        medium: 'L',
        short: 'l',
      };

      // Map time style
      const timeStyles = {
        full: 'LTS',
        long: 'LTS',
        medium: 'LT',
        short: 'LT',
      };

      // Combine date and time formats
      if (options.dateStyle && options.timeStyle) {
        formatStr = `${dateStyles[options.dateStyle]} ${timeStyles[options.timeStyle]}`;
      } else if (options.dateStyle) {
        formatStr = dateStyles[options.dateStyle];
      } else if (options.timeStyle) {
        formatStr = timeStyles[options.timeStyle];
      }
    }

    const result = dt.format(formatStr);

    // Restore original locale
    dayjsLocale(oldLocale);

    return result;
  }

  /**
   * @inheritdoc
   */
  public formatRelative(
    date: Date | string | number,
    baseDate?: Date | string | number,
    locale?: string
  ): string {
    const dt = this._toDayjs(date);
    const base = baseDate ? this._toDayjs(baseDate) : dayjs();

    if (locale) {
      const oldLocale = dayjsLocale();
      dayjsLocale(locale);
      const result = dt.from(base);
      dayjsLocale(oldLocale);
      return result;
    }

    return dt.from(base);
  }

  /**
   * @inheritdoc
   */
  public calculateBusinessDays(
    startDate: Date | string | number,
    endDate: Date | string | number,
    holidays: Array<Date | string | number> = []
  ): number {
    const start = this._toDayjs(startDate);
    const end = this._toDayjs(endDate);

    // Convert holidays to dayjs objects and format them as YYYY-MM-DD for comparison
    const holidayStrings = holidays.map((h) =>
      this._toDayjs(h).format('YYYY-MM-DD')
    );

    let count = 0;
    let current = start;

    while (current.isBefore(end) || current.isSame(end, 'day')) {
      // Check if it's a weekday (not Saturday or Sunday) and not a holiday
      const dayOfWeek = current.day();
      const dateString = current.format('YYYY-MM-DD');

      if (
        dayOfWeek !== 0 &&
        dayOfWeek !== 6 &&
        !holidayStrings.includes(dateString)
      ) {
        count++;
      }

      current = current.add(1, 'day');
    }

    return count;
  }

  /**
   * @inheritdoc
   */
  public addBusinessDays(
    date: Date | string | number,
    days: number,
    holidays: Array<Date | string | number> = []
  ): Date {
    const startDate = this._toDayjs(date);
    const holidayStrings = holidays.map((h) =>
      this._toDayjs(h).format('YYYY-MM-DD')
    );

    let current = startDate;
    let remainingDays = days;

    // Handle negative business days
    const increment = days >= 0 ? 1 : -1;
    remainingDays = Math.abs(remainingDays);

    while (remainingDays > 0) {
      current = current.add(increment, 'day');

      // Check if it's a business day
      const dayOfWeek = current.day();
      const dateString = current.format('YYYY-MM-DD');

      if (
        dayOfWeek !== 0 &&
        dayOfWeek !== 6 &&
        !holidayStrings.includes(dateString)
      ) {
        remainingDays--;
      }
    }

    return current.toDate();
  }

  /**
   * @inheritdoc
   */
  public isBusinessDay(
    date: Date | string | number,
    holidays: Array<Date | string | number> = []
  ): boolean {
    const dt = this._toDayjs(date);
    const dayOfWeek = dt.day();
    const dateString = dt.format('YYYY-MM-DD');
    const holidayStrings = holidays.map((h) =>
      this._toDayjs(h).format('YYYY-MM-DD')
    );

    // Business day: not weekend and not a holiday
    return (
      dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayStrings.includes(dateString)
    );
  }

  /**
   * @inheritdoc
   */
  public getTimezoneAbbr(
    date: Date | string | number,
    timezone?: string
  ): string {
    const dt = this._toDayjs(date);
    return timezone ? dt.tz(timezone).format('z') : dt.format('z');
  }

  /**
   * @inheritdoc
   */
  public getQuarter(date: Date | string | number): number {
    return this._toDayjs(date).quarter();
  }

  /**
   * @inheritdoc
   */
  public isLeapYear(year: number | Date | string): boolean {
    if (typeof year === 'number') {
      return dayjs().year(year).isLeapYear();
    }
    return this._toDayjs(year).isLeapYear();
  }

  /**
   * @inheritdoc
   */
  public getDaysInMonth(date: Date | string | number): number {
    return this._toDayjs(date).daysInMonth();
  }

  /**
   * @inheritdoc
   */
  public getWeek(date: Date | string | number): number {
    return this._toDayjs(date).week();
  }

  /**
   * @inheritdoc
   */
  public formatDuration(
    startDate: Date | string | number,
    endDate: Date | string | number,
    format: string
  ): string {
    const start = this._toDayjs(startDate);
    const end = this._toDayjs(endDate);
    const diff = end.diff(start);

    return dayjs.duration(diff).format(format);
  }

  /**
   * @inheritdoc
   */
  public isWeekend(date: Date | string | number): boolean {
    const day = this._toDayjs(date).day();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  }

  /**
   * @inheritdoc
   */
  public getWeekday(date: Date | string | number): number {
    return this._toDayjs(date).day();
  }
}
