# Backend/Frontend Real-Data Progress

Date: 2026-09-15
Owner: Backend-first parity stream
Rule: Backend must match existing frontend product surfaces.

## State Legend

- COMPLETED_READY: Implemented and usable now.
- PARTIAL_READY: Implemented partially; still has preview/fallback/hardcoded gaps.
- WAITING_BACKEND: Frontend surface exists, backend contract/data does not.
- WAITING_FRONTEND_WIRING: Backend data exists, frontend still hardcoded/preview.
- BLOCKED_ENV: Work is blocked by environment mismatch and cannot be verified safely.
- DEFERRED: Out of current parity release scope.

## Global Blockers

1. No dedicated login/signup UX in mobile routes yet. Current pattern is session checks with preview fallback.

## Resolved Blockers

- 2026-09-20: Supabase MCP retargeted from the old project to Budgetify. `get_project_url` now returns `https://hnlieepsxoqeebkreugt.supabase.co`.

## Backend Snapshot (Supabase + AI service)

| Capability | Current State | Evidence |
|---|---|---|
| Supabase Auth identity boundary | COMPLETED_READY | supabase/migrations/20260908000000_baseline_profiles.sql |
| Auto profile creation trigger | COMPLETED_READY | supabase/migrations/20260908000000_baseline_profiles.sql |
| Core finance tables (accounts/categories/transactions/budgets/plan_items/goals) | COMPLETED_READY | supabase/migrations/20260913000000_schema_budgetify.sql |
| RLS policies for finance tables | COMPLETED_READY | supabase/migrations/20260913000000_schema_budgetify.sql |
| RLS regression tests (profiles + ledger) | COMPLETED_READY | supabase/tests/profiles_rls_test.sql, supabase/tests/ledger_rls_test.sql |
| RPC: toggle_plan_item | COMPLETED_READY | supabase/migrations/20260913170000_set_plan_item_status.sql |
| RPC: get_monthly_summary | PARTIAL_READY | supabase/migrations/20260913000000_schema_budgetify.sql |
| Budget progress/velocity RPC (for planning + budgets tabs) | COMPLETED_READY | supabase/migrations/20260920000000_budget_progress.sql |
| Financial health scoring RPC | COMPLETED_READY | supabase/migrations/20260920020000_insights_and_preferences.sql |
| Goal strategy recommendation RPC | COMPLETED_READY | supabase/migrations/20260920010000_strategy_and_salary_contracts.sql |
| Month-end narrative/report RPC | COMPLETED_READY | supabase/migrations/20260920020000_insights_and_preferences.sql |
| Chat history persistence (table + RLS + API wiring) | WAITING_BACKEND | no chat_messages table or writes |
| Settings/profile preference persistence contract | COMPLETED_READY | profiles table stores display/currency, AI personality, privacy toggles, and onboarding baseline |
| Shared finance contracts (households/invites/splits) | WAITING_BACKEND | missing schema |
| Vault/documents contracts | WAITING_BACKEND | missing schema |
| Credit-card specific contracts | WAITING_BACKEND | missing schema |
| AI service auth gate and tool execution | PARTIAL_READY | services/ai/src/app.ts, services/ai/src/executor.ts |

## Frontend Snapshot (Mobile Routes)

