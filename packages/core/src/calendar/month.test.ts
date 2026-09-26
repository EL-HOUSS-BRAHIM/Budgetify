import { describe, expect, it } from 'vitest';
import { InvalidMonthError } from '../errors';
import {
  assertMonthKey,
  compareMonths,
  daysInMonth,
  eachMonth,
  isMonthKey,
  isSameOrAfterMonth,
  isSameOrBeforeMonth,
  monthDistance,
  monthEndDate,
  monthExclusiveEndDate,
  monthKeyFromDate,
  monthKeyFromTimestamp,
  monthLabel,
  monthStartDate,
  nextMonth,
  previousMonth,
  shortMonthLabel,
  shiftMonth,
} from './month';

describe('isMonthKey', () => {
  it('accepts a zero-padded year-month', () => {
    expect(isMonthKey('2026-01')).toBe(true);
    expect(isMonthKey('2026-12')).toBe(true);
  });

  it('rejects month 00 and month 13', () => {
    expect(isMonthKey('2026-00')).toBe(false);
    expect(isMonthKey('2026-13')).toBe(false);
  });

  it('rejects unpadded, partial, and extended values', () => {
    expect(isMonthKey('2026-1')).toBe(false);
    expect(isMonthKey('2026')).toBe(false);
    expect(isMonthKey('2026-01-01')).toBe(false);
    expect(isMonthKey('26-01')).toBe(false);
    expect(isMonthKey('')).toBe(false);
  });
});

describe('assertMonthKey', () => {
  it('returns the key unchanged when valid', () => {
    expect(assertMonthKey('2026-03')).toBe('2026-03');
  });

  it('throws InvalidMonthError otherwise', () => {
    expect(() => assertMonthKey('2026-3')).toThrow(InvalidMonthError);
  });
});

describe('monthKeyFromDate', () => {
  it('reads the local civil month', () => {
    expect(monthKeyFromDate(new Date(2026, 2, 15))).toBe('2026-03');
    expect(monthKeyFromDate(new Date(2026, 11, 31, 23, 59))).toBe('2026-12');
  });

  it('throws on an invalid date', () => {
    expect(() => monthKeyFromDate(new Date('nonsense'))).toThrow(InvalidMonthError);
  });
});

describe('monthKeyFromTimestamp', () => {
  it('ignores the time and offset', () => {
    expect(monthKeyFromTimestamp('2026-03-14T08:15:00.000Z')).toBe('2026-03');
    expect(monthKeyFromTimestamp('2026-03-14')).toBe('2026-03');
    expect(monthKeyFromTimestamp('2026-03-14 23:59:00+02:00')).toBe('2026-03');
  });

  it('does not roll the month for a late-night instant', () => {
    expect(monthKeyFromTimestamp('2026-03-31T23:30:00Z')).toBe('2026-03');
  });

  it('rejects values without a civil date', () => {
    expect(() => monthKeyFromTimestamp('not-a-date')).toThrow(InvalidMonthError);
  });
});

describe('daysInMonth', () => {
  it('knows the long, short and leap months', () => {
    expect(daysInMonth('2026-01')).toBe(31);
    expect(daysInMonth('2026-04')).toBe(30);
    expect(daysInMonth('2026-02')).toBe(28);
  });

  it('knows a leap February', () => {
    expect(daysInMonth('2024-02')).toBe(29);
    expect(daysInMonth('2000-02')).toBe(29);
  });

  it('rejects a century non-leap February', () => {
    expect(daysInMonth('1900-02')).toBe(28);
  });
});

describe('month boundaries', () => {
  it('returns the first and last civil day', () => {
    expect(monthStartDate('2026-03')).toBe('2026-03-01');
    expect(monthEndDate('2026-03')).toBe('2026-03-31');
    expect(monthEndDate('2024-02')).toBe('2024-02-29');
  });

  it('returns an exclusive upper bound in the following month', () => {
    expect(monthExclusiveEndDate('2026-12')).toBe('2027-01-01');
    expect(monthExclusiveEndDate('2026-01')).toBe('2026-02-01');
  });
});

describe('nextMonth and previousMonth', () => {
  it('steps within a year', () => {
    expect(nextMonth('2026-03')).toBe('2026-04');
    expect(previousMonth('2026-03')).toBe('2026-02');
  });

  it('crosses the year boundary in both directions', () => {
    expect(nextMonth('2026-12')).toBe('2027-01');
    expect(previousMonth('2026-01')).toBe('2025-12');
  });
});

describe('shiftMonth', () => {
  it('returns the same month for a zero offset', () => {
    expect(shiftMonth('2026-06', 0)).toBe('2026-06');
  });

  it('walks forwards and backwards', () => {
    expect(shiftMonth('2026-06', 3)).toBe('2026-09');
    expect(shiftMonth('2026-06', -6)).toBe('2025-12');
  });

  it('crosses multiple year boundaries', () => {
    expect(shiftMonth('2026-01', 24)).toBe('2028-01');
    expect(shiftMonth('2026-12', -25)).toBe('2024-11');
  });

  it('rejects a fractional offset', () => {
    expect(() => shiftMonth('2026-06', 1.5)).toThrow(InvalidMonthError);
  });
});

describe('compareMonths', () => {
  it('orders by year then month', () => {
    expect(compareMonths('2026-01', '2026-02')).toBe(-1);
    expect(compareMonths('2026-12', '2027-01')).toBe(-1);
    expect(compareMonths('2026-05', '2026-05')).toBe(0);
    expect(compareMonths('2026-05', '2026-04')).toBe(1);
  });
});

describe('monthDistance', () => {
  it('counts whole months forwards and backwards', () => {
    expect(monthDistance('2026-01', '2026-01')).toBe(0);
    expect(monthDistance('2026-01', '2026-12')).toBe(11);
    expect(monthDistance('2026-03', '2026-01')).toBe(-2);
    expect(monthDistance('2025-11', '2026-02')).toBe(3);
  });
});

describe('month range predicates', () => {
  it('includes the boundary month on both sides', () => {
    expect(isSameOrAfterMonth('2026-03', '2026-03')).toBe(true);
    expect(isSameOrAfterMonth('2026-02', '2026-03')).toBe(false);
    expect(isSameOrBeforeMonth('2026-03', '2026-03')).toBe(true);
    expect(isSameOrBeforeMonth('2026-04', '2026-03')).toBe(false);
  });
});

describe('eachMonth', () => {
  it('enumerates an inclusive ascending range', () => {
    expect(eachMonth('2026-01', '2026-04')).toEqual(['2026-01', '2026-02', '2026-03', '2026-04']);
  });

  it('returns a single month when start equals end', () => {
    expect(eachMonth('2026-07', '2026-07')).toEqual(['2026-07']);
  });

  it('crosses a year boundary', () => {
    expect(eachMonth('2025-11', '2026-02')).toEqual(['2025-11', '2025-12', '2026-01', '2026-02']);
  });

  it('returns nothing for a reversed range', () => {
    expect(eachMonth('2026-05', '2026-01')).toEqual([]);
  });
});

describe('month labels', () => {
  it('names the month and year', () => {
    expect(monthLabel('2026-03', 'en-US')).toBe('March 2026');
    expect(shortMonthLabel('2026-03', 'en-US')).toBe('Mar 2026');
  });

  it('handles January so the month is not off by one', () => {
    expect(monthLabel('2026-01', 'en-US')).toBe('January 2026');
    expect(monthLabel('2026-12', 'en-US')).toBe('December 2026');
  });
});
