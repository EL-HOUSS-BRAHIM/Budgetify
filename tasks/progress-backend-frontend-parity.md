# LYVORA Core V1 Parity Handoff

Date: 2026-09-26
Status: RELEASE_CANDIDATE_BLOCKED
Owner stream: Backend-first parity

## Scope Boundary

Core V1 is manual finance only: Home, Transactions, Budget, Goals, Settings. The backend remains the source of truth for all money calculations and writes. AI and preview surfaces are isolated and do not block this release.

## No-Rebuild Baseline

| Contract | Current state | Evidence surface |
|---|---|---|
| Auth and profile ownership | Delivered | `supabase/migrations/20260908000000_baseline_profiles.sql`, auth routes |
| Accounts/categories/transactions/budgets/goals | Delivered | `supabase/migrations/20260913000000_schema_budgetify.sql` |
| Transfer and recurring support | Delivered | `supabase/migrations/20260921000000_core_v1_transfers_recurring.sql` |
| Account balance synchronization | Delivered | `supabase/migrations/20260921010000_account_balance_trigger.sql` |
| Budget, goal, health, salary, and report contracts | Delivered | `supabase/migrations/20260920000000_budget_progress.sql` and later contracts |
| RLS and generated types | Implemented; final hosted proof pending | `supabase/tests`, `packages/types/src/database.ts` |
| Core mobile route wiring | Delivered; runtime QA pending | `apps/mobile/app`, `apps/mobile/src/features` |

## Remaining Parity Gates

### Backend/RLS gate

Required: run every intended pgTAP file against the linked hosted Budgetify project and capture PASS.

Current reason it is not working: `npm run db:test` stalls at remote login-role initialization. This is not a frontend parity failure and must be debugged at the Supabase CLI/session/network boundary.

### API gate

Required: run two-user public HTTPS smoke with local ignored tokens.

Current reason it is not working: no test-user access tokens are present. A public health response cannot prove authenticated caller scope.

### Mobile gate

Required: demonstrate that the real data routes work on compact and expanded Android layouts, with month navigation, account setup, transaction modal, budget progress, goal progress, recurring items, and error/empty states.

Current reason it is not working: no final device or emulator evidence exists; source inspection and typecheck are insufficient.

### Release gate

Required: green `npm run verify`, clean reviewed commit, then annotated `v1.0.0`.

Current reason it is not working: the worktree has uncommitted changes and the remote/runtime gates remain unresolved.

## Deferred Surface List

These are intentionally not active parity work: assistant/chat persistence, AI personality, voice mode, bank integrations, OCR, file import, forecasting, automatic categorization, smart advice, automation, investments, crypto, payments, shared finances, vault, and credit-card-specific contracts.

## Handoff Rule

When a gate is completed, append the exact command, target, date, result, and redacted evidence. Do not change a state to COMPLETED_READY based only on code existence.
