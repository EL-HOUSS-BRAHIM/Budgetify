import { Hono } from 'hono';

/**
 * The assistant's tool-calling loop lands here in the `assistant` module.
 * For now this exists to prove the build and deploy path before anything
 * depends on it. It must boot with no secrets configured.
 */
export function createApp(): Hono {
  const app = new Hono();

  app.get('/health', (c) => c.json({ status: 'ok', service: 'budgetify-ai' }));

  app.notFound((c) => c.json({ error: 'not_found' }, 404));

  return app;
}
