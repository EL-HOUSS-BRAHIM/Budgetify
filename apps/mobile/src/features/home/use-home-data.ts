import type { Tables } from '@budgetify/types';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

type Transaction = Tables<'transactions'>;
type PlanItem = Tables<'plan_items'>;

export interface HomeTimelineEntry {
  id: string;
  title: string;
  subtitle: string;
  dateLabel: string;
  amount: number;
  currency: string;
  direction: 'income' | 'expense';
  state: 'settled' | 'queued' | 'automated' | 'direct_debit' | string;
  projected: boolean;
}

export interface HomeViewModel {
  status: 'preview' | 'ready' | 'empty';
  displayName: string;
  locationLabel: string;
  currency: string;
  safeToSpend: number | null;
  safeToSpendLabel: string;
  safeToSpendDetail: string;
  horizonLabel: string;
  available: number;
  upcoming: number;
  savings: number;
  healthScore: number | null;
  healthInsight: string;
  inboxItem: {
    title: string;
    detail: string;
  } | null;
  timeline: HomeTimelineEntry[];
  forecastAmount: number | null;
  forecastConfidence: number | null;
}

interface HomeDataState {
  model: HomeViewModel | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => void;
}

const previewModel: HomeViewModel = {
  status: 'preview',
  displayName: 'Brahim',
  locationLabel: 'Liquidity synced · Casablanca, 21:14',
  currency: 'MAD',
  safeToSpend: 116000,
  safeToSpendLabel: 'Safe-to-Spend',
  safeToSpendDetail: 'Guaranteed zero-stress threshold for the next 12 days.',
  horizonLabel: 'Until Oct 1 (Salary)',
  available: 500000,
  upcoming: 96000,
  savings: 120000,
  healthScore: 82,
  healthInsight:
    "Spending is 8% below your monthly average, and you've achieved 70% of your active motorcycle savings reserve.",
  inboxItem: {
    title: 'Netflix subscription price increase',
    detail:
      'Auto-detected notice: rate adjusts from 98 MAD to 120 MAD starting next billing cycle (Sep 15).',
  },
  timeline: [
    {
      id: 'preview-carrefour',
      title: 'Carrefour Market',
      subtitle: 'Groceries & Household',
      dateLabel: 'Today',
      amount: 42000,
      currency: 'MAD',
      direction: 'expense',
      state: 'settled',
      projected: false,
    },
    {
      id: 'preview-netflix',
      title: 'Netflix Standard',
      subtitle: 'Recurring Subscription',
      dateLabel: 'Sep 15',
      amount: 9800,
      currency: 'MAD',
      direction: 'expense',
      state: 'queued',
      projected: true,
    },
    {
      id: 'preview-telecom',
      title: 'Maroc Telecom Fibre',
      subtitle: 'Home Internet Utility',
      dateLabel: 'Sep 18',
      amount: 19900,
      currency: 'MAD',
      direction: 'expense',
      state: 'direct_debit',
      projected: true,
    },
    {
      id: 'preview-goal',
      title: 'Auto-Transfer: Moto Goal',
      subtitle: 'Smart Vault Reserve',
      dateLabel: 'Sep 24',
      amount: 80000,
      currency: 'MAD',
      direction: 'expense',
      state: 'automated',
      projected: true,
    },
  ],
  forecastAmount: 174200,
  forecastConfidence: 86,
};

