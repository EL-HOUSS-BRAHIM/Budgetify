-- RLS tests for public.app_config.
-- Runtime configuration is public-read and trusted-write only.

begin;
set local role postgres;
set local search_path = public, extensions;
select plan(6);

select has_table('public', 'app_config', 'app_config table exists');
select ok(
  (select relrowsecurity from pg_class where oid = 'public.app_config'::regclass),
  'row level security is enabled on app_config'
);

insert into public.app_config (key, value)
values ('ai_api_url', 'https://example.invalid');

set local role anon;

select is(
  (select value from public.app_config where key = 'ai_api_url'),
  'https://example.invalid',
  'anonymous clients can read non-secret configuration'
);

select throws_ok(
  $$ insert into public.app_config (key, value)
     values ('client_write', 'https://example.invalid') $$,
  '42501',
  null,
  'anonymous clients cannot write configuration'
);

select throws_ok(
  $$ update public.app_config
        set value = 'https://attacker.invalid'
      where key = 'ai_api_url' $$,
  '42501',
  null,
  'anonymous clients cannot update configuration'
);

select throws_ok(
  $$ delete from public.app_config where key = 'ai_api_url' $$,
  '42501',
  null,
  'anonymous clients cannot delete configuration'
);

select * from finish();
rollback;
