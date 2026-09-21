import { useCallback, useEffect, useState } from 'react';
import type { InsertTables, Tables } from '@budgetify/types';
import { supabase } from '../../lib/supabase';

export type RecurringTransaction = Tables<'recurring_transactions'>;

async function requireSession(): Promise<void> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error || !session) throw new Error('Sign in to manage recurring transactions.');
}

export function useRecurringTransactions() {
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      await requireSession();
      const { data, error: queryError } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('is_active', true)
        .order('next_date', { ascending: true });
      if (queryError) throw queryError;
      setItems(data ?? []);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : 'Unable to load recurring transactions.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  return { items, isLoading, error, refresh };
}

export async function createRecurringTransaction(
  input: InsertTables<'recurring_transactions'>,
) {
  await requireSession();
  const { error } = await supabase
    .from('recurring_transactions')
    .insert({ ...input, is_active: input.is_active ?? true });
  if (error) throw new Error('Unable to save recurring transaction.');
}
