import {
  formatMoney,
  money,
  monthKeyFromDate,
  parseMoney,
  summarizeMonth,
  type LedgerEntry,
  type Money,
  type MonthKey,
} from '@budgetify/core';
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
  /** True when the entry's currency differs from the viewer's selected currency. */
  isForeignCurrency: boolean;
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
  /** Totals for the month on screen, in the viewer's currency. */
  totals: { income: Money; expenses: Money; net: Money };
  refresh: () => Promise<void>;
}

const AUTH_REQUIRED = 'Sign in to manage your ledger.';
const LOAD_ERROR = 'Unable to load transactions.';
const SAVE_ERROR = 'Unable to save this transaction.';

function toTransactionType(value: string): TransactionType {
  if (value === 'income' || value === 'transfer') return value;
  return 'expense';
}

function toLedgerEntry(row: TransactionRow): LedgerEntry {
  return {
    amount: row.amount,
    currency: row.currency,
    type: toTransactionType(row.type),
    categoryName: row.category_name,
    date: row.date,
  };
}

function formatTransactionDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function toListItem(row: TransactionRow, viewerCurrency: string): TransactionListItem {
  const category = row.category_name || 'Uncategorized';
  return {
    id: row.id,
    title: row.description?.trim() || category,
    category,
    amount: money(row.amount, row.currency),
    type: toTransactionType(row.type),
    dateIso: row.date,
    dateLabel: formatTransactionDate(row.date),
    isForeignCurrency: row.currency !== viewerCurrency,
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

  return toListItem(data, input.currency.toUpperCase());
}

function monthWindow(month: MonthKey): { start: string; end: string } {
  const [year, monthNumber] = month.split('-') as [string, string];
  return {
    start: new Date(Number(year), Number(monthNumber) - 1, 1).toISOString(),
    end: new Date(Number(year), Number(monthNumber), 1).toISOString(),
  };
}

export function useTransactions(
  search: string,
  month: MonthKey = monthKeyFromDate(new Date()),
): TransactionState {
  const [transactions, setTransactions] = useState<TransactionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totals, setTotals] = useState<TransactionState['totals']>({
    income: money(0, 'USD'),
    expenses: money(0, 'USD'),
    net: money(0, 'USD'),
  });

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

    const window = monthWindow(month);
    const [profileResult, queryResult] = await Promise.all([
      supabase.from('profiles').select('currency').maybeSingle(),
      supabase
        .from('transactions')
        .select('*')
        .gte('date', window.start)
        .lt('date', window.end)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(200)
        .returns<TransactionRow[]>(),
    ]);

    if (queryResult.error) {
      setTransactions([]);
      setError(LOAD_ERROR);
      setIsLoading(false);
      return;
    }

    const viewerCurrency = (profileResult.data?.currency ?? 'USD').toUpperCase();
    const rows = queryResult.data ?? [];
    const summary = summarizeMonth(rows.map(toLedgerEntry), month, viewerCurrency);

    const normalizedSearch = search.trim().toLowerCase();
    const items = rows
      .map((row) => toListItem(row, viewerCurrency))
      .filter((item) => {
        if (!normalizedSearch) return true;
        return (
          item.title.toLowerCase().includes(normalizedSearch) ||
          item.category.toLowerCase().includes(normalizedSearch)
        );
      });

    setTransactions(items);
    setTotals({
      income: summary.income,
      expenses: summary.expenses,
      net: summary.net,
    });
    setIsLoading(false);
  }, [search, month]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { transactions, isLoading, error, totals, refresh };
}
