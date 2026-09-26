import { describe, expect, it } from 'vitest';
import { InvalidFrequencyError } from '../errors';
import {
  advanceRecurring,
  addFrequency,
  assertFrequency,
  compareCivilDates,
  daysBetween,
  isFrequency,
  nextOccurrence,
  occurrenceOnOrAfter,
  scheduleRecurring,
  scheduleRecurringList,
  type RecurringEntry,
} from './recurring';

describe('assertFrequency', () => {
  it('accepts the three supported frequencies', () => {
    expect(assertFrequency('weekly')).toBe('weekly');
    expect(assertFrequency('monthly')).toBe('monthly');
    expect(assertFrequency('yearly')).toBe('yearly');
  });

  it('tolerates case and padding', () => {
    expect(assertFrequency(' Monthly ')).toBe('monthly');
  });

  it('rejects anything else rather than defaulting silently', () => {
    expect(() => assertFrequency('daily')).toThrow(InvalidFrequencyError);
    expect(() => assertFrequency('')).toThrow(InvalidFrequencyError);
  });
});

describe('isFrequency', () => {
  it('reports membership without throwing', () => {
    expect(isFrequency('weekly')).toBe(true);
    expect(isFrequency('fortnightly')).toBe(false);
  });
});

describe('addFrequency', () => {
  it('adds weeks', () => {
    expect(addFrequency('2026-03-01', 'weekly')).toBe('2026-03-08');
    expect(addFrequency('2026-03-01', 'weekly', 3)).toBe('2026-03-22');
  });

  it('adds months', () => {
    expect(addFrequency('2026-03-15', 'monthly')).toBe('2026-04-15');
    expect(addFrequency('2026-03-15', 'monthly', 11)).toBe('2027-02-15');
  });

  it('adds years', () => {
    expect(addFrequency('2024-02-29', 'yearly')).toBe('2025-02-28');
    expect(addFrequency('2026-01-31', 'yearly', 2)).toBe('2028-01-31');
  });

  it('clamps the day to a short month instead of rolling over', () => {
    expect(addFrequency('2026-01-31', 'monthly')).toBe('2026-02-28');
    expect(addFrequency('2026-01-31', 'monthly', 3)).toBe('2026-04-30');
  });

  it('keeps a leap day on the leap year', () => {
    expect(addFrequency('2024-01-31', 'monthly')).toBe('2024-02-29');
  });

  it('crosses the year boundary', () => {
    expect(addFrequency('2026-11-30', 'monthly', 3)).toBe('2027-02-28');
  });

  it('accepts a zero or negative period count', () => {
    expect(addFrequency('2026-03-15', 'monthly', 0)).toBe('2026-03-15');
    expect(addFrequency('2026-03-15', 'monthly', -2)).toBe('2026-01-15');
  });

  it('rejects a malformed date and a fractional period count', () => {
    expect(() => addFrequency('2026-03', 'monthly')).toThrow(InvalidFrequencyError);
    expect(() => addFrequency('2026-13-01', 'monthly')).toThrow(InvalidFrequencyError);
    expect(() => addFrequency('2026-03-01', 'monthly', 1.5)).toThrow(InvalidFrequencyError);
  });
});

describe('nextOccurrence', () => {
  it('keeps a future date as-is', () => {
    expect(nextOccurrence('2026-04-01', 'monthly', '2026-03-15')).toBe('2026-04-01');
  });

  it('rolls a past date forward to the first one after today', () => {
    expect(nextOccurrence('2026-01-05', 'monthly', '2026-03-15')).toBe('2026-04-05');
  });

  it('rolls weekly entries forward week by week', () => {
    expect(nextOccurrence('2026-01-05', 'weekly', '2026-03-15')).toBe('2026-03-16');
  });

  it('skips a date that equals today rather than calling it due', () => {
    expect(nextOccurrence('2026-03-15', 'monthly', '2026-03-15')).toBe('2026-04-15');
  });
});

describe('daysBetween and compareCivilDates', () => {
  it('counts whole days forwards and backwards', () => {
    expect(daysBetween('2026-03-01', '2026-03-15')).toBe(14);
    expect(daysBetween('2026-03-15', '2026-03-01')).toBe(-14);
  });

  it('counts across a month and a leap day', () => {
    expect(daysBetween('2024-02-28', '2024-03-01')).toBe(2);
    expect(daysBetween('2023-02-28', '2023-03-01')).toBe(1);
  });

  it('orders dates', () => {
    expect(compareCivilDates('2026-03-01', '2026-03-02')).toBe(-1);
    expect(compareCivilDates('2026-03-01', '2026-03-01')).toBe(0);
    expect(compareCivilDates('2026-03-02', '2026-03-01')).toBe(1);
    expect(compareCivilDates('2026-03-02', '2026-04-01')).toBe(-1);
  });
});

function entry(overrides: Partial<RecurringEntry> = {}): RecurringEntry {
  return {
    id: 'rec-1',
    name: 'Internet',
    amount: 199_00,
    currency: 'USD',
    type: 'expense',
    frequency: 'monthly',
    nextDate: '2026-04-01',
    isActive: true,
    ...overrides,
  };
}

