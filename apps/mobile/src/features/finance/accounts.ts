import { useCallback, useEffect, useState } from 'react';
import type { InsertTables, Tables, UpdateTables } from '@budgetify/types';
import { supabase } from '../../lib/supabase';

export type AccountRow = Tables<'accounts'>;

interface AccountsState {
  accounts: AccountRow[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const AUTH_REQUIRED = 'Sign in to manage accounts.';
const LOAD_ERROR = 'Unable to load accounts.';
const SAVE_ERROR = 'Unable to save account.';

async function requireSession(): Promise<void> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error || !session) throw new Error(AUTH_REQUIRED);
}

export async function createAccount(input: InsertTables<'accounts'>): Promise<AccountRow> {
  await requireSession();
  const { data, error } = await supabase.from('accounts').insert(input).select().single();
  if (error || !data) throw new Error(SAVE_ERROR);
  return data;
}

export async function updateAccount(
  accountId: string,
  input: UpdateTables<'accounts'>,
): Promise<AccountRow> {
  await requireSession();
  const { data, error } = await supabase
    .from('accounts')
    .update(input)
    .eq('id', accountId)
    .select()
    .single();
  if (error || !data) throw new Error(SAVE_ERROR);
  return data;
}

export function useAccounts(): AccountsState {
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await requireSession();
      const { data, error: queryError } = await supabase
        .from('accounts')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true });
      if (queryError) throw queryError;
      setAccounts(data ?? []);
    } catch {
      setAccounts([]);
      setError(LOAD_ERROR);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { accounts, isLoading, error, refresh };
}
