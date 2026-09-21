import { formatMoney, money, parseMoney, type Money } from '@budgetify/core';
import { useCallback, useEffect, useState } from 'react';
import type { InsertTables, Tables } from '@budgetify/types';
import { supabase } from '../../lib/supabase';

export type TransactionType = 'expense' | 'income' | 'transfer';
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
  categoryId?: string;
  currency: string;
  date?: Date;
  sourceAccountId?: string;
  destinationAccountId?: string;
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
  if (value === 'income' || value === 'transfer') return value;
  return 'expense';
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
  const sign = item.type === 'expense' ? '-' : item.type === 'income' ? '+' : '↔';
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

  if ((input.type === 'expense' || input.type === 'income') && !input.sourceAccountId) {
    throw new Error('Choose an account for this transaction.');
  }

  if (input.type === 'transfer') {
    if (!input.sourceAccountId || !input.destinationAccountId) {
      throw new Error('Choose source and destination accounts for this transfer.');
    }
    if (input.sourceAccountId === input.destinationAccountId) {
      throw new Error('Transfer accounts must be different.');
    }
  }

  const insert: InsertTables<'transactions'> = {
    amount: parsedAmount.amount,
    category_name: input.categoryName.trim() || 'Other',
    category_id: input.categoryId ?? null,
    currency: parsedAmount.currency,
    date: (input.date ?? new Date()).toISOString(),
    description: input.title.trim(),
    type: input.type,
    account_id: input.sourceAccountId ?? null,
    source_account_id: input.type === 'income' ? null : (input.sourceAccountId ?? null),
    destination_account_id:
      input.type === 'income'
        ? (input.sourceAccountId ?? null)
        : input.type === 'transfer'
          ? (input.destinationAccountId ?? null)
          : null,
  };

  const { data, error } = await supabase.from('transactions').insert(insert).select().single();

  if (error || !data) {
    throw new Error(SAVE_ERROR);
  }

  return toListItem(data);
}

export function useTransactions(search: string, targetDate = new Date()): TransactionState {
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

    const start = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1).toISOString();
    const end = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 1).toISOString();
    const { data, error: queryError } = await supabase
      .from('transactions')
      .select('*')
      .gte('date', start)
      .lt('date', end)
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
  }, [search, targetDate]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { transactions, isLoading, error, refresh };
}
