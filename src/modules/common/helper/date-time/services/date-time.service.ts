import { Inject, Injectable } from '@nestjs/common';

import { DATE_TIME_ADAPTER } from '../constants';
import { DateRangeInclusion, DateTimeUnit } from '../enums';
import { IDateTime } from '../interfaces';
import { TFormatLocalizedOptions } from '../types';

@Injectable()
export class DateTimeService implements IDateTime {
  public constructor(
    @Inject(DATE_TIME_ADAPTER) private readonly _dateTimeAdapter: IDateTime
  ) {}

  /**
   * @inheritdoc
   */
  public get timestamp(): number {
    return this._dateTimeAdapter.timestamp;
  }

  /**
   * @inheritdoc
   */
  public get isoString(): string {
    return this._dateTimeAdapter.isoString;
  }

  /**
   * @inheritdoc
   */
  public now(): Date {
    return this._dateTimeAdapter.now();
  }

  /**
   * @inheritdoc
   */
  public parse(date: string | number | Date, format?: string): Date {
    return this._dateTimeAdapter.parse(date, format);
  }

  /**
   * @inheritdoc
   */
  public format(date: Date | string | number, format: string): string {
    return this._dateTimeAdapter.format(date, format);
  }

  /**
   * @inheritdoc
   */
  public add(
    date: Date | string | number,
    amount: number,
    unit: DateTimeUnit
  ): Date {
    return this._dateTimeAdapter.add(date, amount, unit);
  }

  /**
   * @inheritdoc
   */
  public subtract(
    date: Date | string | number,
    amount: number,
    unit: DateTimeUnit
  ): Date {
    return this._dateTimeAdapter.subtract(date, amount, unit);
  }

  /**
   * @inheritdoc
   */
  public diff(
    date1: Date | string | number,
    date2: Date | string | number,
    unit?: DateTimeUnit
  ): number {
    return this._dateTimeAdapter.diff(date1, date2, unit);
  }

  /**
   * @inheritdoc
   */
  public isBefore(
    date1: Date | string | number,
    date2: Date | string | number
  ): boolean {
    return this._dateTimeAdapter.isBefore(date1, date2);
  }

  /**
   * @inheritdoc
   */
  public isAfter(
    date1: Date | string | number,
    date2: Date | string | number
  ): boolean {
    return this._dateTimeAdapter.isAfter(date1, date2);
  }

  /**
   * @inheritdoc
   */
  public isSame(
    date1: Date | string | number,
    date2: Date | string | number,
    unit?: DateTimeUnit
  ): boolean {
    return this._dateTimeAdapter.isSame(date1, date2, unit);
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
    return this._dateTimeAdapter.isBetween(
      date,
      startDate,
      endDate,
      inclusivity
    );
  }

  /**
   * @inheritdoc
   */
  public startOf(date: Date | string | number, unit: DateTimeUnit): Date {
    return this._dateTimeAdapter.startOf(date, unit);
  }

  /**
   * @inheritdoc
   */
  public endOf(date: Date | string | number, unit: DateTimeUnit): Date {
    return this._dateTimeAdapter.endOf(date, unit);
  }

  /**
   * @inheritdoc
   */
  public toUTC(date: Date | string | number): Date {
    return this._dateTimeAdapter.toUTC(date);
  }

  /**
   * @inheritdoc
   */
  public toTimezone(date: Date | string | number, timezone: string): Date {
    return this._dateTimeAdapter.toTimezone(date, timezone);
  }

  /**
   * @inheritdoc
   */
  public getUtcOffset(date: Date | string | number, timezone?: string): number {
    return this._dateTimeAdapter.getUtcOffset(date, timezone);
  }

  /**
   * @inheritdoc
   */
  public isValid(date: Date | string | number): boolean {
    return this._dateTimeAdapter.isValid(date);
  }

  /**
   * @inheritdoc
   */
  public formatLocalized(
    date: Date | string | number,
    locale: string,
    options?: Partial<TFormatLocalizedOptions>
  ): string {
    return this._dateTimeAdapter.formatLocalized(date, locale, options);
  }

  /**
   * @inheritdoc
   */
  public formatRelative(
    date: Date | string | number,
    baseDate?: Date | string | number,
    locale?: string
  ): string {
    return this._dateTimeAdapter.formatRelative(date, baseDate, locale);
  }

  /**
   * @inheritdoc
   */
  public calculateBusinessDays(
    startDate: Date | string | number,
    endDate: Date | string | number,
    holidays?: Array<Date | string | number>
  ): number {
    return this._dateTimeAdapter.calculateBusinessDays(
      startDate,
      endDate,
      holidays
    );
  }

  /**
   * @inheritdoc
   */
  public addBusinessDays(
    date: Date | string | number,
    days: number,
    holidays?: Array<Date | string | number>
  ): Date {
    return this._dateTimeAdapter.addBusinessDays(date, days, holidays);
  }

  /**
   * @inheritdoc
   */
  public isBusinessDay(
    date: Date | string | number,
    holidays?: Array<Date | string | number>
  ): boolean {
    return this._dateTimeAdapter.isBusinessDay(date, holidays);
  }

  /**
   * @inheritdoc
   */
  public getTimezoneAbbr(
    date: Date | string | number,
    timezone?: string
  ): string {
    return this._dateTimeAdapter.getTimezoneAbbr(date, timezone);
  }

  /**
   * @inheritdoc
   */
  public getQuarter(date: Date | string | number): number {
    return this._dateTimeAdapter.getQuarter(date);
  }

  /**
   * @inheritdoc
   */
  public isLeapYear(year: number | Date | string): boolean {
    return this._dateTimeAdapter.isLeapYear(year);
  }

  /**
   * @inheritdoc
   */
  public getDaysInMonth(date: Date | string | number): number {
    return this._dateTimeAdapter.getDaysInMonth(date);
  }

  /**
   * @inheritdoc
   */
  public getWeek(date: Date | string | number): number {
    return this._dateTimeAdapter.getWeek(date);
  }

  /**
   * @inheritdoc
   */
  public formatDuration(
    startDate: Date | string | number,
    endDate: Date | string | number,
    format: string
  ): string {
    return this._dateTimeAdapter.formatDuration(startDate, endDate, format);
  }

  /**
   * @inheritdoc
   */
  public isWeekend(date: Date | string | number): boolean {
    return this._dateTimeAdapter.isWeekend(date);
  }

  /**
   * @inheritdoc
   */
  public getWeekday(date: Date | string | number): number {
    return this._dateTimeAdapter.getWeekday(date);
  }
}
