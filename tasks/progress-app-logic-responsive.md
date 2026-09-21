# Progress Snapshot: App Logic, Real Data, and Responsive Release

Date: 2026-09-20
Plan: `tasks/plan-app-logic-responsive.md` · Execution board: `tasks/todo-backend-first-parity.md`
Commit: `8bbcb95` "Connect mobile app to real backend contracts" (working tree clean, `origin/main` up to date)

## Phase Status

| Phase | Scope | Status |
|---|---|---|
| P0 | Deployment and contract lock | DONE (auth smoke still needs test-user tokens) |
| P1 | App logic foundation (shared hooks/mutations) | DONE |
| P2 | Identity, onboarding, preferences | DONE |
| P3 | Ledger write/read loop | DONE |
| P4 | Budgets and planning parity | DONE (pgTAP now verified against hosted DB via explicit path) |
| P5 | Goals, bills, salary, detail screens | DONE |
| P6 | Insights, assistant, settings persistence | DONE |
| P7 | Responsive and hardcoded-data release gate | PARTIAL — hardcoded-data scan clean; fixed-dimension/responsive pass not started |
| P8 | Public app_config table (non-secret runtime config) | DONE |

## What Is Real Now

- Auth: Supabase sign-in/sign-up/reset-password/sign-out/session-restore; core tabs gated behind session (`apps/mobile/src/features/auth/AuthProvider.tsx`).
- Ledger: transaction modal writes real rows; Money tab reads/searches/paginates real transactions; transaction detail is real-row-only.
- Budgets/Planning: `get_budget_progress` RPC backs both tabs; no local preview/correction data remains.
- Goals/Salary: `get_goal_strategy` and `get_salary_allocation` RPCs back their screens.
- Insights: `get_financial_health` and `get_month_end_report` RPCs back their screens.
- Settings: AI personality, privacy scope/toggles, and onboarding baseline (priority, safety buffer, cadence, first signal) persist to `profiles`.
- Bills: recurring `plan_items` only, no preview contracts.
- Assistant: no seeded sample chat or fake metric cards; renders only real `/api/chat` responses.

## Backend Contracts Shipped (hosted Supabase, applied via MCP)

- `supabase/migrations/20260920000000_budget_progress.sql`
- `supabase/migrations/20260920010000_strategy_and_salary_contracts.sql`
- `supabase/migrations/20260920020000_insights_and_preferences.sql`
- `supabase/migrations/20260920030000_onboarding_baseline.sql`
- `supabase/migrations/20260920040000_app_config.sql` — public-read, trusted-write-only runtime config table.
- `supabase/migrations/20260920050000_app_config_revoke_writes.sql` — forward-fix revoking default anon/authenticated write grants (see Bug Found below).
- Types regenerated in `packages/types/src/database.ts` after each migration.
- RLS/pgTAP coverage extended in `supabase/tests/ledger_rls_test.sql` and added in `supabase/tests/app_config_rls_test.sql`.

## Bug Found and Fixed: app_config Write Grants

Running the new `app_config_rls_test.sql` against the hosted database (not just typecheck/lint) surfaced a real gap: `anon`/`authenticated` had Supabase's default INSERT/UPDATE/DELETE table grants, so RLS with only a SELECT policy silently filtered writes to zero rows instead of denying them with `42501`. Fixed with a forward migration (`app_config_revoke_writes`) that explicitly revokes those grants, matching the existing `revoke all ... grant execute` pattern already used for RPC functions. The test file's `plan(7)` also didn't match its 6 actual assertions; corrected to `plan(6)`. Re-ran pgTAP after both fixes: all 6 assertions pass.

## Verification Evidence

- `npm run typecheck` — pass (re-verified post-commit and after `app_config`).
- `npm run lint` — pass.
- `npm run test` — pass (65 core tests, 14 AI service tests).
- `npm run expo:check` — pass.
- Targeted Prettier check on touched files — pass.
- Hardcoded-data scan over `apps/mobile/app` — clean except explicit Settings "Lab/Preview" grouping and routes already classified as deferred Lab/reference.
- `supabase test db --linked supabase/tests` — pass against hosted Budgetify: `Files=3, Tests=39, Result: PASS` (default file discovery only picked up one file; passing the directory explicitly ran all three test files).
- `git diff --check` — pass (no whitespace errors) before applying `app_config`.

## Remaining Work (P7 + gates)

1. Responsive pass: replace brittle fixed dimensions with tokenized, safe-area-aware, wrapping layouts (compact phone → tablet).
2. Manual verification: dynamic text scaling, small-phone, large-phone/tablet, light theme, dark theme.
3. Re-run `npm run test` and `npm run expo:check` after the responsive pass (typecheck/lint already re-verified post-commit).
4. Run authenticated `npm run smoke:public` once `SMOKE_USER1_TOKEN` / `SMOKE_USER2_TOKEN` are supplied outside chat.
5. Investigate why `supabase test db --linked` without an explicit path only discovers one of three test files, so CI/local runs don't silently skip coverage.

## Open Questions (unchanged)

- Chat history persistence is deferred; AI stays stateless for this release.
- Whether deferred Preview/Lab routes stay installed-but-hidden or are removed from the shipped route tree.
- Which two seeded demo accounts to standardize on for repeatable public smoke and RLS checks.
