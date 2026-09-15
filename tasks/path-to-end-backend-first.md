# Path To End: Backend-First Parity Plan

Date: 2026-09-15
Scope: Replace hardcoded/preview financial behavior with real backend data while preserving current frontend UX direction.

## Non-Negotiables

1. Backend contracts are the source of truth.
2. Frontend visual structure is preserved; only data wiring/state behavior changes.
3. Supabase Auth is the only login/auth stack for mobile.
4. Every money write path must remain user-scoped under RLS.
5. No service-role key in mobile app.

## Dependency Order

M0 -> M1 -> M2 -> M3 -> M4 -> M5 -> M6 -> M7

- M0: Environment and target lock
- M1: Identity and session UX
- M2: Money tab and transaction feed parity
- M3: Budgets and planning parity
- M4: Goals, bills, salary, transaction detail parity
- M5: Insights parity (health + month-end)
- M6: Assistant persistence + settings persistence
- M7: Preview cleanup and release gates

## Milestones

### M0 - Environment and Target Lock (Gate)

Goal: Ensure all backend work is applied to the correct Budgetify project and not an unrelated Supabase target.

Tasks:
- Confirm and document canonical Supabase project ref for Budgetify.
- Align local CLI link and app env references to the same project.
- Mark MCP remote-write flow blocked until MCP points to the same project.
- Add a preflight check item to every migration runbook: verify project URL/ref before apply.

Done when:
- One canonical project ref is documented and used by mobile app, AI service, and CLI workflows.
- No remote migration/write step proceeds without target confirmation.

### M1 - Identity and Session UX (Supabase Auth)

Goal: Replace preview-session behavior with real sign-in/sign-up/session lifecycle.

Backend tasks:
- Verify profiles trigger behavior for sign-up edge cases.
- Add/update preference write contract for display_name/currency/locale (table update or RPC).

Frontend tasks:
- Add auth stack screens (sign in, sign up, reset password).
- Add guarded route behavior for core tabs.
- Remove silent preview fallback when unauthenticated on core flows.

Done when:
- User can sign up, sign in, sign out, and restore session from secure storage.
- Core financial screens require authenticated session and show proper empty/onboarding states.

### M2 - Money Tab Parity

Goal: Make Money tab fully backend-fed using transactions data.

Backend tasks:
- Validate transaction query/index strategy for date sorting and search.
- Standardize transaction list query contract for mobile feed.

Frontend tasks:
- Replace hardcoded expenses list with real transactions query.
- Keep search behavior but apply to real data.
- Keep existing UI styling and card layout unchanged.

Done when:
- apps/mobile/app/(tabs)/expenses.tsx has zero hardcoded financial rows.
- New expense records appear in Money tab feed without app restart.

### M3 - Budgets and Planning Parity

Goal: Wire budgets and planning tabs to backend contracts.

Backend tasks:
- Implement budget progress contract (RPC or query pattern) for spent/limit/remaining by period.
- Implement planning velocity contract from transactions + budgets + plan_items.
- Ensure RLS coverage and add denial tests where needed.

Frontend tasks:
- Replace static categories in budgets tab with contract output.
- Replace local planning velocity arrays and local-only correction messaging with backend-backed calculations.

Done when:
- Budgets and planning contain no sample money values.
- Recalculation is data-driven and reflects recent writes.

### M4 - Goals, Bills, Salary, Transaction Detail Parity

Goal: Remove preview fallback from mixed screens and complete missing computed contracts.

Backend tasks:
- Add goal strategy contract (funded percent, monthly recommendation, horizon impact).
- Add salary allocation recommendation contract.
- Define receipt/OCR metadata contract or explicitly mark out-of-scope for this release.

Frontend tasks:
- Remove sample strategy text in goals strategy screen.
- Replace local salary allocation preparation logic with backend computed recommendation.
- Remove static receipt line items or gate behind real receipt source.

Done when:
- goals, bills, salary-day, and transaction detail screens operate without preview financial data.

### M5 - Insights Parity (Health + Month-End)

Goal: Convert analytical preview screens to real computed insights.

Backend tasks:
- Implement financial health score contract.
- Extend or add month-end report contract for narrative + metrics.

Frontend tasks:
- Wire financial-health screen to real score output.
- Replace static month-end report values with backend output.

Done when:
- Financial health and month-end screens do not display sample metrics.

### M6 - Assistant and Settings Persistence

Goal: Complete backend persistence for AI context and settings behavior.

Backend tasks:
- Add chat_messages table + RLS and persistence flow (if chat memory is in-scope).
- Persist AI personality/settings preferences and privacy toggles.

Frontend tasks:
- Remove local-only save behavior in settings/ai and privacy surfaces.
- Keep assistant UI but replace seeded chat behavior with persisted or server-provided starter state.

Done when:
- Settings changes survive app restart and device re-login.
- Assistant behavior relies on backend state where required.

### M7 - Preview Cleanup and Release Gates

Goal: Separate shippable parity scope from deferred innovation previews.

Tasks:
- Route-by-route decision: implement now or defer.
- Move deferred screens behind explicit Lab/Preview grouping.
- Run hardcoded scan excluding generated folders.

Done when:
- Core release routes contain no fake financial values.
- Deferred routes are explicitly labeled and out of core nav promises.

## Verification Gates

Gate A (after M1):
- Auth lifecycle works end-to-end with Supabase.

Gate B (after M3):
- Home, Money, Plan, Goals use real backend data for key finance values.

Gate C (after M5):
- Health and reports are computed from backend contracts.

Gate D (after M7):
- No hardcoded financial sample data in core routes.
- RLS test suite passes.
- Mobile typecheck and AI service tests pass.

## Suggested Working Commands

- npm run typecheck
- npm run test
- npm run verify
- npm run db:test

## Execution Rule

If a screen depends on a missing backend contract, implement backend contract first, then wire the screen. Do not ship UI-only simulated finance behavior on core routes.