-- RLS and ownership defaults for user-owned finance tables.
-- Run against the linked hosted project with: npx supabase test db --linked

begin;
set local role postgres;
set local search_path = public, extensions;
select plan(24);

select has_table('public', 'accounts', 'accounts table exists');
select has_table('public', 'budgets', 'budgets table exists');
select has_table('public', 'transactions', 'transactions table exists');
select has_table('public', 'plan_items', 'plan_items table exists');
select has_table('public', 'goals', 'goals table exists');

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at)
values
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'alice-ledger@example.test', crypt('password', gen_salt('bf')), now()),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'bob-ledger@example.test', crypt('password', gen_salt('bf')), now());

insert into public.accounts (id, user_id, name)
values ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Bob Checking');

insert into public.budgets (user_id, category_name, amount, start_date, end_date)
values ('22222222-2222-2222-2222-222222222222', 'Food & Dining', 99000, current_date, current_date + 30);

insert into public.transactions (user_id, category_name, amount, type, description)
values ('22222222-2222-2222-2222-222222222222', 'Food & Dining', 99000, 'expense', 'Bob private lunch');

set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select results_eq(
  $$ insert into public.accounts (name)
     values ('Checking')
     returning user_id::text $$,
  array['11111111-1111-1111-1111-111111111111'],
  'account ownership defaults to the authenticated user'
);

select results_eq(
  $$ insert into public.budgets (category_name, amount, start_date, end_date)
     values ('Food & Dining', 50000, current_date, current_date + 30)
     returning user_id::text $$,
  array['11111111-1111-1111-1111-111111111111'],
  'budget ownership defaults to the authenticated user'
);

select results_eq(
  $$ insert into public.transactions (category_name, amount, type, description)
     values ('Food & Dining', 1800, 'expense', 'Lunch')
     returning user_id::text $$,
  array['11111111-1111-1111-1111-111111111111'],
  'transaction ownership defaults to the authenticated user'
);

select results_eq(
  $$ insert into public.plan_items (id, title, expected_amount)
     values ('44444444-4444-4444-4444-444444444444', 'Internet bill', 6500)
     returning user_id::text $$,
  array['11111111-1111-1111-1111-111111111111'],
  'plan item ownership defaults to the authenticated user'
);

select results_eq(
  $$ insert into public.goals (name, target_amount)
     values ('Emergency fund', 100000)
     returning user_id::text $$,
  array['11111111-1111-1111-1111-111111111111'],
  'goal ownership defaults to the authenticated user'
);

select is(
  (select count(*)::int from public.transactions),
  1,
  'alice sees only her own transactions'
);

select throws_ok(
  $$ insert into public.transactions (user_id, category_name, amount, type)
     values ('22222222-2222-2222-2222-222222222222', 'Other', 100, 'expense') $$,
  '42501',
  null,
  'alice cannot create a transaction owned by bob'
);

select throws_ok(
  $$ select public.toggle_plan_item(
       '44444444-4444-4444-4444-444444444444',
       true,
       '33333333-3333-3333-3333-333333333333'
     ) $$,
  'P0001',
  'Account not found',
  'alice cannot charge a completed plan item to bob''s account'
);

select lives_ok(
  $$ select public.toggle_plan_item('44444444-4444-4444-4444-444444444444', true) $$,
  'alice can mark her plan item done'
);

select lives_ok(
  $$ select public.toggle_plan_item('44444444-4444-4444-4444-444444444444', true) $$,
  'repeating the desired state is idempotent'
);

select is(
  (select is_done from public.plan_items where id = '44444444-4444-4444-4444-444444444444'),
  true,
  'the plan item remains done after a repeated command'
);

select is(
  (select count(*)::int from public.transactions
   where planned_item_id = '44444444-4444-4444-4444-444444444444'),
  1,
  'repeating the desired state creates only one transaction'
);

select lives_ok(
  $$ select public.get_monthly_summary(current_date) $$,
  'authenticated users can retrieve their monthly summary'
);

select is(
  json_array_length(public.get_budget_progress(current_date)),
  1,
  'budget progress returns only the authenticated user budgets'
);

select is(
  ((public.get_budget_progress(current_date)->0->>'spent')::int),
  1800,
  'budget progress uses only the authenticated user transactions'
);

select lives_ok(
  $$ select public.get_goal_strategy(
       (select id from public.goals where name = 'Emergency fund'),
       current_date
     ) $$,
  'authenticated users can retrieve a goal strategy for their own goal'
);

select lives_ok(
  $$ select public.get_salary_allocation(current_date) $$,
  'authenticated users can retrieve salary allocation recommendations'
);

select lives_ok(
  $$ select public.get_financial_health(current_date) $$,
  'authenticated users can retrieve financial health scoring'
);

select lives_ok(
  $$ select public.get_month_end_report(current_date) $$,
  'authenticated users can retrieve month-end reporting'
);

select * from finish();
rollback;