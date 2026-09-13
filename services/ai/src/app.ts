import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { executeToolCall } from './executor';
import { ToolDefinitions } from './tools';

/**
 * The assistant's tool-calling loop and voice/text chatbot endpoint.
 * Accepts user messages, parses intent, and invokes Supabase RPCs/tables.
 */
export function createApp(): Hono {
  const app = new Hono();

  app.use('*', cors());

  app.get('/health', (c) => c.json({ status: 'ok', service: 'budgetify-ai' }));

  app.get('/api/tools', (c) => c.json({ tools: ToolDefinitions }));

  // Chat & Voice action orchestration endpoint
  app.post('/api/chat', async (c) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Missing or invalid Authorization header' }, 401);
    }
    const userJwt = authHeader.replace('Bearer ', '');
    const supabaseUrl = process.env['SUPABASE_URL'];
    const supabasePublishableKey = process.env['SUPABASE_PUBLISHABLE_KEY'];
    if (!supabaseUrl || !supabasePublishableKey) {
      return c.json({ error: 'Supabase server configuration is missing' }, 503);
    }
    const executionContext = { supabaseUrl, supabasePublishableKey, userJwt };

    try {
      const body = await c.req.json<{
        message: string;
        history?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
      }>();

      const userMessage = body.message;
      if (!userMessage) {
        return c.json({ error: 'message is required' }, 400);
      }

      // Fast intent matching for common voice/text budgeting commands
      const lower = userMessage.toLowerCase();

      // 1. Expense intent (e.g. "spent $25 on groceries", "add expense 15 coffee")
      const expenseMatch = lower.match(
        /(?:spent|pay|paid|bought|expense|add expense)\s+\$?([0-9]+(?:\.[0-9]{1,2})?)\s+(?:on|for|at)?\s*([a-zA-Z\s&]+)?/i,
      );
      if (expenseMatch) {
        const amount = parseFloat(expenseMatch[1] || '0');
        const description = (expenseMatch[2] || 'Expense').trim();
        let category = 'Other';
        if (/grocer|food|dinner|lunch|coffee|eat|burger|restaurant/i.test(description))
          category = 'Food & Dining';
        else if (/uber|taxi|gas|metro|bus|train|transport/i.test(description))
          category = 'Transportation';
        else if (/electric|rent|water|wifi|internet|utility/i.test(description))
          category = 'Housing & Rent';
        else if (/netflix|movie|game|fun|entertainment/i.test(description))
          category = 'Entertainment';

        const result = await executeToolCall(
          'record_expense',
          { amount, category, description },
          executionContext,
        );
        return c.json({
          reply: `Recorded an expense of $${amount.toFixed(2)} for ${description} under ${category}.`,
          toolCalled: 'record_expense',
          result,
        });
      }

      // 2. Mark checklist / bill done or undone (e.g. "mark rent done", "paid wifi bill", "mark electricity undone")
      const isMarkDone =
        /mark\s+([a-zA-Z0-9\s]+)\s+(?:done|paid|complete)|paid\s+([a-zA-Z0-9\s]+)/i.exec(lower);
      const isMarkUndone =
        /mark\s+([a-zA-Z0-9\s]+)\s+(?:undone|unpaid|pending)|unpay\s+([a-zA-Z0-9\s]+)/i.exec(lower);

      if (isMarkDone || isMarkUndone) {
        const targetTitle = (
          isMarkDone?.[1] ??
          isMarkDone?.[2] ??
          isMarkUndone?.[1] ??
          isMarkUndone?.[2] ??
          ''
        ).trim();
        const isDone = Boolean(isMarkDone);
        const result = await executeToolCall(
          'toggle_plan_item_status',
          { title_or_id: targetTitle, is_done: isDone },
          executionContext,
        );
        return c.json({
          reply: result.success
            ? `Marked "${targetTitle}" as ${isDone ? 'completed and paid' : 'pending'}.`
            : `Could not update item: ${result.error}`,
          toolCalled: 'toggle_plan_item_status',
          result,
        });
      }

      // 3. Unplanned or planned item add (e.g. "add unplanned expense $80 for car repair", "add bill $65 internet due tomorrow")
      const planMatch = lower.match(
        /(?:add planned|add bill|add unplanned|plan|remind me to pay)\s+(?:bill|item|expense)?\s*([a-zA-Z\s]+)?\s*\$?([0-9]+(?:\.[0-9]{1,2})?)/i,
      );
      if (planMatch) {
        const title = (planMatch[1] || 'Planned item').trim();
        const amount = parseFloat(planMatch[2] || '0');
        const isUnplanned = lower.includes('unplanned');
        const result = await executeToolCall(
          'add_planned_item',
          { title, expected_amount: amount, is_unplanned: isUnplanned },
          executionContext,
        );
        return c.json({
          reply: `Added ${isUnplanned ? 'unplanned' : 'planned'} item "${title}" for $${amount.toFixed(2)}.`,
          toolCalled: 'add_planned_item',
          result,
        });
      }

      // 4. Financial overview summary (e.g. "how much did I spend", "summary", "budget status")
      if (
        lower.includes('summary') ||
        lower.includes('balance') ||
        lower.includes('budget') ||
        lower.includes('spent') ||
        lower.includes('how much')
      ) {
        const result = await executeToolCall('get_financial_summary', {}, executionContext);
        return c.json({
          reply: `Retrieved your current monthly financial overview.`,
          toolCalled: 'get_financial_summary',
          result,
        });
      }

      // Generic response with suggested commands
      return c.json({
        reply: `I can help manage your finances! You can say things like:\n• "Spent $18 on lunch"\n• "Mark Internet bill done"\n• "Add unplanned expense $50 for pharmacy"\n• "Show my monthly summary"`,
        toolCalled: null,
      });
    } catch {
      return c.json({ error: 'Unable to process request' }, 500);
    }
  });

  app.notFound((c) => c.json({ error: 'not_found' }, 404));

  return app;
}
