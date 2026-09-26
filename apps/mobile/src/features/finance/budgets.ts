import {
  budgetProgress as computeBudgetProgress,
  money,
  monthKeyFromDate,
  monthStartDate,
  type BudgetStatus,
  type Money,
  type MonthKey,
} from '@budgetify/core';
import { useCallback, useEffect, useState } from 'react';
import type { InsertTables, Tables, UpdateTables } from '@budgetify/types';
import { supabase } from '../../lib/supabase';

export type BudgetRow = Tables<'budgets'>;

export type { BudgetStatus };

export interface BudgetProgressItem {
  id: string;
  categoryName: string;
  spent: Money;
  limit: Money;
  remaining: Money;
  percentSpent: number;
  status: BudgetStatus;
  period: string;
  startDate: string;
  endDate: string;
  /** What is left to spend per remaining day, when the month can be paced. */
  dailyAllowance: Money;
}

interface BudgetProgressState {
  budgets: BudgetProgressItem[];
  totals: { limit: Money; spent: Money; remaining: Money };
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const AUTH_REQUIRED = 'Sign in to view budgets.';
const LOAD_ERROR = 'Unable to load budget progress.';
const SAVE_ERROR = 'Unable to save budget.';

function localDayIso(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${date.getFullYear()}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
}

async function requireSession(): Promise<void> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error || !session) throw new Error(AUTH_REQUIRED);
}

export async function createBudget(input: InsertTables<'budgets'>): Promise<BudgetRow> {
  await requireSession();
  const { data, error } = await supabase.from('budgets').insert(input).select().single();
  if (error || !data) throw new Error(SAVE_ERROR);
  return data;
}

export async function updateBudget(
  budgetId: string,
  input: UpdateTables<'budgets'>,
): Promise<BudgetRow> {
  await requireSession();
  const { data, error } = await supabase
    .from('budgets')
    .update(input)
    .eq('id', budgetId)
    .select()
    .single();
  if (error || !data) throw new Error(SAVE_ERROR);
  return data;
}

interface BudgetProgressPayload {
  id: string;
  category_name: string;
  limit: number;
  spent: number;
  remaining: number;
  currency: string;
  period: string;
  start_date: string;
  end_date: string;
  percent_spent: number;
  status: BudgetStatus;
}

function isBudgetStatus(value: unknown): value is BudgetStatus {
  return value === 'on_track' || value === 'warning' || value === 'over';
}

function isBudgetProgressPayload(value: unknown): value is BudgetProgressPayload {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row['id'] === 'string' &&
    typeof row['category_name'] === 'string' &&
    typeof row['limit'] === 'number' &&
    typeof row['spent'] === 'number' &&
    typeof row['remaining'] === 'number' &&
    typeof row['currency'] === 'string' &&
    typeof row['period'] === 'string' &&
    typeof row['start_date'] === 'string' &&
    typeof row['end_date'] === 'string' &&
    typeof row['percent_spent'] === 'number' &&
    isBudgetStatus(row['status'])
  );
}

/**
 * Turns one RPC row into a progress item.
 *
 * The spent/limit/status arithmetic is re-derived through core rather than
 * trusted from the payload, so a screen and a unit test can never disagree about
 * what "over budget" means. The database supplies the *spend*; core decides the
 * verdict.
 */
function toBudgetProgressItem(
  row: BudgetProgressPayload,
  month: MonthKey,
  today: string,
): BudgetProgressItem {
  const progress = computeBudgetProgress({
    limit: row.limit,
    spent: row.spent,
    currency: row.currency,
    month,
    today,
  });
  return {
    id: row.id,
    categoryName: row.category_name,
    spent: progress.spent,
    limit: progress.limit,
    remaining: progress.remaining,
    percentSpent: progress.percentSpent,
    status: progress.status,
    period: row.period,
    startDate: row.start_date,
    endDate: row.end_date,
    dailyAllowance: progress.dailyAllowance,
  };
}

export function useBudgetProgress(
  month: MonthKey = monthKeyFromDate(new Date()),
): BudgetProgressState {
  const [budgets, setBudgets] = useState<BudgetProgressItem[]>([]);
  const [totals, setTotals] = useState<BudgetProgressState['totals']>({
    limit: money(0, 'USD'),
    spent: money(0, 'USD'),
    remaining: money(0, 'USD'),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      setBudgets([]);
      setError(AUTH_REQUIRED);
      setIsLoading(false);
      return;
    }

    const { data, error: rpcError } = await supabase.rpc('get_budget_progress', {
      target_date: monthStartDate(month),
    });
    if (rpcError || !Array.isArray(data)) {
      setBudgets([]);
      setError(LOAD_ERROR);
      setIsLoading(false);
      return;
    }

    const today = localDayIso(new Date());
    const parsed = data.reduce<BudgetProgressItem[]>((items, row) => {
      if (isBudgetProgressPayload(row)) {
        items.push(toBudgetProgressItem(row, month, today));
      }
      return items;
    }, []);

    const viewCurrency = parsed[0]?.limit.currency ?? 'USD';
    const sum = (pick: (item: BudgetProgressItem) => number): Money =>
      money(
        parsed.reduce((total, item) => total + pick(item), 0),
        viewCurrency,
      );

    setBudgets(parsed);
    setTotals({
      limit: sum((item) => item.limit.amount),
      spent: sum((item) => item.spent.amount),
      remaining: sum((item) => item.remaining.amount),
    });
    setIsLoading(false);
  }, [month]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { budgets, totals, isLoading, error, refresh };
}
