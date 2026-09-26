-- LYVORA Core V1 contract and ownership tests.

begin;
set local role postgres;
set local search_path = public, extensions;
select plan(23);

select has_table('public', 'accounts', 'accounts table exists');
select has_table('public', 'categories', 'categories table exists');
select has_table('public', 'transactions', 'transactions table exists');
select has_table('public', 'budgets', 'budgets table exists');
select has_table('public', 'goals', 'goals table exists');
select has_table('public', 'recurring_transactions', 'recurring transactions table exists');

select ok(
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'transactions'
      and column_name = 'source_account_id'
  ),
  'transactions have a source account'
);

select ok(
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'transactions'
      and column_name = 'destination_account_id'
  ),
  'transactions have a destination account'
);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.recurring_transactions'::regclass),
  'RLS is enabled on recurring transactions'
);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'core-v1@example.test',
    crypt('password', gen_salt('bf')), now()
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'core-v1-other@example.test',
    crypt('password', gen_salt('bf')), now()
  );

set local role authenticated;
set local request.jwt.claims = '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}';

select lives_ok(
  $$ insert into public.recurring_transactions (name, amount, next_date)
     values ('Internet', 19900, current_date) $$,
  'a user can create a recurring transaction'
);

select is(
  (select count(*)::int from public.recurring_transactions),
  1,
  'a user can read their recurring transaction'
);

select throws_ok(
  $$ insert into public.transactions (type, amount, category_name, source_account_id, destination_account_id)
     values ('transfer', 100, 'Transfer', null, null) $$,
  '23514',
  null,
  'transfers require source and destination accounts'
);

insert into public.accounts (id, name, type, currency)
values
  ('33333333-3333-3333-3333-333333333333', 'Checking', 'checking', 'USD'),
  ('44444444-4444-4444-4444-444444444444', 'Savings', 'savings', 'USD');

insert into public.transactions (type, amount, category_name, destination_account_id)
values ('income', 50000, 'Salary', '33333333-3333-3333-3333-333333333333');

select is(
  (select current_balance::int from public.accounts where id = '33333333-3333-3333-3333-333333333333'),
  50000,
  'income increases the destination account balance'
);

insert into public.transactions (type, amount, category_name, source_account_id)
values ('expense', 10000, 'Food', '33333333-3333-3333-3333-333333333333');

insert into public.transactions (type, amount, category_name, source_account_id, destination_account_id)
values ('transfer', 5000, 'Transfer', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444');

select is(
  (select current_balance::int from public.accounts where id = '33333333-3333-3333-3333-333333333333'),
  35000,
  'expense and transfer reduce the source account balance'
);

select is(
  (select current_balance::int from public.accounts where id = '44444444-4444-4444-4444-444444444444'),
  5000,
  'transfer increases the destination account balance'
);

-- Cross-user denial. Ownership was a convention in the legacy code; under RLS a
-- missing check is a cross-tenant leak, so every user-scoped table in Core V1
-- needs its own proof.

select throws_ok(
  $$ update public.accounts set name = 'Stolen'
     where id = '33333333-3333-3333-3333-333333333333'
       and user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' $$,
  '42501', null,
  'a user cannot rename another user account'
);

select throws_ok(
  $$ insert into public.transactions (user_id, category_name, amount, type)
     values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Other', 100, 'expense') $$,
  '42501', null,
  'a user cannot write a transaction owned by someone else'
);

select throws_ok(
  $$ insert into public.recurring_transactions (user_id, name, amount, next_date)
     values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Theirs', 100, current_date) $$,
  '42501', null,
  'a user cannot write a recurring transaction owned by someone else'
);

select is(
  (select count(*)::int from public.recurring_transactions
   where user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  0,
  'a user sees no recurring transaction belonging to someone else'
);

-- Switch to the second user and prove the first user's data is invisible.

set local request.jwt.claims = '{"sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","role":"authenticated"}';

select is(
  (select count(*)::int from public.accounts),
  0,
  'a second user cannot see the first user accounts'
);

select is(
  (select count(*)::int from public.transactions),
  0,
  'a second user cannot see the first user transactions'
);

select is(
  (select count(*)::int from public.recurring_transactions),
  0,
  'a second user cannot see the first user recurring transactions'
);

select throws_ok(
  $$ delete from public.transactions $$,
  '42501', null,
  'a second user cannot delete the first user transactions'
);

select * from finish();
rollback;
