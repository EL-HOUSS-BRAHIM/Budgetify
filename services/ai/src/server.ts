import { serve } from '@hono/node-server';
import { assertSupabaseConfig, createApp, SUPABASE_CONFIGURATION_ERROR } from './app';

const port = Number(process.env['PORT'] ?? 8787);

try {
  assertSupabaseConfig();
} catch {
  console.error(SUPABASE_CONFIGURATION_ERROR);
  process.exit(1);
}

serve({ fetch: createApp().fetch, port }, (info) => {
  console.log(`budgetify-ai listening on http://localhost:${info.port}`);
});