function formatTimelineDate(value: string | null): string {
  if (!value) return 'Unscheduled';

  const date = new Date(value.includes('T') ? value : `${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'Unscheduled';

  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
}

function transactionEntry(transaction: Transaction): HomeTimelineEntry {
  const isIncome = transaction.type === 'income';

  return {
    id: transaction.id,
    title: transaction.description || transaction.category_name,
    subtitle: transaction.category_name,
    dateLabel: formatTimelineDate(transaction.date),
    amount: transaction.amount,
    currency: transaction.currency,
    direction: isIncome ? 'income' : 'expense',
    state: 'settled',
    projected: false,
  };
}

function planEntry(item: PlanItem): HomeTimelineEntry {
  return {
    id: item.id,
    title: item.title,
    subtitle: item.is_recurring ? `Recurring · ${item.category_name}` : item.category_name,
    dateLabel: formatTimelineDate(item.due_date),
    amount: item.expected_amount,
    currency: item.currency,
    direction: 'expense',
    state: item.is_recurring ? 'automated' : 'queued',
    projected: true,
  };
}

export function useHomeData(): HomeDataState {
  const [model, setModel] = useState<HomeViewModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setModel(previewModel);
        return;
      }

      const [profileResult, accountResult, transactionResult, planResult, goalResult] =
        await Promise.all([
          supabase
            .from('profiles')
            .select('display_name,currency')
            .eq('id', session.user.id)
            .maybeSingle(),
          supabase.from('accounts').select('*').order('is_default', { ascending: false }),
          supabase.from('transactions').select('*').order('date', { ascending: false }).limit(4),
          supabase
            .from('plan_items')
            .select('*')
            .eq('is_done', false)
            .order('due_date', { ascending: true })
            .limit(4),
          supabase.from('goals').select('*').order('created_at', { ascending: false }),
        ]);

      const queryError =
        profileResult.error ||
        accountResult.error ||
        transactionResult.error ||
        planResult.error ||
        goalResult.error;
      if (queryError) throw queryError;

      const currency = profileResult.data?.currency || accountResult.data[0]?.currency || 'USD';
      const currencyMismatch = [
        ...accountResult.data.map((account) => account.currency),
        ...planResult.data.map((item) => item.currency),
        ...goalResult.data.map((goal) => goal.currency),
      ].some((value) => value !== currency);
      const available = accountResult.data
        .filter((account) => account.currency === currency)
        .reduce((sum, account) => sum + account.current_balance, 0);
      const upcoming = planResult.data
        .filter((item) => item.currency === currency)
        .reduce((sum, item) => sum + item.expected_amount, 0);
      const savings = goalResult.data
        .filter((goal) => goal.currency === currency)
        .reduce((sum, goal) => sum + goal.current_amount, 0);
      const hasFinancialData =
        accountResult.data.length > 0 ||
        transactionResult.data.length > 0 ||
        planResult.data.length > 0 ||
        goalResult.data.length > 0;
      const timeline = [
        ...transactionResult.data.slice(0, 2).map(transactionEntry),
        ...planResult.data.slice(0, 2).map(planEntry),
      ];
      const nextPlanItem = planResult.data[0];

      setModel({
        status: hasFinancialData ? 'ready' : 'empty',
        displayName:
          profileResult.data?.display_name || session.user.email?.split('@')[0] || 'there',
        locationLabel: 'Live data · synced just now',
        currency,
        safeToSpend: null,
        safeToSpendLabel: 'Safe-to-Spend is not ready',
        safeToSpendDetail: currencyMismatch
          ? 'Choose a display currency before combining accounts.'
          : 'Add your safety buffer and income cadence to unlock this calculation.',
        horizonLabel: 'Setup required',
        available,
        upcoming,
        savings,
        healthScore: null,
        healthInsight: 'Financial Health unlocks after your baseline setup is complete.',
        inboxItem: nextPlanItem
          ? {
              title: `${nextPlanItem.title} is coming up`,
              detail: `${nextPlanItem.category_name} · ${formatTimelineDate(nextPlanItem.due_date)}`,
            }
          : null,
        timeline,
        forecastAmount: null,
        forecastConfidence: null,
      });
    } catch {
      setError('Your financial snapshot could not be loaded. Existing data was not changed.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const refresh = () => {
    setIsRefreshing(true);
    void load();
  };

  return { model, isLoading, isRefreshing, error, refresh };
}
