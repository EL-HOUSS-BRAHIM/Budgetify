import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { executeToolCall } from './executor';
import { ToolDefinitions } from './tools';

const DEFAULT_ALLOWED_ORIGINS = 'http://localhost:3000,http://localhost:8081';
export const SUPABASE_CONFIGURATION_ERROR = 'Supabase server configuration is missing or invalid';

const ChatBodySchema = z.object({
  message: z.string().trim().min(1).max(2000),
  history: z
    .array(
      z.object({ role: z.enum(['user', 'assistant', 'system']), content: z.string().max(4000) }),
    )
    .max(50)
    .optional(),
});

const SupabaseConfigSchema = z.object({
  SUPABASE_URL: z
    .string()
    .url()
    .refine((value) => value.startsWith('https://'), {
      message: 'SUPABASE_URL must start with https://',
    }),
  SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .regex(/^sb_publishable_[A-Za-z0-9._-]+$/)
    .refine((value) => !value.includes('REPLACE_ME'), {
      message: 'SUPABASE_PUBLISHABLE_KEY must be a real publishable key',
    }),
});

function parseAllowedOrigins(rawValue: string | undefined): string[] {
  return (rawValue ?? DEFAULT_ALLOWED_ORIGINS)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getSupabaseConfig(
  env: NodeJS.ProcessEnv,
): { supabaseUrl: string; supabasePublishableKey: string } | null {
  const parsed = SupabaseConfigSchema.safeParse(env);
  if (!parsed.success) {
    return null;
  }

  return {
    supabaseUrl: parsed.data.SUPABASE_URL,
    supabasePublishableKey: parsed.data.SUPABASE_PUBLISHABLE_KEY,
  };
}

export function assertSupabaseConfig(env: NodeJS.ProcessEnv = process.env): {
  supabaseUrl: string;
  supabasePublishableKey: string;
} {
  const config = getSupabaseConfig(env);
  if (!config) {
    throw new Error(SUPABASE_CONFIGURATION_ERROR);
  }

  return config;
}

async function authenticateCaller(
  supabaseUrl: string,
  supabasePublishableKey: string,
  userJwt: string,
): Promise<boolean> {
  const supabase = createClient(supabaseUrl, supabasePublishableKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });
  const { data, error } = await supabase.auth.getUser(userJwt);
  return !error && Boolean(data.user);
}

/**
 * The assistant's tool-calling loop and voice/text chatbot endpoint.
 * Accepts user messages, parses intent, and invokes Supabase RPCs/tables.
 */
export function createApp(): Hono {
  const app = new Hono();
  const allowedOrigins = parseAllowedOrigins(process.env['ALLOWED_ORIGINS']);

  app.use('/api/*', async (c, next) => {
    const origin = c.req.header('Origin');
    if (origin && !allowedOrigins.includes(origin)) {
      return c.json({ error: 'Origin is not allowed' }, 403);
    }

    await next();
  });

  app.use(
    '*',
    cors({
      origin: (origin) => (!origin || allowedOrigins.includes(origin) ? origin : ''),
      allowHeaders: ['Content-Type', 'Authorization'],
      allowMethods: ['GET', 'POST', 'OPTIONS'],
    }),
  );

  app.get('/health', (c) => c.json({ status: 'ok', service: 'budgetify-ai' }));

  app.get('/api/tools', (c) => c.json({ tools: ToolDefinitions }));

  // Chat & Voice action orchestration endpoint
  app.post('/api/chat', async (c) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Missing or invalid Authorization header' }, 401);
    }
    const userJwt = authHeader.replace('Bearer ', '');
    const supabaseConfig = getSupabaseConfig(process.env);
    if (!supabaseConfig) {
      return c.json({ error: SUPABASE_CONFIGURATION_ERROR }, 503);
    }
    const { supabaseUrl, supabasePublishableKey } = supabaseConfig;
    if (!(await authenticateCaller(supabaseUrl, supabasePublishableKey, userJwt))) {
      return c.json({ error: 'Invalid or expired access token' }, 401);
    }
    const executionContext = { supabaseUrl, supabasePublishableKey, userJwt };

    try {
      let rawBody: unknown;
      try {
        rawBody = await c.req.json();
      } catch {
        return c.json({ error: 'Invalid chat payload' }, 400);
      }
      const parsedBody = ChatBodySchema.safeParse(rawBody);
      if (!parsedBody.success) {
        return c.json({ error: 'Invalid chat payload' }, 400);
      }
      const userMessage = parsedBody.data.message;

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
