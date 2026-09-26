import { InvalidMonthError } from '../errors';

/**
 * A calendar month identified as `YYYY-MM`, deliberately with no timezone and
 * no instant attached.
 *
 * Every money figure in Core V1 is scoped to a month the user recognises — "the
 * spending in March" — not to a UTC offset boundary. `date` on a transaction is
 * a `timestamptz`, so the conversion to a query window happens at the edge (the
 * app), where the device timezone is known. Keeping that conversion out of here
 * is what makes month arithmetic testable and DST-proof.
 */
export type MonthKey = string;

const MONTH_KEY_PATTERN = /^\d{4}-(?:0[1-9]|1[0-2])$/;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:[T ].*)?$/;

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

/** True when `value` is a well-formed `YYYY-MM` key naming a real month. */
export function isMonthKey(value: string): boolean {
  return MONTH_KEY_PATTERN.test(value);
}

export function assertMonthKey(value: string): MonthKey {
  if (!isMonthKey(value)) {
    throw new InvalidMonthError(value);
  }
  return value;
}

/** The month a `Date` falls in, read in the runtime's local timezone. */
export function monthKeyFromDate(date: Date): MonthKey {
  if (Number.isNaN(date.getTime())) {
    throw new InvalidMonthError('Invalid Date');
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

/**
 * The month a stored transaction timestamp belongs to. Only the leading civil
 * date is read, so a `2026-03-01T00:30:00Z` instant is March regardless of the
 * offset the device is in — which matches what the user typed.
 */
export function monthKeyFromTimestamp(timestamp: string): MonthKey {
  const match = DATE_PATTERN.exec(timestamp.trim());
  const date = match?.[1];
  const month = match?.[2];
  if (date === undefined || month === undefined) {
    throw new InvalidMonthError(timestamp);
  }
  return assertMonthKey(`${date}-${month}`);
}

export function monthStartDate(month: string): string {
  return `${assertMonthKey(month)}-01`;
}

/** The last civil day of the month, e.g. `2024-02-29`. */
export function monthEndDate(month: string): string {
  const key = assertMonthKey(month);
  return `${key}-${pad(daysInMonth(key))}`;
}

/**
 * First day of the *following* month, for an exclusive upper bound. Using the
 * next month rather than "the 31st at 23:59" is what keeps a query window
 * correct in months that have 28, 29, 30 or 31 days.
 */
export function monthExclusiveEndDate(month: string): string {
  return monthStartDate(nextMonth(month));
}

export function daysInMonth(month: string): number {
  const key = assertMonthKey(month);
  const [year, monthNumber] = key.split('-') as [string, string];
  return new Date(Number(year), Number(monthNumber), 0).getDate();
}

export function nextMonth(month: string): MonthKey {
  const [year, monthNumber] = assertMonthKey(month).split('-') as [string, string];
  const index = Number(monthNumber);
  return index === 12 ? `${Number(year) + 1}-01` : `${year}-${pad(index + 1)}`;
}

export function previousMonth(month: string): MonthKey {
  const [year, monthNumber] = assertMonthKey(month).split('-') as [string, string];
  const index = Number(monthNumber);
  return index === 1 ? `${Number(year) - 1}-12` : `${year}-${pad(index - 1)}`;
}

/** `offset` months from `month`. Negative walks backwards. */
export function shiftMonth(month: string, offset: number): MonthKey {
  if (!Number.isInteger(offset)) {
    throw new InvalidMonthError(`${month} shifted by ${offset}`);
  }
  let cursor = assertMonthKey(month);
  const step = offset < 0 ? -1 : 1;
  for (let moved = 0; moved < Math.abs(offset); moved += 1) {
    cursor = step === 1 ? nextMonth(cursor) : previousMonth(cursor);
  }
  return cursor;
}

export function compareMonths(left: string, right: string): number {
  const a = assertMonthKey(left);
  const b = assertMonthKey(right);
  return a === b ? 0 : a < b ? -1 : 1;
}

/** Whole months from `from` to `to`. Negative when `to` precedes `from`. */
export function monthDistance(from: string, to: string): number {
  const [fromYear, fromMonth] = assertMonthKey(from).split('-') as [string, string];
  const [toYear, toMonth] = assertMonthKey(to).split('-') as [string, string];
  return (Number(toYear) - Number(fromYear)) * 12 + (Number(toMonth) - Number(fromMonth));
}

export function isSameOrAfterMonth(value: string, boundary: string): boolean {
  return compareMonths(value, boundary) >= 0;
}

export function isSameOrBeforeMonth(value: string, boundary: string): boolean {
  return compareMonths(value, boundary) <= 0;
}

/** Every month in the inclusive range `from`..`to`, ascending. Empty if reversed. */
export function eachMonth(from: string, to: string): MonthKey[] {
  const months: MonthKey[] = [];
  let cursor = assertMonthKey(from);
  const end = assertMonthKey(to);
  while (compareMonths(cursor, end) <= 0) {
    months.push(cursor);
    cursor = nextMonth(cursor);
  }
  return months;
}

/** Human label for a month key, e.g. `March 2026`. */
export function monthLabel(month: string, locale?: string): string {
  const key = assertMonthKey(month);
  const [year, monthNumber] = key.split('-') as [string, string];
  const date = new Date(Number(year), Number(monthNumber) - 1, 1);
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);
}

/** Short label for dense chrome, e.g. `Mar 2026`. */
export function shortMonthLabel(month: string, locale?: string): string {
  const key = assertMonthKey(month);
  const [year, monthNumber] = key.split('-') as [string, string];
  const date = new Date(Number(year), Number(monthNumber) - 1, 1);
  return new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }).format(date);
}