| Route | Current State | Why |
|---|---|---|
| apps/mobile/app/(tabs)/index.tsx | PARTIAL_READY | Uses real data hook, but still contains static narrative/insight text in UI composition. |
| apps/mobile/app/(tabs)/expenses.tsx | WAITING_FRONTEND_WIRING | Static local expenses array; no transactions query. |
| apps/mobile/app/(tabs)/assistant.tsx | COMPLETED_READY | Calls real /api/chat with no seeded sample thread or fake metric cards. |
| apps/mobile/app/(tabs)/planning.tsx | COMPLETED_READY | Uses real budget progress and plan items; local correction simulation removed. |
| apps/mobile/app/(tabs)/goals.tsx | COMPLETED_READY | Queries real goals with no preview fallback or local simulator. |
| apps/mobile/app/(tabs)/budgets.tsx | COMPLETED_READY | Uses typed budget progress RPC output. |
| apps/mobile/app/(tabs)/settings.tsx | WAITING_FRONTEND_WIRING | Profile/currency/privacy actions are mostly local/static. |
| apps/mobile/app/forecast.tsx | PARTIAL_READY | Forecast hook queries real data but still has preview model fallback. |
| apps/mobile/app/bills.tsx | COMPLETED_READY | Uses recurring plan items only, with no preview fallback contracts. |
| apps/mobile/app/salary-day.tsx | COMPLETED_READY | Uses typed salary allocation RPC and review-only prepared action. |
| apps/mobile/app/transaction/[id].tsx | COMPLETED_READY | Reads real transaction by id with no receipt/OCR preview blocks. |
| apps/mobile/app/reports/month-end.tsx | COMPLETED_READY | Uses typed month-end report RPC output. |
| apps/mobile/app/settings/ai.tsx | COMPLETED_READY | Persists AI personality through the profile row. |
| apps/mobile/app/modal.tsx | COMPLETED_READY | Creates real transaction rows. |
| apps/mobile/app/allocation.tsx | WAITING_BACKEND | Preview-only capital allocation surface, no backend contract. |
| apps/mobile/app/automations.tsx | WAITING_BACKEND | Preview-only automation surface, no backend contract. |
| apps/mobile/app/credit-cards.tsx | WAITING_BACKEND | Preview-only card data, no backend contract. |
| apps/mobile/app/driving-mode.tsx | WAITING_BACKEND | Preview-only voice mode surface. |
| apps/mobile/app/financial-health.tsx | COMPLETED_READY | Uses typed financial health RPC output. |
| apps/mobile/app/goals/[id]/strategy.tsx | COMPLETED_READY | Uses typed goal strategy RPC output. |
| apps/mobile/app/income-mode.tsx | WAITING_BACKEND | Preview-only irregular income mode rules. |
| apps/mobile/app/lockdown.tsx | WAITING_BACKEND | Preview-only lockdown mode controls. |
| apps/mobile/app/onboarding.tsx | COMPLETED_READY | Persists onboarding priority, monthly cadence, safety buffer, and first signal. |
| apps/mobile/app/privacy.tsx | COMPLETED_READY | Persists AI context scope and privacy toggles through the profile row. |
| apps/mobile/app/shared-finances.tsx | WAITING_BACKEND | Preview-only shared finance surface. |
| apps/mobile/app/vault.tsx | WAITING_BACKEND | Preview-only documents vault surface. |
| apps/mobile/app/platform-surface.tsx | DEFERRED | Platform reference surface; not core parity gate. |
| apps/mobile/app/desktop-reference.tsx | DEFERRED | Reference only; not core parity gate. |
| apps/mobile/app/_layout.tsx | COMPLETED_READY | App shell and navigation infrastructure are stable. |
| apps/mobile/app/(tabs)/_layout.tsx | COMPLETED_READY | Tab shell and route topology are stable. |
| apps/mobile/app/settings.tsx | COMPLETED_READY | Route forwarding shim is stable. |

## Data Layer Snapshot

| Layer | State | Evidence |
|---|---|---|
| Supabase mobile client + secure storage auth persistence | COMPLETED_READY | apps/mobile/src/lib/supabase.ts |
| Home data hook | PARTIAL_READY | apps/mobile/src/features/home/use-home-data.ts |
| Forecast data hook | PARTIAL_READY | apps/mobile/src/features/forecast/use-forecast-data.ts |
| Auth route/session orchestration UX | WAITING_FRONTEND_WIRING | missing dedicated sign-in/up screens |

## Hardcoded Removal Exit Criteria

1. No preview/sample arrays in production routes under apps/mobile/app except explicitly DEFERRED routes.
2. No local-only completion messages for money-moving actions; all actions backed by verified backend writes.
3. All core tabs (Home, Money, Plan, Goals, AI) are at least PARTIAL_READY with no fake financial numbers.
4. Login/signup/session lifecycle is fully Supabase-backed with guarded routes.
5. Backend contracts for budgets, health score, month-end report, and goal strategy are implemented and consumed.

## Immediate Next Move

Move to milestone plan in tasks/path-to-end-backend-first.md and execute in dependency order. Do not start remote Supabase writes through MCP until project target mismatch is resolved.