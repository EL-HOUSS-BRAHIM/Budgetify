-- Baseline migration for the platform-foundation module.
--
-- This is deliberately minimal: one table, keyed to auth.users, with RLS on.
-- Its purpose is to prove the migration and policy-testing loop works before
-- the ledger module puts real financial data behind it. The identity module
-- extends this table; it does not replace it.

create extension if not exists "pgcrypto" with schema extensions;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  -- ISO 4217. Every Money value in the app is denominated against this.
  currency char(3) not null default 'USD',
  locale text not null default 'en-US',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_currency_is_iso4217 check (currency ~ '^[A-Z]{3}$'),
  constraint profiles_display_name_length check (
    display_name is null or char_length(display_name) between 1 and 80
  )
);

comment on table public.profiles is
  'One row per authenticated user. Created automatically on signup.';

-- Deny by default. Every policy below is an explicit, narrow grant.
alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- No delete policy. Account deletion cascades from auth.users, so a direct
-- delete here would leave an orphaned auth user.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
-- Empty search_path: a trigger running with definer rights must not resolve
-- names through a caller-controlled path.
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
