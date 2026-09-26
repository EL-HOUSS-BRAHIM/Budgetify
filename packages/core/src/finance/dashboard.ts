import {
  compareMonths,
  daysInMonth,
  monthDistance,
  monthKeyFromTimestamp,
  type MonthKey,
} from '../calendar/month';
import { InvalidAmountError } from '../errors';
import { money, normalizeCurrency, type Money } from '../money/money';

/**
 * A transaction as the domain layer sees it: minor units, a civil-date-bearing
 * timestamp, and a direction. This is a structural subset of the `transactions`
 * row so a Supabase payload, a test fixture and a future import format can all
 * feed the same calculation.
 */
export interface LedgerEntry {
  readonly amount: number;
  readonly currency: string;
  readonly type: 'income' | 'expense' | 'transfer';
  readonly categoryName: string;
  readonly date: string;
}

export interface CategorySpend {
  readonly name: string;
  readonly amount: Money;
  /** Share of total spending, 0..1. Exactly 0 when nothing was spent. */
  readonly share: number;
}

export interface DailySpend {
  readonly day: number;
  readonly amount: Money;
}

export interface MonthSummary {
  readonly month: MonthKey;
  readonly currency: string;
  readonly income: Money;
  readonly expenses: Money;
  /** Income minus expenses. Negative means the month cost more than it earned. */
  readonly net: Money;
  readonly transactionCount: number;
  readonly transferCount: number;
  readonly foreignCurrencyCount: number;
  readonly spendingByCategory: readonly CategorySpend[];
  readonly dailySpend: readonly DailySpend[];
  /** Spread over the days elapsed so far in the month, not the whole month. */
  readonly averageDailySpend: Money;
  readonly largestCategory: CategorySpend | null;
}

export interface AccountBalanceInput {
  readonly currency: string;
  readonly currentBalance: number;
}

export interface GoalProgressInput {
  readonly id: string;
  readonly name: string;
  readonly targetAmount: number;
  readonly currentAmount: number;
  readonly currency: string;
  /** Civil date; `null` means the user set no deadline. */
  readonly deadline: string | null;
  /**
   * ISO timestamp the goal was created. Pace is measured over the window from
   * creation to deadline, so without it a dated goal can be reported as saved
   * or behind, but never as ahead or behind schedule.
   */
  readonly createdAt?: string;
}

export type GoalStatus = 'not_started' | 'on_track' | 'at_risk' | 'funded' | 'overdue';

export interface GoalProgress {
  readonly id: string;
  readonly name: string;
  readonly currency: string;
  readonly target: Money;
  readonly saved: Money;
  readonly remaining: Money;
  /** 0..100, clamped. An over-funded goal reads 100, not 140. */
  readonly percentComplete: number;
  readonly status: GoalStatus;
  /** Civil deadline the user set, or `null`. */
  readonly deadline: string | null;
  /** Whole months until the deadline, or `null` without one. */
  readonly monthsRemaining: number | null;
  /** Minor units to set aside each month to hit the deadline. Zero if already funded. */
  readonly monthlyContribution: Money;
}

export interface GoalAggregate {
  readonly currency: string;
  readonly target: Money;
  readonly saved: Money;
  readonly remaining: Money;
  readonly percentComplete: number;
  readonly goalCount: number;
  readonly fundedCount: number;
  readonly excludedCount: number;
}

export type BudgetStatus = 'on_track' | 'warning' | 'over';

export interface BudgetProgress {
  readonly currency: string;
  readonly limit: Money;
  readonly spent: Money;
  /** Negative once the limit is exceeded. */
  readonly remaining: Money;
  /** Whole percent of the limit used, not clamped, so 130 is visible as 130. */
  readonly percentSpent: number;
  readonly status: BudgetStatus;
  /** Minor units still spendable per remaining day of the month. Zero if elapsed. */
  readonly dailyAllowance: Money;
}

