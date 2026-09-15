import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp, SUPABASE_CONFIGURATION_ERROR } from './app';

describe('health', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('reports ok without any secret configured', async () => {
    const response = await createApp().request('/health');

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok', service: 'budgetify-ai' });
  });

  it('lists available tools at /api/tools', async () => {
    const response = await createApp().request('/api/tools');

    expect(response.status).toBe(200);
    const body = (await response.json()) as { tools: unknown[] };
    expect(body.tools.length).toBeGreaterThan(0);
  });

  it('rejects /api/chat without Authorization header', async () => {
    const response = await createApp().request('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'spent $10 on food' }),
    });

    expect(response.status).toBe(401);
  });

  it('reports unavailable when Supabase configuration is missing', async () => {
    vi.stubEnv('SUPABASE_URL', '');
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', '');

    const response = await createApp().request('/api/chat', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer test-user-jwt',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'spent $10 on food' }),
    });

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: SUPABASE_CONFIGURATION_ERROR });
  });

  it('reports unavailable when Supabase configuration uses a placeholder key', async () => {
    vi.stubEnv('SUPABASE_URL', 'https://project.supabase.co');
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_REPLACE_ME');

    const response = await createApp().request('/api/chat', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer test-user-jwt',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'spent $10 on food' }),
    });

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: SUPABASE_CONFIGURATION_ERROR });
  });

  it('rejects invalid caller tokens before executing a tool', async () => {
    vi.stubEnv('SUPABASE_URL', 'https://project.supabase.co');
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');

    const response = await createApp().request('/api/chat', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer test-user-jwt',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'spent $10 on food' }),
    });

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Invalid or expired access token' });
  });

  it('rejects malformed chat payloads after caller authentication', async () => {
    vi.stubEnv('SUPABASE_URL', 'https://project.supabase.co');
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');
    const originalFetch = globalThis.fetch;
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ id: 'user-1' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
      ),
    );

    const response = await createApp().request('/api/chat', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer valid-user-jwt',
        'Content-Type': 'application/json',
      },
      body: '{',
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Invalid chat payload' });
    vi.stubGlobal('fetch', originalFetch);
  });

  it('returns a structured 404 for unknown routes', async () => {
    const response = await createApp().request('/nope');

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'not_found' });
  });

  it('rejects requests from origins outside the allowlist', async () => {
    vi.stubEnv('ALLOWED_ORIGINS', 'https://allowed.example');

    const response = await createApp().request('/api/tools', {
      method: 'GET',
      headers: {
        Origin: 'https://blocked.example',
      },
    });

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Origin is not allowed' });
  });
});
