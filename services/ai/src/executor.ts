import { createClient } from '@supabase/supabase-js';
import type { Database } from '@budgetify/types';

export interface ExecutionContext {
  supabaseUrl: string;
  userJwt: string;
}

export async function executeToolCall(
  toolName: string,
  args: Record<string, unknown>,
  ctx: ExecutionContext,
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const supabase = createClient<Database>(ctx.supabaseUrl, 'anon-key-placeholder', {
    global: {
      headers: {
        Authorization: `Bearer ${ctx.userJwt}`,
      },
    },
    auth: { persistSession: false },
  });

  try {
    switch (toolName) {
      case 'record_expense': {
        const amountDollars = Number(args['amount'] || 0);
        const amountCents = Math.round(amountDollars * 100);
        const category = String(args['category'] || 'Other');
        const description = String(args['description'] || 'Expense');
        const date = args['date'] ? new Date(String(args['date'])).toISOString() : new Date().toISOString();

        const { data, error } = await supabase.from('transactions').insert({
          amount: amountCents,
          category_name: category,
          description,
          type: 'expense',
          date,
        } as never).select().single();

        if (error) return { success: false, error: error.message };
        return { success: true, data };
      }

      case 'record_income': {
        const amountDollars = Number(args['amount'] || 0);
        const amountCents = Math.round(amountDollars * 100);
        const category = String(args['category'] || 'Salary & Income');
        const description = String(args['description'] || 'Income');
        const date = args['date'] ? new Date(String(args['date'])).toISOString() : new Date().toISOString();

        const { data, error } = await supabase.from('transactions').insert({
          amount: amountCents,
          category_name: category,
          description,
          type: 'income',
          date,
        } as never).select().single();

        if (error) return { success: false, error: error.message };
        return { success: true, data };
      }

      case 'add_planned_item': {
        const amountDollars = Number(args['expected_amount'] || 0);
        const amountCents = Math.round(amountDollars * 100);
        const title = String(args['title'] || 'Planned Item');
        const category = String(args['category'] || 'General');
        const dueDate = args['due_date'] ? String(args['due_date']) : null;
        const isRecurring = Boolean(args['is_recurring']);
        const isUnplanned = Boolean(args['is_unplanned']);

        const { data, error } = await supabase.from('plan_items').insert({
          title,
          expected_amount: amountCents,
          category_name: category,
          due_date: dueDate,
          is_recurring: isRecurring,
          is_unplanned: isUnplanned,
          is_done: isUnplanned ? true : false,
        } as never).select().single();

        if (error) return { success: false, error: error.message };
        return { success: true, data };
      }

      case 'toggle_plan_item_status': {
        const titleOrId = String(args['title_or_id'] || '');
        const isDone = Boolean(args['is_done']);

        // Search for matching item
        const { data: items, error: findError } = await supabase
          .from('plan_items')
          .select('id, title, is_done')
          .or(`id.eq.${titleOrId},title.ilike.%${titleOrId}%`)
          .limit(1);

        if (findError || !items || items.length === 0) {
          return { success: false, error: `Could not find any checklist item matching "${titleOrId}"` };
        }

        const item = items[0] as { id: string; title: string; is_done: boolean };
        const { data, error } = await supabase.rpc('toggle_plan_item' as never, {
          p_item_id: item.id,
        } as never);

        if (error) return { success: false, error: error.message };
        return { success: true, data: { itemTitle: item.title, isDone } };
      }

      case 'get_financial_summary': {
        const { data, error } = await supabase.rpc('get_monthly_summary' as never, {
          target_date: new Date().toISOString().split('T')[0],
        } as never);

        if (error) return { success: false, error: error.message };
        return { success: true, data };
      }

      default:
        return { success: false, error: `Unknown tool: ${toolName}` };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
