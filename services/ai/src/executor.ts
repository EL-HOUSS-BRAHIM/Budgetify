import { createClient } from '@supabase/supabase-js';
import type { Database } from '@budgetify/types';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TOOL_EXECUTION_ERROR = 'Unable to complete this action';

/**
 * Tool arguments arrive from a language model, so a field can be any JSON
 * value. Coercing an object with `String()` would persist "[object Object]"
 * into a user's ledger. Only primitives are accepted; anything else falls
 * back rather than being silently mangled.
 */
function textArg(value: unknown, fallback: string): string {
  if (typeof value === 'string' && value.trim() !== '') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'boolean') return String(value);
  return fallback;
}

function isoDateArg(value: unknown): string {
  const raw = textArg(value, '');
  if (raw === '') return new Date().toISOString();
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function minorUnitsArg(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.round(parsed * 100);
}

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
    accessToken: () => Promise.resolve(ctx.userJwt),
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  try {
    switch (toolName) {
      case 'record_expense': {
        const amountCents = minorUnitsArg(args['amount']);
        const category = textArg(args['category'], 'Other');
        const description = textArg(args['description'], 'Expense');
        const date = isoDateArg(args['date']);

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
        const amountCents = minorUnitsArg(args['amount']);
        const category = textArg(args['category'], 'Salary & Income');
        const description = textArg(args['description'], 'Income');
        const date = isoDateArg(args['date']);

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
        const amountCents = minorUnitsArg(args['expected_amount']);
        const title = textArg(args['title'], 'Planned Item');
        const category = textArg(args['category'], 'General');
        const dueDateArg = textArg(args['due_date'], '');
        const dueDate = dueDateArg === '' ? null : dueDateArg;
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
        const titleOrId = textArg(args['title_or_id'], '');
        const isDone = Boolean(args['is_done']);

        const query = supabase.from('plan_items').select('id, title, is_done');
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
