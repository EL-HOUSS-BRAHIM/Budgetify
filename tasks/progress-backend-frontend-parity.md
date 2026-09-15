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

1. Supabase MCP target mismatch: MCP project URL resolves to a non-Budgetify project, while app/service code targets hnlieepsxoqeebkreugt. State: BLOCKED_ENV for remote MCP write actions until target is corrected.
2. No dedicated login/signup UX in mobile routes yet. Current pattern is session checks with preview fallback.

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
| Budget progress/velocity RPC (for planning + budgets tabs) | WAITING_BACKEND | missing RPC contract |
| Financial health scoring RPC | WAITING_BACKEND | missing RPC contract |
| Goal strategy recommendation RPC | WAITING_BACKEND | missing RPC contract |
| Month-end narrative/report RPC | WAITING_BACKEND | missing RPC contract |
| Chat history persistence (table + RLS + API wiring) | WAITING_BACKEND | no chat_messages table or writes |
| Settings/profile preference persistence contract | PARTIAL_READY | profiles table exists, no finished app wiring |
| Shared finance contracts (households/invites/splits) | WAITING_BACKEND | missing schema |
| Vault/documents contracts | WAITING_BACKEND | missing schema |
| Credit-card specific contracts | WAITING_BACKEND | missing schema |
| AI service auth gate and tool execution | PARTIAL_READY | services/ai/src/app.ts, services/ai/src/executor.ts |

## Frontend Snapshot (Mobile Routes)

| Route | Current State | Why |
|---|---|---|
| apps/mobile/app/(tabs)/index.tsx | PARTIAL_READY | Uses real data hook, but still contains static narrative/insight text in UI composition. |
| apps/mobile/app/(tabs)/expenses.tsx | WAITING_FRONTEND_WIRING | Static local expenses array; no transactions query. |
| apps/mobile/app/(tabs)/assistant.tsx | PARTIAL_READY | Calls real /api/chat, but seeds local starter messages and hardcoded insight cards. |
| apps/mobile/app/(tabs)/planning.tsx | WAITING_FRONTEND_WIRING | Category velocity and corrections are local preview logic. |
| apps/mobile/app/(tabs)/goals.tsx | PARTIAL_READY | Queries real goals with preview fallback and local simulation sections. |
| apps/mobile/app/(tabs)/budgets.tsx | WAITING_FRONTEND_WIRING | Budget categories are hardcoded sample data. |
| apps/mobile/app/(tabs)/settings.tsx | WAITING_FRONTEND_WIRING | Profile/currency/privacy actions are mostly local/static. |
| apps/mobile/app/forecast.tsx | PARTIAL_READY | Forecast hook queries real data but still has preview model fallback. |
| apps/mobile/app/bills.tsx | PARTIAL_READY | Reads recurring plan items but includes preview fallback and preview language. |
| apps/mobile/app/salary-day.tsx | PARTIAL_READY | Reads real profile/accounts/plan/goals but still uses preview model fallback and local-only apply action. |
| apps/mobile/app/transaction/[id].tsx | PARTIAL_READY | Reads real transaction by id, but receipt/OCR and several context blocks are hardcoded preview content. |
| apps/mobile/app/reports/month-end.tsx | WAITING_FRONTEND_WIRING | Full report content is static preview text/metrics. |
| apps/mobile/app/settings/ai.tsx | WAITING_FRONTEND_WIRING | Preference is local screen state only. |
| apps/mobile/app/modal.tsx | WAITING_FRONTEND_WIRING | Input UX exists; write integration not complete for parity standard. |
| apps/mobile/app/allocation.tsx | WAITING_BACKEND | Preview-only capital allocation surface, no backend contract. |
| apps/mobile/app/automations.tsx | WAITING_BACKEND | Preview-only automation surface, no backend contract. |
| apps/mobile/app/credit-cards.tsx | WAITING_BACKEND | Preview-only card data, no backend contract. |
| apps/mobile/app/driving-mode.tsx | WAITING_BACKEND | Preview-only voice mode surface. |
| apps/mobile/app/financial-health.tsx | WAITING_BACKEND | Preview indicators with no backend health score contract. |
| apps/mobile/app/goals/[id]/strategy.tsx | WAITING_BACKEND | Strategy details are sample guidance, not computed backend output. |
| apps/mobile/app/income-mode.tsx | WAITING_BACKEND | Preview-only irregular income mode rules. |
| apps/mobile/app/lockdown.tsx | WAITING_BACKEND | Preview-only lockdown mode controls. |
| apps/mobile/app/onboarding.tsx | WAITING_FRONTEND_WIRING | Flow is preview and does not persist onboarding/profile baseline. |
| apps/mobile/app/privacy.tsx | WAITING_FRONTEND_WIRING | Privacy toggles local only; not persisted. |
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