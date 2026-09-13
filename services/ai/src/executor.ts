import { createClient } from '@supabase/supabase-js';
import type { Database } from '@budgetify/types';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TOOL_EXECUTION_ERROR = 'Unable to complete this action';

export interface ExecutionContext {
  supabaseUrl: string;
  supabasePublishableKey: string;
  userJwt: string;
}

export async function executeToolCall(
  toolName: string,
  args: Record<string, unknown>,
  ctx: ExecutionContext,
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const supabase = createClient<Database>(ctx.supabaseUrl, ctx.supabasePublishableKey, {
    accessToken: async () => ctx.userJwt,
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  try {
    switch (toolName) {
      case 'record_expense': {
        const amountDollars = Number(args['amount'] || 0);
        const amountCents = Math.round(amountDollars * 100);
        const category = String(args['category'] || 'Other');
        const description = String(args['description'] || 'Expense');
        const date = args['date']
          ? new Date(String(args['date'])).toISOString()
          : new Date().toISOString();

        const { data, error } = await supabase
          .from('transactions')
          .insert({
            amount: amountCents,
            category_name: category,
            description,
            type: 'expense',
            date,
          } as never)
          .select()
          .single();

        if (error) return { success: false, error: TOOL_EXECUTION_ERROR };
        return { success: true, data };
      }

      case 'record_income': {
        const amountDollars = Number(args['amount'] || 0);
        const amountCents = Math.round(amountDollars * 100);
        const category = String(args['category'] || 'Salary & Income');
        const description = String(args['description'] || 'Income');
        const date = args['date']
          ? new Date(String(args['date'])).toISOString()
          : new Date().toISOString();

        const { data, error } = await supabase
          .from('transactions')
          .insert({
            amount: amountCents,
            category_name: category,
            description,
            type: 'income',
            date,
          } as never)
          .select()
          .single();

        if (error) return { success: false, error: TOOL_EXECUTION_ERROR };
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

        const { data, error } = await supabase
          .from('plan_items')
          .insert({
            title,
            expected_amount: amountCents,
            category_name: category,
            due_date: dueDate,
            is_recurring: isRecurring,
            is_unplanned: isUnplanned,
            is_done: isUnplanned ? true : false,
          } as never)
          .select()
          .single();

        if (error) return { success: false, error: TOOL_EXECUTION_ERROR };
        return { success: true, data };
      }

      case 'toggle_plan_item_status': {
        const titleOrId = String(args['title_or_id'] || '');
        const isDone = Boolean(args['is_done']);

        const query = supabase
          .from('plan_items')
          .select('id, title, is_done');
        const itemLookup = UUID_PATTERN.test(titleOrId)
          ? query.eq('id', titleOrId)
          : query.ilike('title', `%${titleOrId.replace(/[\\%_]/g, '\\$&')}%`);
        const { data: items, error: findError } = await itemLookup.limit(1);

        const item = items?.[0] as { id: string; title: string; is_done: boolean } | undefined;
        if (findError || !item) {
          return {
            success: false,
            error: `Could not find any checklist item matching "${titleOrId}"`,
          };
        }

        if (item.is_done === isDone) {
          return { success: true, data: { itemTitle: item.title, isDone } };
        }

        const { error } = await supabase.rpc(
          'toggle_plan_item' as never,
          {
            p_item_id: item.id,
            p_is_done: isDone,
          } as never,
        );

        if (error) return { success: false, error: TOOL_EXECUTION_ERROR };
        return { success: true, data: { itemTitle: item.title, isDone } };
      }

      case 'get_financial_summary': {
        const { data, error } = await supabase.rpc(
          'get_monthly_summary' as never,
          {
            target_date: new Date().toISOString().split('T')[0],
          } as never,
        );

        if (error) return { success: false, error: TOOL_EXECUTION_ERROR };
        return { success: true, data };
      }

      default:
        return { success: false, error: `Unknown tool: ${toolName}` };
    }
  } catch {
    return { success: false, error: TOOL_EXECUTION_ERROR };
  }
}
