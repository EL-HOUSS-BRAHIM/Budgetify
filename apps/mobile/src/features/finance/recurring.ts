import { useCallback, useEffect, useState } from 'react';
import { supabase, supabasePublishableKey, supabaseUrl } from '../../lib/supabase';

export interface RecurringTransaction {
  id: string;
  name: string;
  amount: number;
  currency: string;
  type: 'income' | 'expense';
  account_id: string | null;
  category_name: string;
  frequency: 'weekly' | 'monthly' | 'yearly';
  next_date: string;
  is_active: boolean;
}

async function request(path: string, init: RequestInit = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('Sign in to manage recurring transactions.');
  return fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: supabasePublishableKey,
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
}

export function useRecurringTransactions() {
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await request(
        'recurring_transactions?select=*&is_active=eq.true&order=next_date.asc',
      );
      if (!response.ok) throw new Error('Unable to load recurring transactions.');
      setItems((await response.json()) as RecurringTransaction[]);
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
  input: Omit<RecurringTransaction, 'id' | 'is_active'>,
) {
  const response = await request('recurring_transactions', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ ...input, is_active: true }),
  });
  if (!response.ok) throw new Error('Unable to save recurring transaction.');
}
