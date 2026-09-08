-- RLS regression tests for public.profiles.
--
-- The legacy app enforced ownership by convention: every service function had
-- to remember filter_by(user_id=...). Under RLS the same mistake is a silent
-- cross-tenant leak, so these tests assert DENIAL, not just permission.
--
-- Run with: npm run db:test

begin;
select plan(9);

select has_table('public', 'profiles', 'profiles table exists');
select ok(
  (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass),
  'row level security is enabled on profiles'
);

-- Two users, created through auth so the signup trigger fires.
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
values
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'alice@example.test', crypt('password', gen_salt('bf')), now(),
   '{"full_name":"Alice"}'::jsonb),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'bob@example.test', crypt('password', gen_salt('bf')), now(),
   '{"full_name":"Bob"}'::jsonb);

select is(
  (select count(*)::int from public.profiles),
  2,
  'signup trigger created a profile for each user'
);

select is(
  (select display_name from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
  'Alice',
  'display name is taken from auth metadata'
);

-- Act as Alice.
set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select is(
  (select count(*)::int from public.profiles),
  1,
  'alice sees only her own profile'
);

select is(
  (select count(*)::int from public.profiles where id = '22222222-2222-2222-2222-222222222222'),
  0,
  'alice cannot read bob''s profile'
);

select lives_ok(
  $$ update public.profiles set display_name = 'Alice Updated'
     where id = '11111111-1111-1111-1111-111111111111' $$,
  'alice can update her own profile'
);

select is(
  (select count(*)::int from (
     update public.profiles set display_name = 'hacked'
     where id = '22222222-2222-2222-2222-222222222222'
     returning 1
   ) as affected),
  0,
  'alice cannot update bob''s profile'
);

select throws_ok(
  $$ insert into public.profiles (id, display_name)
     values ('33333333-3333-3333-3333-333333333333', 'Mallory') $$,
  '42501',
  null,
  'alice cannot insert a profile for someone else'
);

select * from finish();
rollback;
