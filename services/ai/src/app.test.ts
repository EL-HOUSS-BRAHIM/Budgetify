import { describe, expect, it } from 'vitest';
import { createApp } from './app';

describe('health', () => {
  it('reports ok without any secret configured', async () => {
    const response = await createApp().request('/health');

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok', service: 'budgetify-ai' });
  });

  it('returns a structured 404 for unknown routes', async () => {
    const response = await createApp().request('/nope');

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'not_found' });
  });
});
