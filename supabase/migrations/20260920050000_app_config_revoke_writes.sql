-- Supabase grants INSERT/UPDATE/DELETE to anon and authenticated by default
-- on new tables, so RLS alone left writes silently no-op instead of denied.
-- Revoke the base privilege so unauthorized writes raise insufficient_privilege.
revoke insert, update, delete on public.app_config from anon, authenticated;
