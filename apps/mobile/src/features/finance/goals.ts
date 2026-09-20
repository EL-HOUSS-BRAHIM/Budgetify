import { money, type Money } from '@budgetify/core';
import { useCallback, useEffect, useState } from 'react';
import type { InsertTables, Tables, UpdateTables } from '@budgetify/types';
import { supabase } from '../../lib/supabase';

export type GoalRow = Tables<'goals'>;

type GoalStrategyStatus = 'funded' | 'no_deadline' | 'on_track' | 'behind' | 'blocked';

export interface GoalStrategy {
  goalId: string;
  name: string;
  currency: string;
  targetAmount: Money;
  currentAmount: Money;
  remainingAmount: Money;
  fundedPercent: number;
  deadline: string | null;
  monthsToDeadline: number | null;
  requiredMonthly: Money;
  recommendedMonthly: Money;
  monthlyCapacity: Money;
  projectedMonths: number | null;
  projectedCompletion: string | null;
  status: GoalStrategyStatus;
  explanation: string;
}

interface GoalStrategyState {
  strategy: GoalStrategy | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface GoalStrategyPayload {
  goal_id: string;
  name: string;
  currency: string;
  target_amount: number;
  current_amount: number;
  remaining_amount: number;
  funded_percent: number;
  deadline: string | null;
  months_to_deadline: number | null;
  required_monthly: number;
  recommended_monthly: number;
  monthly_capacity: number;
  projected_months: number | null;
  projected_completion: string | null;
  status: GoalStrategyStatus;
  explanation: string;
}

const AUTH_REQUIRED = 'Sign in to review this goal strategy.';
const LOAD_ERROR = 'Unable to load goal strategy.';
const SAVE_ERROR = 'Unable to save goal.';

async function requireSession(): Promise<void> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error || !session) throw new Error(AUTH_REQUIRED);
}

export async function createGoal(input: InsertTables<'goals'>): Promise<GoalRow> {
  await requireSession();
  const { data, error } = await supabase.from('goals').insert(input).select().single();
  if (error || !data) throw new Error(SAVE_ERROR);
  return data;
}

export async function updateGoal(goalId: string, input: UpdateTables<'goals'>): Promise<GoalRow> {
  await requireSession();
  const { data, error } = await supabase
    .from('goals')
    .update(input)
    .eq('id', goalId)
    .select()
    .single();
  if (error || !data) throw new Error(SAVE_ERROR);
  return data;
}

function isStrategyStatus(value: unknown): value is GoalStrategyStatus {
  return (
    value === 'funded' ||
    value === 'no_deadline' ||
    value === 'on_track' ||
    value === 'behind' ||
    value === 'blocked'
  );
}

function isGoalStrategyPayload(value: unknown): value is GoalStrategyPayload {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row['goal_id'] === 'string' &&
    typeof row['name'] === 'string' &&
    typeof row['currency'] === 'string' &&
    typeof row['target_amount'] === 'number' &&
    typeof row['current_amount'] === 'number' &&
    typeof row['remaining_amount'] === 'number' &&
    typeof row['funded_percent'] === 'number' &&
    (typeof row['deadline'] === 'string' || row['deadline'] === null) &&
    (typeof row['months_to_deadline'] === 'number' || row['months_to_deadline'] === null) &&
    typeof row['required_monthly'] === 'number' &&
    typeof row['recommended_monthly'] === 'number' &&
    typeof row['monthly_capacity'] === 'number' &&
    (typeof row['projected_months'] === 'number' || row['projected_months'] === null) &&
    (typeof row['projected_completion'] === 'string' || row['projected_completion'] === null) &&
    isStrategyStatus(row['status']) &&
    typeof row['explanation'] === 'string'
  );
}

function toGoalStrategy(row: GoalStrategyPayload): GoalStrategy {
  return {
    goalId: row.goal_id,
    name: row.name,
    currency: row.currency,
    targetAmount: money(row.target_amount, row.currency),
    currentAmount: money(row.current_amount, row.currency),
    remainingAmount: money(row.remaining_amount, row.currency),
    fundedPercent: row.funded_percent,
    deadline: row.deadline,
    monthsToDeadline: row.months_to_deadline,
    requiredMonthly: money(row.required_monthly, row.currency),
    recommendedMonthly: money(row.recommended_monthly, row.currency),
    monthlyCapacity: money(row.monthly_capacity, row.currency),
    projectedMonths: row.projected_months,
    projectedCompletion: row.projected_completion,
    status: row.status,
    explanation: row.explanation,
  };
}

export function useGoalStrategy(goalId: string | undefined): GoalStrategyState {
  const [strategy, setStrategy] = useState<GoalStrategy | null>(null);
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
      setStrategy(null);
      setError(AUTH_REQUIRED);
      setIsLoading(false);
      return;
    }

    if (!goalId) {
      setStrategy(null);
      setError('Choose a goal to review.');
      setIsLoading(false);
      return;
    }

    const { data, error: rpcError } = await supabase.rpc('get_goal_strategy', {
      goal_id: goalId,
    });

    if (rpcError || !isGoalStrategyPayload(data)) {
      setStrategy(null);
      setError(LOAD_ERROR);
      setIsLoading(false);
      return;
    }

    setStrategy(toGoalStrategy(data));
    setIsLoading(false);
  }, [goalId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { strategy, isLoading, error, refresh };
}
