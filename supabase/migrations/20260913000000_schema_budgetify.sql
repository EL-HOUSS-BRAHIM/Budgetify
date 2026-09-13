-- Migration: Full Budgetify Schema
-- Tables: accounts, categories, transactions, budgets, plan_items, goals
-- Features: RLS, Triggers, Views, RPCs for summaries and plan checklist materialization

-- 1. ACCOUNTS (Cash, Checking, Credit, Savings, etc.)
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  type text not null default 'checking' check (type in ('checking', 'savings', 'credit', 'cash', 'investment', 'other')),
  currency char(3) not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  current_balance bigint not null default 0, -- in minor units (cents)
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint accounts_name_len check (char_length(name) between 1 and 100)
);

comment on table public.accounts is 'Financial accounts owned by a user (e.g. Bank checking, Wallet cash).';

alter table public.accounts enable row level security;

create policy "accounts_select_own" on public.accounts for select to authenticated using ((select auth.uid()) = user_id);
create policy "accounts_insert_own" on public.accounts for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "accounts_update_own" on public.accounts for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "accounts_delete_own" on public.accounts for delete to authenticated using ((select auth.uid()) = user_id);

create trigger accounts_set_updated_at
  before update on public.accounts
  for each row execute function public.set_updated_at();


-- 2. CATEGORIES
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade, -- null indicates a global system default category
  name text not null,
  icon text not null default '📦',
  color text not null default '#10B981',
  type text not null default 'expense' check (type in ('expense', 'income', 'transfer')),
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  constraint categories_name_len check (char_length(name) between 1 and 80)
);

comment on table public.categories is 'Expense and income categories. System categories are accessible to all users.';

alter table public.categories enable row level security;

create policy "categories_select_own_or_system" on public.categories for select to authenticated
  using (is_system = true or (select auth.uid()) = user_id);

create policy "categories_insert_own" on public.categories for insert to authenticated
  with check ((select auth.uid()) = user_id and is_system = false);

create policy "categories_update_own" on public.categories for update to authenticated
  using ((select auth.uid()) = user_id and is_system = false)
  with check ((select auth.uid()) = user_id and is_system = false);

create policy "categories_delete_own" on public.categories for delete to authenticated
  using ((select auth.uid()) = user_id and is_system = false);


-- 3. BUDGETS
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  category_name text not null,
  amount bigint not null check (amount >= 0), -- monthly limit in minor units (cents)
  currency char(3) not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  period text not null default 'monthly' check (period in ('monthly', 'weekly', 'yearly')),
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.budgets is 'Spending limits configured per category for a date period.';

alter table public.budgets enable row level security;

create policy "budgets_select_own" on public.budgets for select to authenticated using ((select auth.uid()) = user_id);
create policy "budgets_insert_own" on public.budgets for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "budgets_update_own" on public.budgets for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "budgets_delete_own" on public.budgets for delete to authenticated using ((select auth.uid()) = user_id);

create trigger budgets_set_updated_at
  before update on public.budgets
  for each row execute function public.set_updated_at();


