import {
  advanceRecurring,
  money,
  nextOccurrence,
  scheduleRecurringList,
  type Money,
  type RecurringEntry,
  type ScheduledRecurringEntry,
} from '@budgetify/core';
import { useCallback, useEffect, useState } from 'react';
import type { InsertTables, Tables } from '@budgetify/types';
import { supabase } from '../../lib/supabase';

export type RecurringTransaction = Tables<'recurring_transactions'>;

export interface RecurringState {
  items: ScheduledRecurringEntry[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  /** Rolls a due entry forward to its next date. */
  advance: (id: string) => Promise<void>;
}

const AUTH_REQUIRED = 'Sign in to manage recurring transactions.';
const LOAD_ERROR = 'Unable to load recurring transactions.';
const SAVE_ERROR = 'Unable to save recurring transaction.';

function localDayIso(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${date.getFullYear()}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
}

function toRecurringEntry(row: RecurringTransaction): RecurringEntry {
  return {
    id: row.id,
    name: row.name,
    amount: row.amount,
    currency: row.currency,
    type: row.type === 'income' ? 'income' : 'expense',
    frequency:
      row.frequency === 'weekly' || row.frequency === 'yearly' ? row.frequency : 'monthly',
    nextDate: row.next_date,
    isActive: row.is_active,
  };
}

async function requireSession(): Promise<void> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error || !session) throw new Error(AUTH_REQUIRED);
}

export function useRecurringTransactions(limit = 50): RecurringState {
  const [items, setItems] = useState<ScheduledRecurringEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      await requireSession();
      const { data, error: queryError } = await supabase
        .from('recurring_transactions')
        .select('*')
        .order('next_date', { ascending: true });
      if (queryError) throw queryError;
      const today = localDayIso(new Date());
      setItems(scheduleRecurringList((data ?? []).map(toRecurringEntry), today, limit));
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error && loadError.message === AUTH_REQUIRED
          ? AUTH_REQUIRED
          : LOAD_ERROR,
      );
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const advance = useCallback(
    async (id: string) => {
      await requireSession();
      const row = items.find((item) => item.id === id);
      if (!row) throw new Error(LOAD_ERROR);
      const nextDate = nextOccurrence(
        row.nextDate,
        row.frequency,
        localDayIso(new Date()),
      );
      const { error: updateError } = await supabase
        .from('recurring_transactions')
        .update({ next_date: nextDate })
        .eq('id', id);
      if (updateError) throw new Error(SAVE_ERROR);
      await refresh();
    },
    [items, refresh],
  );

  return { items, isLoading, error, refresh, advance };
}

export async function createRecurringTransaction(
  input: InsertTables<'recurring_transactions'>,
): Promise<void> {
  await requireSession();
  const { error } = await supabase
    .from('recurring_transactions')
    .insert({ ...input, is_active: input.is_active ?? true });
  if (error) throw new Error(SAVE_ERROR);
}

export async function deleteRecurringTransaction(id: string): Promise<void> {
  await requireSession();
  const { error } = await supabase.from('recurring_transactions').delete().eq('id', id);
  if (error) throw new Error(SAVE_ERROR);
}

/** Total still due for a set of scheduled entries, split by direction. */
export function recurringTotals(items: readonly ScheduledRecurringEntry[]): {
  income: Money;
  expense: Money;
} {
  const currency = items[0]?.currency ?? 'USD';
  let income = 0;
  let expense = 0;
  for (const item of items) {
    if (item.currency !== currency) continue;
    if (item.type === 'income') income += item.amount;
    else expense += item.amount;
  }
  return { income: money(income, currency), expense: money(expense, currency) };
}

export { advanceRecurring };
