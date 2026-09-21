import type { Tables } from '@budgetify/types';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

type Goal = Tables<'goals'>;
type RecurringTransaction = Tables<'recurring_transactions'>;

export interface HomeViewModel {
  status: 'ready' | 'empty';
  displayName: string;
  currency: string;
  monthLabel: string;
  balance: number;
  income: number;
  expenses: number;
  saved: number;
  spendingByCategory: { name: string; amount: number }[];
  upcoming: RecurringTransaction[];
  goals: Goal[];
}

interface HomeDataState {
  model: HomeViewModel | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => void;
}

function monthBounds(date = new Date()): { start: string; end: string; label: string } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
    label: new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(start),
  };
}

export function useHomeData(targetDate = new Date()): HomeDataState {
  const [model, setModel] = useState<HomeViewModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const bounds = monthBounds(targetDate);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setModel(null);
        return;
      }
      const [profileResult, accountResult, transactionResult, recurringResult, goalResult] =
        await Promise.all([
          supabase
            .from('profiles')
            .select('display_name,currency')
            .eq('id', session.user.id)
            .maybeSingle(),
          supabase.from('accounts').select('*').order('is_default', { ascending: false }),
          supabase
            .from('transactions')
            .select('*')
            .gte('date', bounds.start)
            .lt('date', bounds.end)
            .order('date', { ascending: false }),
          supabase
            .from('recurring_transactions')
            .select('*')
            .eq('is_active', true)
            .gte('next_date', bounds.start.slice(0, 10))
            .order('next_date', { ascending: true })
            .limit(5),
          supabase.from('goals').select('*').order('created_at', { ascending: false }).limit(5),
        ]);
      const queryError =
        profileResult.error ||
        accountResult.error ||
        transactionResult.error ||
        recurringResult.error ||
        goalResult.error;
      if (queryError) throw queryError;
      const currency = profileResult.data?.currency || accountResult.data[0]?.currency || 'USD';
      const transactions = (transactionResult.data ?? []).filter(
        (row) => row.currency === currency,
      );
      const income = transactions
        .filter((row) => row.type === 'income')
        .reduce((sum, row) => sum + row.amount, 0);
      const expenses = transactions
        .filter((row) => row.type === 'expense')
        .reduce((sum, row) => sum + row.amount, 0);
      const spending = new Map<string, number>();
      transactions
        .filter((row) => row.type === 'expense')
        .forEach((row) =>
          spending.set(row.category_name, (spending.get(row.category_name) ?? 0) + row.amount),
        );
      const goals = (goalResult.data ?? []).filter((goal) => goal.currency === currency);
      const hasData = accountResult.data.length > 0 || transactions.length > 0 || goals.length > 0;
      setModel({
        status: hasData ? 'ready' : 'empty',
        displayName:
          profileResult.data?.display_name || session.user.email?.split('@')[0] || 'there',
        currency,
        monthLabel: bounds.label,
        balance: accountResult.data
          .filter((account) => account.currency === currency)
          .reduce((sum, account) => sum + account.current_balance, 0),
        income,
        expenses,
        saved: Math.max(0, income - expenses),
        spendingByCategory: [...spending.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([name, amount]) => ({ name, amount })),
        upcoming: recurringResult.data ?? [],
        goals,
      });
    } catch {
      setError('Your financial snapshot could not be loaded. Existing data was not changed.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [targetDate]);

  useEffect(() => {
    void load();
  }, [load]);
  return {
    model,
    isLoading,
    isRefreshing,
    error,
    refresh: () => {
      setIsRefreshing(true);
      void load();
    },
  };
}
