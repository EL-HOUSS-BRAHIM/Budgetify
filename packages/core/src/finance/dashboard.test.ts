import { describe, expect, it } from 'vitest';
import { InvalidAmountError } from '../errors';
import {
  aggregateGoals,
  budgetProgress,
  goalProgress,
  summarizeMonth,
  totalBalance,
  type LedgerEntry,
} from './dashboard';

function entry(overrides: Partial<LedgerEntry> & { amount: number }): LedgerEntry {
  return {
    currency: 'USD',
    type: 'expense',
    categoryName: 'Food & Dining',
    date: '2026-03-10T12:00:00Z',
    ...overrides,
  };
}

describe('summarizeMonth', () => {
  it('separates income, expenses and the net', () => {
    const summary = summarizeMonth(
      [
        entry({ amount: 500_00, type: 'income', categoryName: 'Salary' }),
        entry({ amount: 120_00, date: '2026-03-02T09:00:00Z' }),
        entry({ amount: 30_00, date: '2026-03-03T09:00:00Z' }),
      ],
      '2026-03',
      'USD',
    );

    expect(summary.income.amount).toBe(500_00);
    expect(summary.expenses.amount).toBe(150_00);
    expect(summary.net.amount).toBe(350_00);
    expect(summary.transactionCount).toBe(3);
  });

  it('excludes transactions from other months', () => {
    const summary = summarizeMonth(
      [
        entry({ amount: 10_00, date: '2026-02-28T23:00:00Z' }),
        entry({ amount: 20_00, date: '2026-03-31T23:00:00Z' }),
        entry({ amount: 30_00, date: '2026-04-01T00:30:00Z' }),
      ],
      '2026-03',
      'USD',
    );

    expect(summary.expenses.amount).toBe(20_00);
    expect(summary.transactionCount).toBe(1);
  });

  it('reports a negative net when the month costs more than it earns', () => {
    const summary = summarizeMonth(
      [
        entry({ amount: 100_00, type: 'income', categoryName: 'Salary' }),
        entry({ amount: 250_00 }),
      ],
      '2026-03',
      'USD',
    );

    expect(summary.net.amount).toBe(-150_00);
  });

  it('counts transfers separately and never as income or expense', () => {
    const summary = summarizeMonth(
      [
        entry({ amount: 100_00, type: 'transfer', categoryName: 'Transfer' }),
        entry({ amount: 40_00, type: 'income', categoryName: 'Salary' }),
      ],
      '2026-03',
      'USD',
    );

    expect(summary.income.amount).toBe(40_00);
    expect(summary.expenses.amount).toBe(0);
    expect(summary.net.amount).toBe(40_00);
    expect(summary.transferCount).toBe(1);
  });

  it('excludes other currencies and reports how many were dropped', () => {
    const summary = summarizeMonth(
      [entry({ amount: 10_00, currency: 'EUR' }), entry({ amount: 20_00, currency: 'USD' })],
      '2026-03',
      'USD',
    );

    expect(summary.expenses.amount).toBe(20_00);
    expect(summary.foreignCurrencyCount).toBe(1);
  });

  it('groups spending by category, largest first, with exact shares', () => {
    const summary = summarizeMonth(
      [
        entry({ amount: 60_00, categoryName: 'Housing & Rent' }),
        entry({ amount: 30_00, categoryName: 'Food & Dining' }),
        entry({ amount: 10_00, categoryName: 'Food & Dining' }),
      ],
      '2026-03',
      'USD',
    );

    expect(summary.spendingByCategory.map((item) => item.name)).toEqual([
      'Housing & Rent',
      'Food & Dining',
    ]);
    expect(summary.spendingByCategory[0]?.amount.amount).toBe(60_00);
    expect(summary.spendingByCategory[0]?.share).toBeCloseTo(0.6, 10);
    expect(summary.spendingByCategory[1]?.share).toBeCloseTo(0.4, 10);
    expect(summary.largestCategory?.name).toBe('Housing & Rent');
  });

  it('names an empty category rather than dropping the spend', () => {
    const summary = summarizeMonth([entry({ amount: 500, categoryName: '   ' })], '2026-03', 'USD');
    expect(summary.spendingByCategory[0]?.name).toBe('Uncategorized');
  });

  it('breaks ties on category name so the order is stable', () => {
    const summary = summarizeMonth(
      [
        entry({ amount: 10_00, categoryName: 'Zebra' }),
        entry({ amount: 10_00, categoryName: 'Alpha' }),
      ],
      '2026-03',
      'USD',
    );
    expect(summary.spendingByCategory.map((item) => item.name)).toEqual(['Alpha', 'Zebra']);
  });

  it('sums daily spend in ascending day order', () => {
    const summary = summarizeMonth(
      [
        entry({ amount: 5_00, date: '2026-03-20T08:00:00Z' }),
        entry({ amount: 7_00, date: '2026-03-02T08:00:00Z' }),
        entry({ amount: 3_00, date: '2026-03-02T20:00:00Z' }),
      ],
      '2026-03',
      'USD',
    );

    expect(summary.dailySpend).toEqual([
      { day: 2, amount: { amount: 10_00, currency: 'USD' } },
      { day: 20, amount: { amount: 5_00, currency: 'USD' } },
    ]);
  });

  it('averages over the days elapsed so far, not the whole month', () => {
    const summary = summarizeMonth(
      [entry({ amount: 100_00, date: '2026-03-10T08:00:00Z' })],
      '2026-03',
      'USD',
      '2026-03-10',
    );
    expect(summary.averageDailySpend.amount).toBe(10_00);
  });

  it('reports zero average for a future month with no elapsed days', () => {
    const summary = summarizeMonth(
      [entry({ amount: 100_00, date: '2026-05-04T08:00:00Z' })],
      '2026-05',
      'USD',
      '2026-03-10',
    );
    expect(summary.averageDailySpend.amount).toBe(0);
  });

  it('divides by the full month for a month already over', () => {
    const summary = summarizeMonth(
      [entry({ amount: 310_00, date: '2026-03-10T08:00:00Z' })],
      '2026-03',
      'USD',
      '2026-04-02',
    );
    expect(summary.averageDailySpend.amount).toBe(10_00);
  });

  it('returns zeroes and no categories for an empty month', () => {
    const summary = summarizeMonth([], '2026-03', 'USD');
    expect(summary.income.amount).toBe(0);
    expect(summary.expenses.amount).toBe(0);
    expect(summary.spendingByCategory).toEqual([]);
    expect(summary.dailySpend).toEqual([]);
    expect(summary.largestCategory).toBeNull();
    expect(summary.averageDailySpend.amount).toBe(0);
  });

  it('does not divide by zero when nothing was spent', () => {
    const summary = summarizeMonth(
      [entry({ amount: 10_00, type: 'income', categoryName: 'Salary' })],
      '2026-03',
      'USD',
    );
    expect(summary.spendingByCategory).toEqual([]);
  });

  it('rejects a fractional minor-unit amount rather than rounding it', () => {
    expect(() => summarizeMonth([entry({ amount: 10.5 })], '2026-03', 'USD')).toThrow(
      InvalidAmountError,
    );
  });
});

