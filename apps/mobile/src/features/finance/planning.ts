import { useCallback, useEffect, useState } from 'react';
import type { InsertTables, Tables, UpdateTables } from '@budgetify/types';
import { supabase } from '../../lib/supabase';
import { type BudgetProgressItem } from './budgets';

export type PlanItemRow = Tables<'plan_items'>;

export interface PlanningSummary {
  label: string;
  detail: string;
  spent: number;
  limit: number;
  remaining: number;
  currency: string;
  percentSpent: number;
  status: 'on_track' | 'warning' | 'over';
}

export interface PlanningData {
  budgetProgress: BudgetProgressItem[];
  upcomingItems: PlanItemRow[];
  essentials: PlanningSummary | null;
  flexible: PlanningSummary | null;
  currentDay: number;
  daysInMonth: number;
  daysRemaining: number;
}

interface PlanningState {
  data: PlanningData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
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
  status: 'on_track' | 'warning' | 'over';
}

const AUTH_REQUIRED = 'Sign in to view your plan.';
const LOAD_ERROR = 'Unable to load your plan.';
const SAVE_ERROR = 'Unable to save plan item.';

async function requireSession(): Promise<void> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error || !session) throw new Error(AUTH_REQUIRED);
}

export async function createPlanItem(input: InsertTables<'plan_items'>): Promise<PlanItemRow> {
  await requireSession();
  const { data, error } = await supabase.from('plan_items').insert(input).select().single();
  if (error || !data) throw new Error(SAVE_ERROR);
  return data;
}

export async function updatePlanItem(
  planItemId: string,
  input: UpdateTables<'plan_items'>,
): Promise<PlanItemRow> {
  await requireSession();
  const { data, error } = await supabase
    .from('plan_items')
    .update(input)
    .eq('id', planItemId)
    .select()
    .single();
  if (error || !data) throw new Error(SAVE_ERROR);
  return data;
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
    (row['status'] === 'on_track' || row['status'] === 'warning' || row['status'] === 'over')
  );
}

function toBudgetProgressItem(row: BudgetProgressPayload): BudgetProgressItem {
  return {
    id: row.id,
    categoryName: row.category_name,
    spent: { amount: row.spent, currency: row.currency },
    limit: { amount: row.limit, currency: row.currency },
    remaining: { amount: row.remaining, currency: row.currency },
    percentSpent: row.percent_spent,
    status: row.status,
    period: row.period,
    startDate: row.start_date,
    endDate: row.end_date,
    dailyAllowance: { amount: 0, currency: row.currency },
  };
}

function isEssential(categoryName: string): boolean {
  const name = categoryName.toLowerCase();
  return (
    name.includes('housing') ||
    name.includes('rent') ||
    name.includes('utilities') ||
    name.includes('bill') ||
    name.includes('food') ||
    name.includes('grocer') ||
    name.includes('transport')
  );
}

function summarize(label: string, items: BudgetProgressItem[]): PlanningSummary | null {
  if (items.length === 0) return null;
  const currency = items[0]?.limit.currency ?? 'USD';
  const sameCurrencyItems = items.filter((item) => item.limit.currency === currency);
  const limit = sameCurrencyItems.reduce((sum, item) => sum + item.limit.amount, 0);
  const spent = sameCurrencyItems.reduce((sum, item) => sum + item.spent.amount, 0);
  const remaining = limit - spent;
  const percentSpent = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
  return {
    label,
    detail: `${sameCurrencyItems.length} active ${sameCurrencyItems.length === 1 ? 'budget' : 'budgets'}`,
    spent,
    limit,
    remaining,
    currency,
    percentSpent,
    status: spent > limit ? 'over' : percentSpent >= 80 ? 'warning' : 'on_track',
  };
}

export function usePlanningData(): PlanningState {
  const [data, setData] = useState<PlanningData | null>(null);
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
      setData(null);
      setError(AUTH_REQUIRED);
      setIsLoading(false);
      return;
    }

    const [budgetResult, planResult] = await Promise.all([
      supabase.rpc('get_budget_progress'),
      supabase
        .from('plan_items')
        .select('*')
        .eq('is_done', false)
        .order('due_date', { ascending: true })
        .limit(8),
    ]);

    if (budgetResult.error || planResult.error || !Array.isArray(budgetResult.data)) {
      setData(null);
      setError(LOAD_ERROR);
      setIsLoading(false);
      return;
    }

    const budgetProgress = budgetResult.data.reduce<BudgetProgressItem[]>((items, row) => {
      if (isBudgetProgressPayload(row)) {
        items.push(toBudgetProgressItem(row));
      }
      return items;
    }, []);
    const essentials = summarize(
      'Essentials',
      budgetProgress.filter((item) => isEssential(item.categoryName)),
    );
    const flexible = summarize(
      'Flexible Spending',
      budgetProgress.filter((item) => !isEssential(item.categoryName)),
    );
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    setData({
      budgetProgress,
      upcomingItems: planResult.data ?? [],
      essentials,
      flexible,
      currentDay: now.getDate(),
      daysInMonth,
      daysRemaining: Math.max(0, daysInMonth - now.getDate()),
    });
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, isLoading, error, refresh };
}
