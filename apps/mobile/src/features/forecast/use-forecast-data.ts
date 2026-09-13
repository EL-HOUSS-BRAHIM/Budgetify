import type { Tables } from '@budgetify/types';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

type Transaction = Tables<'transactions'>;
type PlanItem = Tables<'plan_items'>;

export type CalendarDayTone = 'income' | 'goal' | 'neutral' | 'projected';

export interface ForecastCalendarDay {
  key: string;
  day: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  emoji?: string;
  glyph?: string;
  tone?: CalendarDayTone;
  highlighted: boolean;
  eventId?: string;
}

export interface ForecastEvent {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  dateLabel: string;
  amount: number;
  currency: string;
  direction: 'income' | 'expense';
  tone: CalendarDayTone;
}

export interface ForecastViewModel {
  status: 'preview' | 'ready' | 'empty';
  monthLabel: string;
  currency: string;
  calendarDays: ForecastCalendarDay[];
  events: ForecastEvent[];
  forecastAmount: number | null;
  forecastConfidence: number | null;
  forecastNarrative: string | null;
  overdraftRiskLabel: string | null;
}

interface ForecastDataState {
  model: ForecastViewModel | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => void;
}

function cell(
  day: number,
  inCurrentMonth: boolean,
  overrides: Partial<ForecastCalendarDay> = {},
): ForecastCalendarDay {
  return {
    key: `${inCurrentMonth ? 'cur' : 'adj'}-${day}-${overrides.eventId ?? 'plain'}`,
    day,
    inCurrentMonth,
    isToday: false,
    highlighted: false,
    ...overrides,
  };
}

const previewEvents: ForecastEvent[] = [
  {
    id: 'preview-salary',
    emoji: '💰',
    title: 'Salary Expected',
    subtitle: 'Attijariwafa Checking · Direct Deposit',
    dateLabel: 'Sep 13',
    amount: 500000,
    currency: 'MAD',
    direction: 'income',
    tone: 'income',
  },
  {
    id: 'preview-netflix',
    emoji: '📺',
    title: 'Netflix Subscription',
    subtitle: 'Recurring Direct Debit',
    dateLabel: 'Sep 15',
    amount: 9800,
    currency: 'MAD',
    direction: 'expense',
    tone: 'neutral',
  },
  {
    id: 'preview-telecom',
    emoji: '🌐',
    title: 'Maroc Telecom Fibre',
    subtitle: 'Fixed Utility Bill',
    dateLabel: 'Sep 18',
    amount: 19900,
    currency: 'MAD',
    direction: 'expense',
    tone: 'neutral',
  },
  {
    id: 'preview-goal',
    emoji: '🏍️',
    title: 'Yamaha MT-07 Goal',
    subtitle: 'Smart Goal Vault Auto-Fund',
    dateLabel: 'Sep 21',
    amount: 50000,
    currency: 'MAD',
    direction: 'expense',
    tone: 'goal',
  },
];

function buildPreviewCalendar(): ForecastCalendarDay[] {
  const days: ForecastCalendarDay[] = [];
  days.push(cell(31, false));
  for (let day = 1; day <= 30; day += 1) {
    if (day === 13) {
      days.push(
        cell(day, true, {
          emoji: '💰',
          tone: 'income',
          highlighted: true,
          eventId: 'preview-salary',
        }),
      );
    } else if (day === 15) {
      days.push(cell(day, true, { emoji: '📺', tone: 'neutral', eventId: 'preview-netflix' }));
    } else if (day === 18) {
      days.push(cell(day, true, { emoji: '🌐', tone: 'neutral', eventId: 'preview-telecom' }));
    } else if (day === 21) {
      days.push(cell(day, true, { emoji: '🏍️', tone: 'goal', eventId: 'preview-goal' }));
    } else if (day === 25) {
      days.push(cell(day, true, { emoji: '🛡️', tone: 'income' }));
    } else if (day === 30) {
      days.push(cell(day, true, { glyph: '≈', tone: 'projected' }));
    } else {
      days.push(cell(day, true));
    }
  }
  days.push(cell(1, false), cell(2, false), cell(3, false));
  return days;
}

const previewModel: ForecastViewModel = {
  status: 'preview',
  monthLabel: 'September 2026',
  currency: 'MAD',
  calendarDays: buildPreviewCalendar(),
  events: previewEvents,
  forecastAmount: 174200,
  forecastConfidence: 86,
  forecastNarrative:
    'Based on 4 upcoming verified fixed bills and your machine-learned discretionary spending velocity, your liquidity on Sep 30 will be approximately MAD 1,742.00.',
  overdraftRiskLabel: 'Zero overdraft risk detected before next pay cycle',
};