describe('totalBalance', () => {
  it('adds only the requested currency', () => {
    const total = totalBalance(
      [
        { currency: 'USD', currentBalance: 100_00 },
        { currency: 'USD', currentBalance: -25_00 },
        { currency: 'EUR', currentBalance: 900_00 },
      ],
      'USD',
    );
    expect(total.amount).toBe(75_00);
  });

  it('is zero with no accounts', () => {
    expect(totalBalance([], 'USD').amount).toBe(0);
  });
});

function goal(overrides: Partial<Parameters<typeof goalProgress>[0]> = {}) {
  return {
    id: 'goal-1',
    name: 'Emergency fund',
    targetAmount: 1200_00,
    currentAmount: 0,
    currency: 'USD',
    deadline: '2026-12-31',
    createdAt: '2026-01-05T09:00:00Z',
    ...overrides,
  };
}

describe('goalProgress', () => {
  it('reports the remaining amount and percent complete', () => {
    const progress = goalProgress(goal({ currentAmount: 300_00 }), '2026-03-15');
    expect(progress.remaining.amount).toBe(900_00);
    expect(progress.percentComplete).toBe(25);
  });

  it('spreads the remainder over the months left', () => {
    const progress = goalProgress(goal({ currentAmount: 0 }), '2026-09-01');
    expect(progress.monthsRemaining).toBe(3);
    expect(progress.monthlyContribution.amount).toBe(400_00);
  });

  it('rounds the monthly contribution up so it always reaches the target', () => {
    const progress = goalProgress(goal({ currentAmount: 1 }), '2026-09-01');
    expect(progress.monthsRemaining).toBe(3);
    expect(progress.monthlyContribution.amount).toBe(400_00);
  });

  it('marks an over-funded goal funded and clamps the percent to 100', () => {
    const progress = goalProgress(goal({ currentAmount: 1500_00 }), '2026-03-15');
    expect(progress.status).toBe('funded');
    expect(progress.percentComplete).toBe(100);
    expect(progress.remaining.amount).toBe(0);
    expect(progress.monthlyContribution.amount).toBe(0);
  });

  it('marks a goal past its deadline overdue', () => {
    const progress = goalProgress(goal({ currentAmount: 100_00 }), '2027-01-05');
    expect(progress.status).toBe('overdue');
    expect(progress.monthsRemaining).toBe(0);
  });

  it('treats the deadline month itself as still reachable', () => {
    expect(goalProgress(goal({ currentAmount: 100_00 }), '2026-12-01').status).not.toBe('overdue');
  });

  it('calls an untouched goal not started', () => {
    expect(goalProgress(goal(), '2026-03-15').status).toBe('not_started');
  });

  it('calls a goal on track when the saved fraction keeps up with the window', () => {
    // Created January for a December target: 2 of 11 months gone, a third saved.
    const progress = goalProgress(goal({ currentAmount: 400_00 }), '2026-03-01');
    expect(progress.monthsRemaining).toBe(9);
    expect(progress.status).toBe('on_track');
  });

  it('calls a goal at risk when it is behind the window', () => {
    const progress = goalProgress(goal({ currentAmount: 10_00 }), '2026-03-01');
    expect(progress.status).toBe('at_risk');
  });

  it('cannot judge pace without a creation date, so it stays on track', () => {
    const { createdAt, ...goalWithoutCreationDate } = goal({ currentAmount: 1_00 });
    void createdAt;
    const progress = goalProgress(goalWithoutCreationDate, '2026-03-01');
    expect(progress.status).toBe('on_track');
  });

  it('reports no pace for a goal with no deadline', () => {
    const progress = goalProgress(goal({ currentAmount: 100_00, deadline: null }), '2026-03-01');
    expect(progress.monthsRemaining).toBeNull();
    expect(progress.monthlyContribution.amount).toBe(0);
    expect(progress.status).toBe('on_track');
  });

  it('rejects a zero target rather than dividing by it', () => {
    expect(() => goalProgress(goal({ targetAmount: 0 }))).toThrow(InvalidAmountError);
  });

  it('rejects a negative saved amount', () => {
    expect(() => goalProgress(goal({ currentAmount: -1 }))).toThrow(InvalidAmountError);
  });
});

