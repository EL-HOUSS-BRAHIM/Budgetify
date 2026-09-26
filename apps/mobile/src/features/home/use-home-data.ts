import {
  aggregateGoals,
  formatMoney,
  monthKeyFromDate,
  monthLabel,
  money,
  scheduleRecurringList,
  summarizeMonth,
  totalBalance,
  type GoalAggregate,
  type LedgerEntry,
  type MonthKey,
  type MonthSummary,
  type Money,
  type ScheduledRecurringEntry,
} from '@budgetify/core';
import type { Tables } from '@budgetify/types';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

type Goal = Tables<'goals'>;
type RecurringTransaction = Tables<'recurring_transactions'>;
type Account = Tables<'accounts'>;

export interface HomeViewModel {
  status: 'ready' | 'empty';
  displayName: string;
  currency: string;
  month: MonthKey;
  monthLabel: string;
  isCurrentMonth: boolean;
  balance: Money;
  summary: MonthSummary;
  goals: GoalAggregate;
  upcoming: ScheduledRecurringEntry[];
}

interface HomeDataState {
  model: HomeViewModel | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => void;
}

const LOAD_ERROR = 'Your financial snapshot could not be loaded. Nothing you recorded was changed.';

function localDayIso(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${date.getFullYear()}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
}

/**
 * Local civil month boundaries as instants.
 *
 * `transactions.date` is a timestamptz, but the month a user means is their own
 * calendar month, so the window is anchored to local midnight. Deriving it from
 * the device clock in one place keeps every month-scoped query agreeing.
 */
function monthWindow(month: MonthKey): { start: string; end: string } {
  const [year, monthNumber] = month.split('-') as [string, string];
  const start = new Date(Number(year), Number(monthNumber) - 1, 1);
  const end = new Date(Number(year), Number(monthNumber), 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

/** The month a `Date` falls in, as a `MonthKey`. */
export function currentMonthKey(date: Date = new Date()): MonthKey {
  return monthKeyFromDate(date);
}

function toLedgerEntry(row: Tables<'transactions'>): LedgerEntry {
  return {
    amount: row.amount,
    currency: row.currency,
    type: row.type === 'income' || row.type === 'transfer' ? row.type : 'expense',
    categoryName: row.category_name,
    date: row.date,
  };
}

function toRecurringEntry(
  row: RecurringTransaction,
): Parameters<typeof scheduleRecurringList>[0][number] {
  return {
    id: row.id,
    name: row.name,
    amount: row.amount,
    currency: row.currency,
    type: row.type === 'income' ? 'income' : 'expense',
    frequency: row.frequency === 'weekly' || row.frequency === 'yearly' ? row.frequency : 'monthly',
    nextDate: row.next_date,
    isActive: row.is_active,
  };
}

function toGoalInput(row: Goal): Parameters<typeof aggregateGoals>[0][number] {
  return {
    id: row.id,
    name: row.name,
    targetAmount: row.target_amount,
    currentAmount: row.current_amount,
    currency: row.currency,
    deadline: row.deadline,
    createdAt: row.created_at,
  };
}

export function useHomeData(month: MonthKey = currentMonthKey()): HomeDataState {
  const [model, setModel] = useState<HomeViewModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const now = new Date();
    const today = localDayIso(now);
    const currentMonth = monthKeyFromDate(now);
    const window = monthWindow(month);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setModel(null);
        setIsLoading(false);
        setIsRefreshing(false);
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
            .gte('date', window.start)
            .lt('date', window.end)
            .order('date', { ascending: false }),
          supabase
            .from('recurring_transactions')
            .select('*')
            .eq('is_active', true)
            .order('next_date', { ascending: true }),
          supabase.from('goals').select('*').order('created_at', { ascending: false }),
        ]);

      const queryError =
        profileResult.error ||
        accountResult.error ||
        transactionResult.error ||
        recurringResult.error ||
        goalResult.error;
      if (queryError) throw queryError;

      const accounts: Account[] = accountResult.data ?? [];
      const currency =
        profileResult.data?.currency?.trim().toUpperCase() || accounts[0]?.currency || 'USD';

      const summary = summarizeMonth(
        (transactionResult.data ?? []).map(toLedgerEntry),
        month,
        currency,
        today,
      );
      const goals = aggregateGoals((goalResult.data ?? []).map(toGoalInput), currency, today);
      const upcoming = scheduleRecurringList(
        (recurringResult.data ?? []).map(toRecurringEntry),
        today,
        5,
      );

      const hasData =
        accounts.length > 0 ||
        (transactionResult.data ?? []).length > 0 ||
        (goalResult.data ?? []).length > 0;

      setModel({
        status: hasData ? 'ready' : 'empty',
        displayName:
          profileResult.data?.display_name || session.user.email?.split('@')[0] || 'there',
        currency,
        month,
        monthLabel: monthLabel(month),
        isCurrentMonth: month === currentMonth,
        balance: totalBalance(
          accounts.map((account) => ({
            currency: account.currency,
            currentBalance: account.current_balance,
          })),
          currency,
        ),
        summary,
        goals,
        upcoming,
      });
    } catch {
      setError(LOAD_ERROR);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [month]);

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

/** Formats a Home headline figure from minor units, keeping the shared rules in core. */
export function formatHomeAmount(amount: number, currency: string): string {
  return formatMoney(money(amount, currency), { compactZeroFraction: false });
}
