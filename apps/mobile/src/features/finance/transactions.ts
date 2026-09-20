import { formatMoney, money, parseMoney, type Money } from '@budgetify/core';
import { useCallback, useEffect, useState } from 'react';
import type { InsertTables, Tables } from '@budgetify/types';
import { supabase } from '../../lib/supabase';

export type TransactionType = 'expense' | 'income';
export type TransactionRow = Tables<'transactions'>;

export interface TransactionListItem {
  id: string;
  title: string;
  category: string;
  amount: Money;
  type: TransactionType;
  dateIso: string;
  dateLabel: string;
}

export interface CreateTransactionInput {
  type: TransactionType;
  title: string;
  amountText: string;
  categoryName: string;
  currency: string;
  date?: Date;
}

interface TransactionState {
  transactions: TransactionListItem[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const AUTH_REQUIRED = 'Sign in to manage your ledger.';
const LOAD_ERROR = 'Unable to load transactions.';
const SAVE_ERROR = 'Unable to save this transaction.';

function toTransactionType(value: string): TransactionType {
  return value === 'income' ? 'income' : 'expense';
}

function formatTransactionDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function toListItem(row: TransactionRow): TransactionListItem {
  const category = row.category_name || 'Uncategorized';
  return {
    id: row.id,
    title: row.description?.trim() || category,
    category,
    amount: money(row.amount, row.currency),
    type: toTransactionType(row.type),
    dateIso: row.date,
    dateLabel: formatTransactionDate(row.date),
  };
}

export function formatTransactionAmount(item: TransactionListItem): string {
  const sign = item.type === 'expense' ? '-' : '+';
  return `${sign}${formatMoney(item.amount)}`;
}

export async function createTransaction(
  input: CreateTransactionInput,
): Promise<TransactionListItem> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error(AUTH_REQUIRED);
  }

  const parsedAmount = parseMoney(input.amountText, input.currency);
  if (parsedAmount.amount <= 0) {
    throw new Error('Amount must be greater than zero.');
  }

  const insert: InsertTables<'transactions'> = {
    amount: parsedAmount.amount,
    category_name: input.categoryName.trim() || 'Other',
    currency: parsedAmount.currency,
    date: (input.date ?? new Date()).toISOString(),
    description: input.title.trim(),
    type: input.type,
  };

  const { data, error } = await supabase.from('transactions').insert(insert).select().single();

  if (error || !data) {
    throw new Error(SAVE_ERROR);
  }

  return toListItem(data);
}

export function useTransactions(search: string): TransactionState {
  const [transactions, setTransactions] = useState<TransactionListItem[]>([]);
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
      setTransactions([]);
      setError(AUTH_REQUIRED);
      setIsLoading(false);
      return;
    }

    const { data, error: queryError } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100);

    if (queryError) {
      setTransactions([]);
      setError(LOAD_ERROR);
      setIsLoading(false);
      return;
    }

    const normalizedSearch = search.trim().toLowerCase();
    const items = (data ?? []).map(toListItem).filter((item) => {
      if (!normalizedSearch) return true;
      return (
        item.title.toLowerCase().includes(normalizedSearch) ||
        item.category.toLowerCase().includes(normalizedSearch)
      );
    });

    setTransactions(items);
    setIsLoading(false);
  }, [search]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { transactions, isLoading, error, refresh };
}