function emojiForEntry(categoryName: string, isIncome: boolean): { emoji: string; tone: CalendarDayTone } {
  if (isIncome) return { emoji: '💰', tone: 'income' };
  const name = categoryName.toLowerCase();
  if (name.includes('goal') || name.includes('vault') || name.includes('saving')) {
    return { emoji: '🎯', tone: 'goal' };
  }
  if (name.includes('subscription') || name.includes('entertainment') || name.includes('streaming')) {
    return { emoji: '📺', tone: 'neutral' };
  }
  if (name.includes('utilit') || name.includes('internet') || name.includes('telecom') || name.includes('phone')) {
    return { emoji: '🌐', tone: 'neutral' };
  }
  if (name.includes('transport') || name.includes('car') || name.includes('fuel')) {
    return { emoji: '🚗', tone: 'neutral' };
  }
  if (name.includes('food') || name.includes('grocer')) {
    return { emoji: '🛒', tone: 'neutral' };
  }
  if (name.includes('dining') || name.includes('restaurant')) {
    return { emoji: '🍽️', tone: 'neutral' };
  }
  if (name.includes('housing') || name.includes('rent')) {
    return { emoji: '🏠', tone: 'neutral' };
  }
  return { emoji: '💳', tone: 'neutral' };
}

function formatDateLabel(value: string): string {
  const date = new Date(value.includes('T') ? value : `${value}T00:00:00`);
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
}

function buildRealCalendar(
  year: number,
  month: number,
  todayDay: number,
  daysInMonth: number,
  eventByDay: Map<number, { emoji: string; tone: CalendarDayTone; eventId: string }>,
): ForecastCalendarDay[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const days: ForecastCalendarDay[] = [];

  for (let i = firstWeekday - 1; i >= 0; i -= 1) {
    days.push(cell(prevMonthDays - i, false));
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const marker = eventByDay.get(day);
    days.push(
      cell(day, true, {
        isToday: day === todayDay,
        highlighted: day === todayDay,
        ...(marker ? { emoji: marker.emoji, tone: marker.tone, eventId: marker.eventId } : {}),
      }),
    );
  }
  const trailing = (7 - (days.length % 7)) % 7;
  for (let day = 1; day <= trailing; day += 1) {
    days.push(cell(day, false));
  }
  return days;
}

export function useForecastData(): ForecastDataState {
  const [model, setModel] = useState<ForecastViewModel | null>(null);
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

      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const todayDay = now.getDate();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const monthStart = new Date(year, month, 1).toISOString().slice(0, 10);
      const monthEnd = new Date(year, month, daysInMonth).toISOString().slice(0, 10);
      const monthLabel = new Intl.DateTimeFormat(undefined, {
        month: 'long',
        year: 'numeric',
      }).format(now);

      const [transactionResult, planResult] = await Promise.all([
        supabase
          .from('transactions')
          .select('*')
          .gte('date', monthStart)
          .lte('date', monthEnd)
          .order('date', { ascending: true }),
        supabase
          .from('plan_items')
          .select('*')
          .gte('due_date', monthStart)
          .lte('due_date', monthEnd)
          .order('due_date', { ascending: true }),
      ]);

      const queryError = transactionResult.error || planResult.error;
      if (queryError) throw queryError;

      const transactions: Transaction[] = transactionResult.data ?? [];
      const planItems: PlanItem[] = planResult.data ?? [];
      const currency =
        transactions[0]?.currency || planItems[0]?.currency || 'USD';

      const eventByDay = new Map<
        number,
        { emoji: string; tone: CalendarDayTone; eventId: string }
      >();
      for (const transaction of transactions) {
        const day = new Date(`${transaction.date}T00:00:00`).getDate();
        const { emoji, tone } = emojiForEntry(transaction.category_name, transaction.type === 'income');
        eventByDay.set(day, { emoji, tone, eventId: transaction.id });
      }

      const todayIso = now.toISOString().slice(0, 10);
      const upcomingPlanItems = planItems
        .filter(
          (item): item is PlanItem & { due_date: string } =>
            !item.is_done && item.due_date !== null && item.due_date >= todayIso,
        )
        .slice(0, 4);
      for (const item of upcomingPlanItems) {
        const day = new Date(`${item.due_date}T00:00:00`).getDate();
        const { emoji, tone } = emojiForEntry(item.category_name, false);
        eventByDay.set(day, { emoji, tone, eventId: item.id });
      }

      const events: ForecastEvent[] = upcomingPlanItems.map((item) => {
        const { emoji, tone } = emojiForEntry(item.category_name, false);
        return {
          id: item.id,
          emoji,
          title: item.title,
          subtitle: item.is_recurring ? `Recurring · ${item.category_name}` : item.category_name,
          dateLabel: formatDateLabel(item.due_date),
          amount: item.expected_amount,
          currency: item.currency,
          direction: 'expense',
          tone,
        };
      });

      const calendarDays = buildRealCalendar(year, month, todayDay, daysInMonth, eventByDay);
      const status = transactions.length === 0 && planItems.length === 0 ? 'empty' : 'ready';

      setModel({
        status,
        monthLabel,
        currency,
        calendarDays,
        events,
        forecastAmount: null,
        forecastConfidence: null,
        forecastNarrative: null,
        overdraftRiskLabel: null,
      });
    } catch {
      setError('Your forecast calendar could not be loaded. Existing data was not changed.');
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
