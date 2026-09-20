alter table public.profiles
  add column if not exists onboarding_priority text not null default 'safety_net'
    check (onboarding_priority in ('safety_net', 'goal', 'patterns')),
  add column if not exists safety_buffer_amount bigint not null default 0
    check (safety_buffer_amount >= 0),
  add column if not exists income_cadence text not null default 'monthly'
    check (income_cadence in ('weekly', 'biweekly', 'monthly', 'irregular')),
  add column if not exists first_signal text not null default 'safe_to_spend'
    check (first_signal in ('safe_to_spend', 'commitments', 'insight')),
  add column if not exists onboarding_completed_at timestamptz;