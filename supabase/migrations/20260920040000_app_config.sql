-- Public, non-secret runtime configuration.
--
-- This table is intentionally limited to values safe for the mobile client to
-- read. Writes are reserved for trusted server-side automation; service_role
-- bypasses RLS and no client write policy is created.

create table public.app_config (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now(),

  constraint app_config_key_format check (key ~ '^[a-z][a-z0-9_]{0,63}$'),
  constraint app_config_value_length check (char_length(value) between 1 and 2048)
);

comment on table public.app_config is
  'Non-secret runtime configuration readable by the mobile client.';

alter table public.app_config enable row level security;

create policy "app_config_public_read"
  on public.app_config for select
  to anon, authenticated
  using (true);

-- There is deliberately no insert, update, or delete policy. Trusted
-- automation writes through service_role, which bypasses RLS.

create trigger app_config_set_updated_at
  before update on public.app_config
  for each row execute function public.set_updated_at();
