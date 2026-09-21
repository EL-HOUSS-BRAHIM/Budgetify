-- LYVORA Core V1: explicit account-to-account transfers and recurring entries.

alter table public.transactions
  add column if not exists source_account_id uuid references public.accounts (id) on delete set null,
  add column if not exists destination_account_id uuid references public.accounts (id) on delete set null;

alter table public.transactions
  add constraint transactions_transfer_accounts_check
  check (
    type <> 'transfer'
    or (
      source_account_id is not null
      and destination_account_id is not null
      and source_account_id <> destination_account_id
    )
  );

comment on column public.transactions.source_account_id is
  'Account money leaves for transfers; also identifies the account used by an expense.';
comment on column public.transactions.destination_account_id is
  'Account money enters for transfers; also identifies the account receiving income.';

create table public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  amount bigint not null check (amount > 0),
  currency char(3) not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  type text not null default 'expense' check (type in ('income', 'expense')),
  account_id uuid references public.accounts (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  category_name text not null default 'Other',
  frequency text not null default 'monthly' check (frequency in ('weekly', 'monthly', 'yearly')),
  next_date date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recurring_transactions_name_len check (char_length(name) between 1 and 100)
);

alter table public.recurring_transactions enable row level security;

create policy "recurring_transactions_select_own"
  on public.recurring_transactions for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "recurring_transactions_insert_own"
  on public.recurring_transactions for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "recurring_transactions_update_own"
  on public.recurring_transactions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "recurring_transactions_delete_own"
  on public.recurring_transactions for delete to authenticated
  using ((select auth.uid()) = user_id);

create trigger recurring_transactions_set_updated_at
  before update on public.recurring_transactions
  for each row execute function public.set_updated_at();

create index transactions_source_account_idx on public.transactions (source_account_id);
create index transactions_destination_account_idx on public.transactions (destination_account_id);
create index recurring_transactions_user_next_date_idx
  on public.recurring_transactions (user_id, next_date)
  where is_active;