function assertMinorUnits(amount: number, label: string): void {
  if (!Number.isInteger(amount)) {
    throw new InvalidAmountError(amount, `${label} must be an integer count of minor units`);
  }
  if (!Number.isSafeInteger(amount)) {
    throw new InvalidAmountError(amount, `${label} exceeds the safe integer range`);
  }
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

/**
 * Sums a month's transactions into the figures the Home dashboard shows.
 *
 * Entries outside `month` are ignored, which is what makes the dashboard
 * month-scoped: the caller asks for `2026-03` and gets March whether the query
 * already filtered or not. Entries in another currency are excluded from the
 * arithmetic and counted in `foreignCurrencyCount` rather than silently summed
 * into a total they do not belong to.
 */
export function summarizeMonth(
  entries: readonly LedgerEntry[],
  month: MonthKey,
  currency: string,
  today?: string,
): MonthSummary {
  const targetCurrency = normalizeCurrency(currency);
  let income = 0;
  let expenses = 0;
  let transactionCount = 0;
  let transferCount = 0;
  let foreignCurrencyCount = 0;
  const categoryTotals = new Map<string, number>();
  const dayTotals = new Map<number, number>();

  for (const entry of entries) {
    if (entry.currency !== targetCurrency) {
      foreignCurrencyCount += 1;
      continue;
    }
    if (monthKeyFromTimestamp(entry.date) !== month) {
      continue;
    }
    assertMinorUnits(entry.amount, 'transaction amount');
    transactionCount += 1;
    if (entry.type === 'transfer') {
      transferCount += 1;
      continue;
    }
    if (entry.type === 'income') {
      income += entry.amount;
      continue;
    }
    expenses += entry.amount;
    const name = entry.categoryName.trim() || 'Uncategorized';
    categoryTotals.set(name, (categoryTotals.get(name) ?? 0) + entry.amount);
    const day = Number(entry.date.slice(8, 10));
    dayTotals.set(day, (dayTotals.get(day) ?? 0) + entry.amount);
  }

  const spendingByCategory: CategorySpend[] = [...categoryTotals.entries()]
    .map(([name, amount]) => ({
      name,
      amount: money(amount, targetCurrency),
      share: expenses > 0 ? amount / expenses : 0,
    }))
    .sort((a, b) => b.amount.amount - a.amount.amount || a.name.localeCompare(b.name));

  const dailySpend: DailySpend[] = [...dayTotals.entries()]
    .map(([day, amount]) => ({ day, amount: money(amount, targetCurrency) }))
    .sort((a, b) => a.day - b.day);

  const totalDays = daysInMonth(month);
  const elapsedDays = today ? elapsedDaysInMonth(month, today) : totalDays;

  return {
    month,
    currency: targetCurrency,
    income: money(income, targetCurrency),
    expenses: money(expenses, targetCurrency),
    net: money(income - expenses, targetCurrency),
    transactionCount,
    transferCount,
    foreignCurrencyCount,
    spendingByCategory,
    dailySpend,
    averageDailySpend: money(
      elapsedDays > 0 ? Math.round(expenses / elapsedDays) : 0,
      targetCurrency,
    ),
    largestCategory: spendingByCategory[0] ?? null,
  };
}

/** Days of `month` that have happened as of `today`, clamped to the month length. */
function elapsedDaysInMonth(month: MonthKey, today: string): number {
  if (compareMonths(monthKeyFromTimestamp(today), month) < 0) return 0;
  if (compareMonths(monthKeyFromTimestamp(today), month) > 0) return daysInMonth(month);
  const day = Number(today.slice(8, 10));
  return Math.min(daysInMonth(month), Math.max(1, day));
}

/** Total balance across the caller's accounts in one currency. */
export function totalBalance(accounts: readonly AccountBalanceInput[], currency: string): Money {
  const targetCurrency = normalizeCurrency(currency);
  let total = 0;
  for (const account of accounts) {
    if (account.currency !== targetCurrency) continue;
    assertMinorUnits(account.currentBalance, 'account balance');
    total += account.currentBalance;
  }
  return money(total, targetCurrency);
}

/**
 * Progress of one savings goal, including whether the current pace will reach the
 * target before the deadline. A goal with no deadline reports no pace rather
 * than inventing a monthly contribution.
 */
export function goalProgress(goal: GoalProgressInput, today?: string): GoalProgress {
  const currency = normalizeCurrency(goal.currency);
  assertMinorUnits(goal.targetAmount, 'goal target');
  assertMinorUnits(goal.currentAmount, 'goal current amount');
  if (goal.targetAmount <= 0) {
    throw new InvalidAmountError(goal.targetAmount, 'goal target must be greater than zero');
  }
  if (goal.currentAmount < 0) {
    throw new InvalidAmountError(goal.currentAmount, 'goal current amount must not be negative');
  }

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  // Whole months from today until the deadline month. Negative once it is past.
  const runwayMonths = goal.deadline ? monthGap(goal.deadline, today) : null;
  const monthsRemaining = runwayMonths === null ? null : Math.max(0, runwayMonths);
  const funded = remaining === 0;

  let status: GoalStatus;
  if (funded) {
    status = 'funded';
  } else if (runwayMonths !== null && runwayMonths < 0) {
    status = 'overdue';
  } else if (goal.currentAmount === 0) {
    status = 'not_started';
  } else if (monthsRemaining === null) {
    // No deadline means no pace to judge, only progress.
    status = 'on_track';
  } else {
    // On pace when at least as much of the target is saved as of the goal's
    // window has elapsed. "A third saved with a third of the time gone" is on
    // pace; a third saved with two thirds of the time gone is not.
    status = isAheadOfSchedule(goal, today) ? 'on_track' : 'at_risk';
  }

  return {
    id: goal.id,
    name: goal.name,
    currency,
    target: money(goal.targetAmount, currency),
    saved: money(goal.currentAmount, currency),
    remaining: money(remaining, currency),
    percentComplete: clampPercent(Math.round((goal.currentAmount / goal.targetAmount) * 100)),
    status,
    deadline: goal.deadline,
    monthsRemaining,
    monthlyContribution:
      funded || monthsRemaining === null || monthsRemaining <= 0
        ? money(0, currency)
        : money(Math.ceil(remaining / monthsRemaining), currency),
  };
}

/**
 * Whole months from today until the month containing `deadline`. Negative when
 * the deadline is already behind. Without a `today` there is no runway to
 * measure, so the caller is told 0 and treats the goal as undated.
 */
function monthGap(deadline: string, today?: string): number {
  if (!today) return 0;
  return monthDistance(monthKeyFromTimestamp(today), deadline.slice(0, 7));
}

function todayMonth(today: string | undefined): MonthKey | null {
  return today ? monthKeyFromTimestamp(today) : null;
}

/**
 * True when the fraction of the target saved is at least the fraction of the
 * goal's window that has elapsed. Needs a creation date: without one there is
 * no window to be ahead of, and guessing would invent a pace the user never set.
 */
function isAheadOfSchedule(goal: GoalProgressInput, today: string | undefined): boolean {
  const now = todayMonth(today);
  if (!now || !goal.deadline || !goal.createdAt) return true;
  const created = monthKeyFromTimestamp(goal.createdAt);
  const deadline = goal.deadline.slice(0, 7);
  const windowMonths = monthDistance(created, deadline);
  if (windowMonths <= 0) return true;
  const elapsedMonths = Math.min(windowMonths, Math.max(0, monthDistance(created, now)));
  return goal.currentAmount / goal.targetAmount >= elapsedMonths / windowMonths;
}

/**
 * Rolls up every goal in one currency. Goals in other currencies are counted in
 * `excludedCount` so the UI can say the aggregate is partial instead of
 * presenting a total that silently drops money.
 */
export function aggregateGoals(
  goals: readonly GoalProgressInput[],
  currency: string,
  today?: string,
): GoalAggregate {
  void today;
  const targetCurrency = normalizeCurrency(currency);
  let target = 0;
  let saved = 0;
  let goalCount = 0;
  let fundedCount = 0;
  let excludedCount = 0;

  for (const goal of goals) {
    if (normalizeCurrency(goal.currency) !== targetCurrency) {
      excludedCount += 1;
      continue;
    }
    goalCount += 1;
    target += goal.targetAmount;
    saved += goal.currentAmount;
    if (goal.currentAmount >= goal.targetAmount) fundedCount += 1;
  }

  return {
    currency: targetCurrency,
    target: money(target, targetCurrency),
    saved: money(saved, targetCurrency),
    remaining: money(Math.max(0, target - saved), targetCurrency),
    percentComplete: target > 0 ? clampPercent(Math.round((saved / target) * 100)) : 0,
    goalCount,
    fundedCount,
    excludedCount,
  };
}

/**
 * Spent-versus-limit for a monthly budget, with the status thresholds the
 * Budget tab renders.
 *
 * `today` and `totalDays` let the caller pace the limit across the days left in
 * the month; without them no daily allowance is produced, because pacing a
 * historical month by today would be nonsense.
 */
export function budgetProgress(input: {
  readonly limit: number;
  readonly spent: number;
  readonly currency: string;
  readonly warningThreshold?: number;
  readonly today?: string;
  readonly month?: MonthKey;
}): BudgetProgress {
  const currency = normalizeCurrency(input.currency);
  assertMinorUnits(input.limit, 'budget limit');
  assertMinorUnits(input.spent, 'budget spent');
  if (input.limit < 0) {
    throw new InvalidAmountError(input.limit, 'budget limit must not be negative');
  }
  if (input.spent < 0) {
    throw new InvalidAmountError(input.spent, 'budget spent must not be negative');
  }

  const threshold = input.warningThreshold ?? 0.8;
  const percentSpent = input.limit > 0 ? (input.spent / input.limit) * 100 : 0;
  const remaining = input.limit - input.spent;

  let status: BudgetStatus;
  if (input.limit > 0 && input.spent > input.limit) status = 'over';
  else if (input.limit > 0 && percentSpent >= threshold * 100) status = 'warning';
  else status = 'on_track';

  return {
    currency,
    limit: money(input.limit, currency),
    spent: money(input.spent, currency),
    remaining: money(remaining, currency),
    percentSpent: Math.round(percentSpent),
    status,
    dailyAllowance: money(
      dailyAllowance(input.limit, remaining, input.today, input.month),
      currency,
    ),
  };
}

function dailyAllowance(
  limit: number,
  remaining: number,
  today: string | undefined,
  month: MonthKey | undefined,
): number {
  if (!today || !month) return 0;
  if (compareMonths(monthKeyFromTimestamp(today), month) < 0) return 0;
  if (compareMonths(monthKeyFromTimestamp(today), month) > 0) return 0;
  const totalDays = daysInMonth(month);
  const daysLeft = totalDays - Number(today.slice(8, 10)) + 1;
  if (daysLeft <= 0) return 0;
  return Math.max(0, Math.floor(Math.min(remaining, limit) / daysLeft));
}
