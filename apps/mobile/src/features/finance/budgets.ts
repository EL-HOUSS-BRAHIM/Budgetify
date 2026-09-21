import { money, type Money } from '@budgetify/core';
import { useCallback, useEffect, useState } from 'react';
import type { InsertTables, Tables, UpdateTables } from '@budgetify/types';
import { supabase } from '../../lib/supabase';

export type BudgetRow = Tables<'budgets'>;

export type BudgetStatus = 'on_track' | 'warning' | 'over';

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
}

interface BudgetProgressState {
  budgets: BudgetProgressItem[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const AUTH_REQUIRED = 'Sign in to view budgets.';
const LOAD_ERROR = 'Unable to load budget progress.';
const SAVE_ERROR = 'Unable to save budget.';

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

function toBudgetProgressItem(row: BudgetProgressPayload): BudgetProgressItem {
  return {
    id: row.id,
    categoryName: row.category_name,
    spent: money(row.spent, row.currency),
    limit: money(row.limit, row.currency),
    remaining: money(row.remaining, row.currency),
    percentSpent: row.percent_spent,
    status: row.status,
    period: row.period,
    startDate: row.start_date,
    endDate: row.end_date,
  };
}

export function useBudgetProgress(targetDate = new Date()): BudgetProgressState {
  const [budgets, setBudgets] = useState<BudgetProgressItem[]>([]);
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
      target_date: targetDate.toISOString().slice(0, 10),
    });
    if (rpcError || !Array.isArray(data)) {
      setBudgets([]);
      setError(LOAD_ERROR);
      setIsLoading(false);
      return;
    }

    const parsed = data.reduce<BudgetProgressItem[]>((items, row) => {
      if (isBudgetProgressPayload(row)) {
        items.push(toBudgetProgressItem(row));
      }
      return items;
    }, []);
    setBudgets(parsed);
    setIsLoading(false);
  }, [targetDate]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { budgets, isLoading, error, refresh };
}
