import { money, type Money } from '@budgetify/core';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export type SalaryAllocationStatus = 'empty' | 'ready';

export interface SalaryAllocation {
  currency: string;
  sourceAmount: Money;
  sourceLabel: string;
  fixedBills: Money;
  goals: Money;
  reserve: Money;
  safetyBuffer: Money;
  safeToSpend: Money;
  goalNames: string;
  billNames: string;
  status: SalaryAllocationStatus;
  explanation: string;
}

interface SalaryAllocationState {
  allocation: SalaryAllocation | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface SalaryAllocationPayload {
  currency: string;
  source_amount: number;
  source_label: string;
  fixed_bills: number;
  goals: number;
  reserve: number;
  safety_buffer: number;
  safe_to_spend: number;
  goal_names: string;
  bill_names: string;
  status: SalaryAllocationStatus;
  explanation: string;
}

const AUTH_REQUIRED = 'Sign in to review salary allocation.';
const LOAD_ERROR = 'Unable to load salary allocation.';

function isAllocationStatus(value: unknown): value is SalaryAllocationStatus {
  return value === 'empty' || value === 'ready';
}

function isSalaryAllocationPayload(value: unknown): value is SalaryAllocationPayload {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row['currency'] === 'string' &&
    typeof row['source_amount'] === 'number' &&
    typeof row['source_label'] === 'string' &&
    typeof row['fixed_bills'] === 'number' &&
    typeof row['goals'] === 'number' &&
    typeof row['reserve'] === 'number' &&
    typeof row['safety_buffer'] === 'number' &&
    typeof row['safe_to_spend'] === 'number' &&
    typeof row['goal_names'] === 'string' &&
    typeof row['bill_names'] === 'string' &&
    isAllocationStatus(row['status']) &&
    typeof row['explanation'] === 'string'
  );
}

function toSalaryAllocation(row: SalaryAllocationPayload): SalaryAllocation {
  return {
    currency: row.currency,
    sourceAmount: money(row.source_amount, row.currency),
    sourceLabel: row.source_label,
    fixedBills: money(row.fixed_bills, row.currency),
    goals: money(row.goals, row.currency),
    reserve: money(row.reserve, row.currency),
    safetyBuffer: money(row.safety_buffer, row.currency),
    safeToSpend: money(row.safe_to_spend, row.currency),
    goalNames: row.goal_names,
    billNames: row.bill_names,
    status: row.status,
    explanation: row.explanation,
  };
}

export function useSalaryAllocation(): SalaryAllocationState {
  const [allocation, setAllocation] = useState<SalaryAllocation | null>(null);
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
      setAllocation(null);
      setError(AUTH_REQUIRED);
      setIsLoading(false);
      return;
    }

    const { data, error: rpcError } = await supabase.rpc('get_salary_allocation');
    if (rpcError || !isSalaryAllocationPayload(data)) {
      setAllocation(null);
      setError(LOAD_ERROR);
      setIsLoading(false);
      return;
    }

    setAllocation(toSalaryAllocation(data));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { allocation, isLoading, error, refresh };
}