-- 4. TRANSACTIONS
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  account_id uuid references public.accounts (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  category_name text not null,
  amount bigint not null check (amount > 0), -- minor units, strictly positive; type indicates direction
  currency char(3) not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  type text not null default 'expense' check (type in ('expense', 'income', 'transfer')),
  description text,
  date timestamptz not null default now(),
  is_planned boolean not null default false,
  planned_item_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.transactions is 'Actual financial transactions (expenses and incomes). Single source of truth.';

alter table public.transactions enable row level security;

create policy "transactions_select_own" on public.transactions for select to authenticated using ((select auth.uid()) = user_id);
create policy "transactions_insert_own" on public.transactions for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "transactions_update_own" on public.transactions for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "transactions_delete_own" on public.transactions for delete to authenticated using ((select auth.uid()) = user_id);

create trigger transactions_set_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();


-- 5. PLAN ITEMS (Checklist, Recurring Bills, Planned/Unplanned Spend)
create table if not exists public.plan_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  expected_amount bigint not null check (expected_amount >= 0), -- in minor units
  currency char(3) not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  category_id uuid references public.categories (id) on delete set null,
  category_name text not null default 'General',
  due_date date,
  period text not null default 'monthly' check (period in ('monthly', 'weekly', 'yearly', 'once')),
  is_recurring boolean not null default false,
  is_done boolean not null default false,
  done_at timestamptz,
  is_unplanned boolean not null default false,
  transaction_id uuid references public.transactions (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.plan_items is 'Monthly checklist items, planned expenses, and recurring bills that can be checked done/undone.';

alter table public.plan_items enable row level security;

create policy "plan_items_select_own" on public.plan_items for select to authenticated using ((select auth.uid()) = user_id);
create policy "plan_items_insert_own" on public.plan_items for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "plan_items_update_own" on public.plan_items for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "plan_items_delete_own" on public.plan_items for delete to authenticated using ((select auth.uid()) = user_id);

create trigger plan_items_set_updated_at
  before update on public.plan_items
  for each row execute function public.set_updated_at();


-- 6. GOALS (Savings Goals)
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  target_amount bigint not null check (target_amount > 0),
  current_amount bigint not null default 0 check (current_amount >= 0),
  currency char(3) not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  deadline date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.goals is 'User savings goals with deadline and current progress.';

alter table public.goals enable row level security;

create policy "goals_select_own" on public.goals for select to authenticated using ((select auth.uid()) = user_id);
create policy "goals_insert_own" on public.goals for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "goals_update_own" on public.goals for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "goals_delete_own" on public.goals for delete to authenticated using ((select auth.uid()) = user_id);

create trigger goals_set_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();


-- 7. DEFAULT SYSTEM CATEGORIES
insert into public.categories (name, icon, color, type, is_system)
values
  ('Food & Dining', '🍔', '#F59E0B', 'expense', true),
  ('Housing & Rent', '🏠', '#3B82F6', 'expense', true),
  ('Transportation', '🚗', '#8B5CF6', 'expense', true),
  ('Utilities & Bills', '💡', '#EF4444', 'expense', true),
  ('Entertainment', '🎬', '#EC4899', 'expense', true),
  ('Shopping', '🛍️', '#10B981', 'expense', true),
  ('Healthcare', '💊', '#06B6D4', 'expense', true),
  ('Salary & Income', '💵', '#10B981', 'income', true),
  ('Investments', '📈', '#6366F1', 'income', true),
  ('Other', '📦', '#64748B', 'expense', true)
on conflict do nothing;


-- 8. RPC: Monthly Financial Summary
create or replace function public.get_monthly_summary(target_date date default current_date)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_start_month timestamptz;
  v_end_month timestamptz;
  v_total_income bigint := 0;
  v_total_expense bigint := 0;
  v_total_budget bigint := 0;
  v_category_breakdown json;
  v_plan_summary json;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  v_start_month := date_trunc('month', target_date::timestamptz);
  v_end_month := (date_trunc('month', target_date::timestamptz) + interval '1 month');

  -- Sum of expenses and income
  select
    coalesce(sum(case when type = 'income' then amount else 0 end), 0),
    coalesce(sum(case when type = 'expense' then amount else 0 end), 0)
  into v_total_income, v_total_expense
  from public.transactions
  where user_id = v_user_id
    and date >= v_start_month
    and date < v_end_month;

  -- Total budget for current month
  select coalesce(sum(amount), 0)
  into v_total_budget
  from public.budgets
  where user_id = v_user_id
    and start_date <= target_date
    and end_date >= target_date;

  -- Category breakdown
  select json_agg(cat_row)
  into v_category_breakdown
  from (
    select
      category_name,
      sum(amount) as total_spent,
      count(*) as transaction_count
    from public.transactions
    where user_id = v_user_id
      and type = 'expense'
      and date >= v_start_month
      and date < v_end_month
    group by category_name
    order by total_spent desc
  ) cat_row;

  -- Plan items summary
  select json_build_object(
    'total_items', count(*),
    'completed_items', count(*) filter (where is_done = true),
    'remaining_amount', coalesce(sum(case when is_done = false then expected_amount else 0 end), 0)
  )
  into v_plan_summary
  from public.plan_items
  where user_id = v_user_id
    and (due_date is null or (due_date >= v_start_month::date and due_date < v_end_month::date));

  return json_build_object(
    'period_start', v_start_month,
    'period_end', v_end_month,
    'total_income', v_total_income,
    'total_expense', v_total_expense,
    'net_savings', (v_total_income - v_total_expense),
    'total_budget', v_total_budget,
    'remaining_budget', (v_total_budget - v_total_expense),
    'categories', coalesce(v_category_breakdown, '[]'::json),
    'plan', coalesce(v_plan_summary, '{}'::json)
  );
end;
$$;


-- 9. RPC: Toggle Plan Item Done & Optionally Materialize Transaction
create or replace function public.toggle_plan_item(
  p_item_id uuid,
  p_account_id uuid default null
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_item record;
  v_new_is_done boolean;
  v_tx_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  select * into v_item
  from public.plan_items
  where id = p_item_id and user_id = v_user_id;

  if not found then
    raise exception 'Plan item not found';
  end if;

  v_new_is_done := not v_item.is_done;

  if v_new_is_done then
    -- When marking DONE: create a corresponding transaction if not already linked
    if v_item.transaction_id is null and v_item.expected_amount > 0 then
      insert into public.transactions (
        user_id,
        account_id,
        category_id,
        category_name,
        amount,
        currency,
        type,
        description,
        is_planned,
        planned_item_id,
        date
      )
      values (
        v_user_id,
        p_account_id,
        v_item.category_id,
        v_item.category_name,
        v_item.expected_amount,
        v_item.currency,
        'expense',
        v_item.title,
        true,
        v_item.id,
        now()
      )
      returning id into v_tx_id;
    else
      v_tx_id := v_item.transaction_id;
    end if;

    update public.plan_items
    set is_done = true,
        done_at = now(),
        transaction_id = v_tx_id
    where id = p_item_id;

  else
    -- When marking UNDONE: optionally delete or unlink the auto-generated transaction
    if v_item.transaction_id is not null then
      delete from public.transactions
      where id = v_item.transaction_id and user_id = v_user_id;
    end if;

    update public.plan_items
    set is_done = false,
        done_at = null,
        transaction_id = null
    where id = p_item_id;
  end if;

  return json_build_object(
    'id', p_item_id,
    'is_done', v_new_is_done,
    'transaction_id', v_tx_id
  );
end;
$$;