describe('aggregateGoals', () => {
  it('totals goals in one currency', () => {
    const aggregate = aggregateGoals(
      [
        goal({ id: 'a', targetAmount: 1000_00, currentAmount: 250_00 }),
        goal({ id: 'b', targetAmount: 1000_00, currentAmount: 750_00 }),
      ],
      'USD',
      '2026-03-01',
    );
    expect(aggregate.target.amount).toBe(2000_00);
    expect(aggregate.saved.amount).toBe(1000_00);
    expect(aggregate.percentComplete).toBe(50);
    expect(aggregate.fundedCount).toBe(0);
    expect(aggregate.goalCount).toBe(2);
  });

  it('counts funded goals', () => {
    const aggregate = aggregateGoals(
      [goal({ id: 'a', targetAmount: 1000, currentAmount: 1000 })],
      'USD',
      '2026-03-01',
    );
    expect(aggregate.fundedCount).toBe(1);
    expect(aggregate.remaining.amount).toBe(0);
  });

  it('excludes other currencies and reports the exclusion', () => {
    const aggregate = aggregateGoals(
      [goal({ id: 'a' }), goal({ id: 'b', currency: 'EUR' })],
      'USD',
      '2026-03-01',
    );
    expect(aggregate.goalCount).toBe(1);
    expect(aggregate.excludedCount).toBe(1);
  });

  it('is zero percent with no goals', () => {
    expect(aggregateGoals([], 'USD').percentComplete).toBe(0);
  });
});