describe('scheduleRecurring', () => {
  it('flags an entry due today without rolling it forward', () => {
    const scheduled = scheduleRecurring(entry({ nextDate: '2026-03-15' }), '2026-03-15');
    expect(scheduled.timing).toBe('due_today');
    expect(scheduled.daysUntil).toBe(0);
    expect(scheduled.nextDate).toBe('2026-03-15');
    expect(scheduled.needsAttention).toBe(false);
  });

  it('keeps a past-due entry overdue and needing attention', () => {
    const scheduled = scheduleRecurring(entry({ nextDate: '2026-02-01' }), '2026-03-15');
    expect(scheduled.timing).toBe('overdue');
    expect(scheduled.daysUntil).toBe(-42);
    expect(scheduled.needsAttention).toBe(true);
  });

  it('projects a past-due entry forward to its next real occurrence', () => {
    const scheduled = scheduleRecurring(entry({ nextDate: '2026-02-01' }), '2026-03-15');
    expect(scheduled.nextDate).toBe('2026-04-01');
  });

  it('rolls a weekly past-due entry forward week by week', () => {
    const scheduled = scheduleRecurring(
      entry({ nextDate: '2026-01-05', frequency: 'weekly' }),
      '2026-03-15',
    );
    expect(scheduled.nextDate).toBe('2026-03-16');
  });

  it('does not mark a future entry as needing attention', () => {
    expect(scheduleRecurring(entry({ nextDate: '2026-04-01' }), '2026-03-15').needsAttention).toBe(
      false,
    );
  });

  it('groups a near date as this week', () => {
    expect(scheduleRecurring(entry({ nextDate: '2026-03-20' }), '2026-03-15').timing).toBe(
      'this_week',
    );
  });

  it('groups a distant date as upcoming', () => {
    expect(scheduleRecurring(entry({ nextDate: '2026-06-01' }), '2026-03-15').timing).toBe(
      'upcoming',
    );
  });
});

describe('occurrenceOnOrAfter', () => {
  it('keeps a date that already qualifies', () => {
    expect(occurrenceOnOrAfter('2026-04-01', 'monthly', '2026-03-15')).toBe('2026-04-01');
  });

  it('includes a date equal to the boundary', () => {
    expect(occurrenceOnOrAfter('2026-03-15', 'monthly', '2026-03-15')).toBe('2026-03-15');
  });

  it('advances a date before the boundary', () => {
    expect(occurrenceOnOrAfter('2026-01-05', 'monthly', '2026-03-15')).toBe('2026-04-05');
  });
});

describe('scheduleRecurringList', () => {
  it('orders soonest first', () => {
    const list = scheduleRecurringList(
      [
        entry({ id: 'c', nextDate: '2026-06-01' }),
        entry({ id: 'a', nextDate: '2026-04-01' }),
        entry({ id: 'b', nextDate: '2026-03-20' }),
      ],
      '2026-03-15',
    );
    expect(list.map((item) => item.id)).toEqual(['b', 'a', 'c']);
  });

  it('puts overdue entries ahead of routine ones', () => {
    const list = scheduleRecurringList(
      [
        entry({ id: 'soon', nextDate: '2026-03-16' }),
        entry({ id: 'late', nextDate: '2026-03-01' }),
      ],
      '2026-03-15',
    );
    expect(list.map((item) => item.id)).toEqual(['late', 'soon']);
  });

  it('drops inactive entries', () => {
    const list = scheduleRecurringList(
      [entry({ id: 'a' }), entry({ id: 'b', isActive: false })],
      '2026-03-15',
    );
    expect(list.map((item) => item.id)).toEqual(['a']);
  });

  it('honours the limit', () => {
    const list = scheduleRecurringList(
      [
        entry({ id: 'a', nextDate: '2026-04-01' }),
        entry({ id: 'b', nextDate: '2026-05-01' }),
        entry({ id: 'c', nextDate: '2026-06-01' }),
      ],
      '2026-03-15',
      2,
    );
    expect(list).toHaveLength(2);
  });

  it('returns an empty list for no active entries', () => {
    expect(scheduleRecurringList([], '2026-03-15')).toEqual([]);
  });

  it('breaks ties by name so the order is stable', () => {
    const list = scheduleRecurringList(
      [entry({ id: 'z', name: 'Zebra' }), entry({ id: 'a', name: 'Alpha' })],
      '2026-03-15',
    );
    expect(list.map((item) => item.name)).toEqual(['Alpha', 'Zebra']);
  });

  it('rejects a negative limit', () => {
    expect(() => scheduleRecurringList([], '2026-03-15', -1)).toThrow(InvalidFrequencyError);
  });
});

describe('advanceRecurring', () => {
  it('moves the next date past today and leaves the rest alone', () => {
    const advanced = advanceRecurring(entry({ nextDate: '2026-01-05' }), '2026-03-15');
    expect(advanced.nextDate).toBe('2026-04-05');
    expect(advanced.name).toBe('Internet');
    expect(advanced.amount).toBe(199_00);
  });

  it('does not mutate the input', () => {
    const original = entry({ nextDate: '2026-01-05' });
    advanceRecurring(original, '2026-03-15');
    expect(original.nextDate).toBe('2026-01-05');
  });
});
