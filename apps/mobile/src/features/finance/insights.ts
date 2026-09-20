import { money, type Money } from '@budgetify/core';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export interface FinancialHealth {
  currency: string;
  score: number;
  label: string;
  liquidityScore: number;
  goalScore: number;
  spendingScore: number;
  available: Money;
  monthlyIncome: Money;
  monthlyExpense: Money;
  upcomingCommitments: Money;
  goalSaved: Money;
  goalTarget: Money;
  nextMove: string;
}

export interface MonthEndReport {
  currency: string;
  periodStart: string;
  periodEnd: string;
  disciplineScore: number;
  income: Money;
  expense: Money;
  committedSpending: Money;
  goalSavedTotal: Money;
  narrative: string;
}

interface InsightState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface FinancialHealthPayload {
  currency: string;
  score: number;
  label: string;
  liquidity_score: number;
  goal_score: number;
  spending_score: number;
  available: number;
  monthly_income: number;
  monthly_expense: number;
  upcoming_commitments: number;
  goal_saved: number;
  goal_target: number;
  next_move: string;
}

interface MonthEndReportPayload {
  currency: string;
  period_start: string;
  period_end: string;
  discipline_score: number;
  income: number;
  expense: number;
  committed_spending: number;
  goal_saved_total: number;
  narrative: string;
}

const AUTH_REQUIRED = 'Sign in to view this insight.';
const HEALTH_ERROR = 'Unable to load financial health.';
const REPORT_ERROR = 'Unable to load month-end report.';

function hasString(row: Record<string, unknown>, key: string): boolean {
  return typeof row[key] === 'string';
}

function hasNumber(row: Record<string, unknown>, key: string): boolean {
  return typeof row[key] === 'number';
}

function isFinancialHealthPayload(value: unknown): value is FinancialHealthPayload {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return (
    hasString(row, 'currency') &&
    hasNumber(row, 'score') &&
    hasString(row, 'label') &&
    hasNumber(row, 'liquidity_score') &&
    hasNumber(row, 'goal_score') &&
    hasNumber(row, 'spending_score') &&
    hasNumber(row, 'available') &&
    hasNumber(row, 'monthly_income') &&
    hasNumber(row, 'monthly_expense') &&
    hasNumber(row, 'upcoming_commitments') &&
    hasNumber(row, 'goal_saved') &&
    hasNumber(row, 'goal_target') &&
    hasString(row, 'next_move')
  );
}

function isMonthEndReportPayload(value: unknown): value is MonthEndReportPayload {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return (
    hasString(row, 'currency') &&
    hasString(row, 'period_start') &&
    hasString(row, 'period_end') &&
    hasNumber(row, 'discipline_score') &&
    hasNumber(row, 'income') &&
    hasNumber(row, 'expense') &&
    hasNumber(row, 'committed_spending') &&
    hasNumber(row, 'goal_saved_total') &&
    hasString(row, 'narrative')
  );
}

function toFinancialHealth(row: FinancialHealthPayload): FinancialHealth {
  return {
    currency: row.currency,
    score: row.score,
    label: row.label,
    liquidityScore: row.liquidity_score,
    goalScore: row.goal_score,
    spendingScore: row.spending_score,
    available: money(row.available, row.currency),
    monthlyIncome: money(row.monthly_income, row.currency),
    monthlyExpense: money(row.monthly_expense, row.currency),
    upcomingCommitments: money(row.upcoming_commitments, row.currency),
    goalSaved: money(row.goal_saved, row.currency),
    goalTarget: money(row.goal_target, row.currency),
    nextMove: row.next_move,
  };
}

function toMonthEndReport(row: MonthEndReportPayload): MonthEndReport {
  return {
    currency: row.currency,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    disciplineScore: row.discipline_score,
    income: money(row.income, row.currency),
    expense: money(row.expense, row.currency),
    committedSpending: money(row.committed_spending, row.currency),
    goalSavedTotal: money(row.goal_saved_total, row.currency),
    narrative: row.narrative,
  };
}

async function requireSession(): Promise<boolean> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  return !error && Boolean(session);
}

export function useFinancialHealth(): InsightState<FinancialHealth> {
  const [data, setData] = useState<FinancialHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (!(await requireSession())) {
      setData(null);
      setError(AUTH_REQUIRED);
      setIsLoading(false);
      return;
    }

    const { data: payload, error: rpcError } = await supabase.rpc('get_financial_health');
    if (rpcError || !isFinancialHealthPayload(payload)) {
      setData(null);
      setError(HEALTH_ERROR);
      setIsLoading(false);
      return;
    }

    setData(toFinancialHealth(payload));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, isLoading, error, refresh };
}

export function useMonthEndReport(): InsightState<MonthEndReport> {
  const [data, setData] = useState<MonthEndReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (!(await requireSession())) {
      setData(null);
      setError(AUTH_REQUIRED);
      setIsLoading(false);
      return;
    }

    const { data: payload, error: rpcError } = await supabase.rpc('get_month_end_report');
    if (rpcError || !isMonthEndReportPayload(payload)) {
      setData(null);
      setError(REPORT_ERROR);
      setIsLoading(false);
      return;
    }

    setData(toMonthEndReport(payload));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, isLoading, error, refresh };
}