describe('budgetProgress', () => {
  it('is on track under the warning threshold', () => {
    const progress = budgetProgress({ limit: 100_00, spent: 50_00, currency: 'USD' });
    expect(progress.status).toBe('on_track');
    expect(progress.percentSpent).toBe(50);
    expect(progress.remaining.amount).toBe(50_00);
  });

  it('warns at the default 80% threshold', () => {
    expect(budgetProgress({ limit: 100_00, spent: 80_00, currency: 'USD' }).status).toBe('warning');
  });

  it('warns just below the threshold', () => {
    expect(budgetProgress({ limit: 100_00, spent: 79_99, currency: 'USD' }).status).toBe(
      'on_track',
    );
  });

  it('honours a custom threshold', () => {
    expect(
      budgetProgress({ limit: 100_00, spent: 50_00, currency: 'USD', warningThreshold: 0.5 })
        .status,
    ).toBe('warning');
  });

  it('goes over when spending exceeds the limit and stays negative', () => {
    const progress = budgetProgress({ limit: 100_00, spent: 130_00, currency: 'USD' });
    expect(progress.status).toBe('over');
    expect(progress.remaining.amount).toBe(-30_00);
    expect(progress.percentSpent).toBe(130);
  });

  it('treats a zero limit as on track rather than infinitely over', () => {
    const progress = budgetProgress({ limit: 0, spent: 50_00, currency: 'USD' });
    expect(progress.status).toBe('on_track');
    expect(progress.percentSpent).toBe(0);
  });

  it('paces the limit over the days left in the month', () => {
    // 310.00 across the 21 days remaining in March is 14.76 a day.
    const progress = budgetProgress({
      limit: 310_00,
      spent: 0,
      currency: 'USD',
      month: '2026-03',
      today: '2026-03-11',
    });
    expect(progress.dailyAllowance.amount).toBe(1476);
  });

  it('paces only what is actually left to spend', () => {
    const progress = budgetProgress({
      limit: 310_00,
      spent: 100_00,
      currency: 'USD',
      month: '2026-03',
      today: '2026-03-11',
    });
    expect(progress.dailyAllowance.amount).toBe(1000);
  });

  it('gives the whole remaining day on the last day of the month', () => {
    const progress = budgetProgress({
      limit: 31_00,
      spent: 0,
      currency: 'USD',
      month: '2026-03',
      today: '2026-03-31',
    });
    expect(progress.dailyAllowance.amount).toBe(31_00);
  });

  it('gives no daily allowance for a past month', () => {
    const progress = budgetProgress({
      limit: 310_00,
      spent: 0,
      currency: 'USD',
      month: '2026-03',
      today: '2026-04-01',
    });
    expect(progress.dailyAllowance.amount).toBe(0);
  });

  it('gives no daily allowance without a month to pace across', () => {
    const progress = budgetProgress({ limit: 310_00, spent: 0, currency: 'USD' });
    expect(progress.dailyAllowance.amount).toBe(0);
  });

  it('never suggests a negative allowance when already over', () => {
    const progress = budgetProgress({
      limit: 100_00,
      spent: 150_00,
      currency: 'USD',
      month: '2026-03',
      today: '2026-03-11',
    });
    expect(progress.dailyAllowance.amount).toBe(0);
  });

  it('rejects negative limits and spends', () => {
    expect(() => budgetProgress({ limit: -1, spent: 0, currency: 'USD' })).toThrow(
      InvalidAmountError,
    );
    expect(() => budgetProgress({ limit: 100, spent: -1, currency: 'USD' })).toThrow(
      InvalidAmountError,
    );
  });
});
