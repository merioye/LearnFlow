export enum DateTimeUnit {
  YEAR = 'year',
  MONTH = 'month',
  WEEK = 'week',
  DAY = 'day',
  HOUR = 'hour',
  MINUTE = 'minute',
  SECOND = 'second',
  MILLISECOND = 'millisecond',
  QUARTER = 'quarter',
}

export enum DateTimeStyle {
  FULL = 'full',
  LONG = 'long',
  MEDIUM = 'medium',
  SHORT = 'short',
}

export enum DateRangeInclusion {
  NOTHING = '()',
  START_ONLY = '[)',
  END_ONLY = '(]',
  BOTH = '[]',
}
