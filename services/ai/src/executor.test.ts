import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient } = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({ createClient }));

import { executeToolCall } from './executor';

describe('executeToolCall', () => {
  beforeEach(() => {
    createClient.mockReset();
    createClient.mockReturnValue({});
  });

  it('uses the configured publishable key and caller access token', async () => {
    const userJwt = 'test-user-jwt';

    await executeToolCall(
      'unknown_tool',
      {},
      {
        supabaseUrl: 'https://project.supabase.co',
        supabasePublishableKey: 'sb_publishable_test',
        userJwt,
      },
    );

    expect(createClient).toHaveBeenCalledWith(
      'https://project.supabase.co',
      'sb_publishable_test',
      expect.objectContaining({
        accessToken: expect.any(Function) as unknown,
      }),
    );

    const options = createClient.mock.calls[0]?.[2] as unknown as {
      accessToken: () => Promise<string>;
    };
    await expect(options.accessToken()).resolves.toBe(userJwt);
  });

  it('uses a structured title filter for untrusted plan item text', async () => {
    const limit = vi.fn().mockResolvedValue({ data: [], error: null });
    const ilike = vi.fn().mockReturnValue({ limit });
    const rawOr = vi.fn().mockReturnValue({ limit });
    const select = vi.fn().mockReturnValue({ ilike, or: rawOr });
    const from = vi.fn().mockReturnValue({ select });
    createClient.mockReturnValue({ from });

    const title = 'Rent%,or=(user_id.neq.attacker)';
    await executeToolCall(
      'toggle_plan_item_status',
      { title_or_id: title, is_done: true },
      {
        supabaseUrl: 'https://project.supabase.co',
        supabasePublishableKey: 'sb_publishable_test',
        userJwt: 'test-user-jwt',
      },
    );

    expect(ilike).toHaveBeenCalledWith('title', '%Rent\\%,or=(user\\_id.neq.attacker)%');
    expect(rawOr).not.toHaveBeenCalled();
  });

  it('does not toggle an item already in the requested state', async () => {
    const limit = vi.fn().mockResolvedValue({
      data: [{ id: '44444444-4444-4444-4444-444444444444', title: 'Rent', is_done: true }],
      error: null,
    });
    const ilike = vi.fn().mockReturnValue({ limit });
    const select = vi.fn().mockReturnValue({ ilike });
    const from = vi.fn().mockReturnValue({ select });
    const rpc = vi.fn().mockResolvedValue({ data: null, error: null });
    createClient.mockReturnValue({ from, rpc });

    const result = await executeToolCall(
      'toggle_plan_item_status',
      { title_or_id: 'Rent', is_done: true },
      {
        supabaseUrl: 'https://project.supabase.co',
        supabasePublishableKey: 'sb_publishable_test',
        userJwt: 'test-user-jwt',
      },
    );

    expect(rpc).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      data: { itemTitle: 'Rent', isDone: true },
    });
  });

  it('passes the requested plan item state to the RPC', async () => {
    const itemId = '44444444-4444-4444-4444-444444444444';
    const limit = vi.fn().mockResolvedValue({
      data: [{ id: itemId, title: 'Rent', is_done: false }],
      error: null,
    });
    const ilike = vi.fn().mockReturnValue({ limit });
    const select = vi.fn().mockReturnValue({ ilike });
    const from = vi.fn().mockReturnValue({ select });
    const rpc = vi.fn().mockResolvedValue({ data: null, error: null });
    createClient.mockReturnValue({ from, rpc });

    await executeToolCall(
      'toggle_plan_item_status',
      { title_or_id: 'Rent', is_done: true },
      {
        supabaseUrl: 'https://project.supabase.co',
        supabasePublishableKey: 'sb_publishable_test',
        userJwt: 'test-user-jwt',
      },
    );

    expect(rpc).toHaveBeenCalledWith('toggle_plan_item', {
      p_item_id: itemId,
      p_is_done: true,
    });
  });

  it('does not expose Supabase error details', async () => {
    const single = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'duplicate key value violates internal_constraint' },
    });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    const from = vi.fn().mockReturnValue({ insert });
    createClient.mockReturnValue({ from });

    const result = await executeToolCall(
      'record_expense',
      { amount: 10, category: 'Food & Dining', description: 'Lunch' },
      {
        supabaseUrl: 'https://project.supabase.co',
        supabasePublishableKey: 'sb_publishable_test',
        userJwt: 'test-user-jwt',
      },
    );

    expect(result).toEqual({ success: false, error: 'Unable to complete this action' });
  });
});
