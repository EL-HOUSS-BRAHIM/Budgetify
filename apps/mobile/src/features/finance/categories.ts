import { useCallback, useEffect, useState } from 'react';
import type { InsertTables, Tables } from '@budgetify/types';
import { supabase } from '../../lib/supabase';

export type CategoryRow = Tables<'categories'>;

export function useCategories(type: 'expense' | 'income' = 'expense') {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    setIsLoading(true);
    const { data, error: queryError } = await supabase
      .from('categories')
      .select('*')
      .eq('type', type)
      .order('is_system', { ascending: false })
      .order('name', { ascending: true });
    setCategories(data ?? []);
    setError(queryError ? 'Unable to load categories.' : null);
    setIsLoading(false);
  }, [type]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  return { categories, isLoading, error, refresh };
}

export async function createCategory(input: InsertTables<'categories'>): Promise<CategoryRow> {
  const { data, error } = await supabase.from('categories').insert(input).select().single();
  if (error || !data) throw new Error('Unable to create category.');
  return data;
}
