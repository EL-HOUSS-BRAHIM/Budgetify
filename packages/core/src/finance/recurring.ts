import { InvalidFrequencyError } from '../errors';

export type RecurrenceFrequency = 'weekly' | 'monthly' | 'yearly';

const FREQUENCIES: readonly RecurrenceFrequency[] = ['weekly', 'monthly', 'yearly'];

const CIVIL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

function parseCivilDate(value: string): { year: number; month: number; day: number } {
  const match = CIVIL_DATE_PATTERN.exec(value.trim());
  if (!match) throw new InvalidFrequencyError(value, 'expected a YYYY-MM-DD date');
  const [, year, month, day] = match as unknown as [string, string, string, string];
  const parts = { year: Number(year), month: Number(month), day: Number(day) };
  if (parts.month < 1 || parts.month > 12 || parts.day < 1 || parts.day > 31) {
    throw new InvalidFrequencyError(value, 'not a real calendar date');
  }
  return parts;
}

function daysInCivilMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function civilDate(year: number, month: number, day: number): string {
  return `${pad(year)}-${pad(month)}-${pad(day)}`;
}

/** Normalises a stored frequency, defaulting anything unrecognised to monthly. */
export function assertFrequency(value: string): RecurrenceFrequency {
  const normalized = value.trim().toLowerCase();
  if (!FREQUENCIES.includes(normalized as RecurrenceFrequency)) {
    throw new InvalidFrequencyError(value, 'expected weekly, monthly or yearly');
  }
  return normalized as RecurrenceFrequency;
}

export function isFrequency(value: string): boolean {
  return FREQUENCIES.includes(value.trim().toLowerCase() as RecurrenceFrequency);
}

/**
 * Advances a civil date by whole periods.
 *
 * Month and year steps clamp the day to the target month's length, so a
 * transaction due on the 31st recurs on the 28th in February and the 30th in
 * April instead of rolling into the next month. That is what a user asking for
 * "the 31st" means. Plain date arithmetic does not, which is why this exists.
 */
export function addFrequency(date: string, frequency: RecurrenceFrequency, periods = 1): string {
  const resolved = assertFrequency(frequency);
  if (!Number.isInteger(periods)) {
    throw new InvalidFrequencyError(periods, 'periods must be an integer');
  }
  const { year, month, day } = parseCivilDate(date);

  if (resolved === 'weekly') {
    const stepped = new Date(Date.UTC(year, month - 1, day) + periods * 7 * 86_400_000);
    return civilDate(stepped.getUTCFullYear(), stepped.getUTCMonth() + 1, stepped.getUTCDate());
  }

  const totalMonths = year * 12 + (month - 1) + periods * (resolved === 'yearly' ? 12 : 1);
  const targetYear = Math.floor(totalMonths / 12);
  const targetMonth = (totalMonths % 12) + 1;
  const clampedDay = Math.min(day, daysInCivilMonth(targetYear, targetMonth));
  return civilDate(targetYear, targetMonth, clampedDay);
}

/** The first occurrence falling strictly after `after`. */
export function nextOccurrence(
  nextDate: string,
  frequency: RecurrenceFrequency,
  after: string,
): string {
  return firstOccurrence(nextDate, frequency, after, 1);
}

/**
 * The first occurrence falling on or after `from`. This is what a schedule needs:
 * a bill due *today* is the most important thing on the list, and a strictly-after
 * search would hide it until tomorrow.
 */
export function occurrenceOnOrAfter(
  nextDate: string,
  frequency: RecurrenceFrequency,
  from: string,
): string {
  return firstOccurrence(nextDate, frequency, from, 0);
}

function firstOccurrence(
  nextDate: string,
  frequency: RecurrenceFrequency,
  from: string,
  strictness: 0 | 1,
): string {
  let cursor = nextDate;
  // Bounded so a corrupt row with a date centuries away cannot spin here.
  for (let guard = 0; guard < 6000; guard += 1) {
    if (compareCivilDates(cursor, from) >= strictness) return cursor;
    cursor = addFrequency(cursor, frequency, 1);
  }
  throw new InvalidFrequencyError(nextDate, 'no occurrence found at or after the given date');
}

/** Whole days from `from` to `to`; negative when `to` precedes `from`. */
export function daysBetween(from: string, to: string): number {
  const a = parseCivilDate(from);
  const b = parseCivilDate(to);
  const start = Date.UTC(a.year, a.month - 1, a.day);
  const end = Date.UTC(b.year, b.month - 1, b.day);
  return Math.round((end - start) / 86_400_000);
}

export function compareCivilDates(left: string, right: string): number {
  const a = parseCivilDate(left);
  const b = parseCivilDate(right);
  const keyA = a.year * 10_000 + a.month * 100 + a.day;
  const keyB = b.year * 10_000 + b.month * 100 + b.day;
  return keyA === keyB ? 0 : keyA < keyB ? -1 : 1;
}

export type RecurringTiming = 'overdue' | 'due_today' | 'this_week' | 'upcoming';

export interface RecurringEntry {
  readonly id: string;
  readonly name: string;
  readonly amount: number;
  readonly currency: string;
  readonly type: 'income' | 'expense';
  readonly frequency: RecurrenceFrequency;
  readonly nextDate: string;
  readonly isActive: boolean;
}

export interface ScheduledRecurringEntry extends RecurringEntry {
  /** Whole days until the next date; negative when already due. */
  readonly daysUntil: number;
  readonly timing: RecurringTiming;
  /** True when the entry has fallen due and has not been rolled forward yet. */
  readonly needsAttention: boolean;
}

/**
 * Where a recurring entry stands relative to `today`.
 *
 * `nextDate` is rolled forward to the first occurrence on or after today, so a
 * dormant entry does not stay stuck in the past. `needsAttention` is separate
 * and stays true while the *stored* date is still in the past: the row has not
 * been actioned, and that is worth showing even though the projected date is
 * in the future.
 */
export function scheduleRecurring(entry: RecurringEntry, today: string): ScheduledRecurringEntry {
  const daysUntil = daysBetween(today, entry.nextDate);
  return {
    ...entry,
    nextDate: occurrenceOnOrAfter(entry.nextDate, entry.frequency, today),
    daysUntil,
    timing: timingFor(daysUntil),
    needsAttention: daysUntil < 0,
  };
}

function timingFor(daysUntil: number): RecurringTiming {
  if (daysUntil < 0) return 'overdue';
  if (daysUntil === 0) return 'due_today';
  if (daysUntil <= 7) return 'this_week';
  return 'upcoming';
}

/**
 * Schedules every active entry, soonest first, and keeps the ones that need
 * attention ahead of the merely upcoming so an overdue bill is never pushed off
 * a short list by three routine ones.
 */
export function scheduleRecurringList(
  entries: readonly RecurringEntry[],
  today: string,
  limit = 5,
): ScheduledRecurringEntry[] {
  if (!Number.isInteger(limit) || limit < 0) {
    throw new InvalidFrequencyError(limit, 'limit must be a non-negative integer');
  }
  return entries
    .filter((entry) => entry.isActive)
    .map((entry) => scheduleRecurring(entry, today))
    .sort(
      (a, b) =>
        a.daysUntil - b.daysUntil || a.name.localeCompare(b.name) || a.id.localeCompare(b.id),
    )
    .slice(0, limit);
}

/** Rolling a due entry forward past today, leaving the rest untouched. */
export function advanceRecurring(entry: RecurringEntry, today: string): RecurringEntry {
  return { ...entry, nextDate: nextOccurrence(entry.nextDate, entry.frequency, today) };
}
