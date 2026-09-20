# Plan: App Logic, Real Data, and Responsive Release

Date: 2026-09-20
Public API URL: `https://budgetifyai-qika9xe4.b4a.run`

Assumption: the hosted backend is deployed. Health is verified; authenticated public smoke still needs test-user access tokens entered outside chat.

## Goal

Turn the current Expo app from a polished preview into a production-ready personal finance app: every core money screen uses Supabase-backed data, every user action persists or clearly routes to a real backend contract, and layouts hold up across small phones, large phones, tablets, dynamic text, safe areas, and theme modes.

## Non-Negotiables

1. No fake financial numbers in core routes. Empty states are allowed; preview values are not.
2. Backend contracts are the source of truth for money logic, calculations, persistence, and AI actions.
3. The app keeps the current five-tab product shape: Home, Money, Plan, Goals, AI.
4. Every financial write is authenticated, user-scoped, RLS-protected, and reflected in the UI without restarting the app.
5. Responsive behavior is verified on multiple viewport classes before release.
6. Deferred innovation screens must be explicitly grouped as Preview/Lab and cannot look like production-backed functionality.

## Dependency Graph

```text
P0 deployed backend verification
  └─ P1 app data/auth foundation
       ├─ P2 onboarding + profile preferences
       └─ P3 ledger write/read loop
            ├─ P4 money + budgets + planning parity
            ├─ P5 goals + bills + salary + transaction details
            └─ P6 insights + assistant + settings persistence
                 └─ P7 responsive and hardcoded-data release gate
```

## Architecture Decisions

- Add shared feature hooks for backend reads and writes before touching individual screens. Screens should render view models, not query tables directly in every component.
- Keep domain math in `packages/core` or Supabase RPCs. The mobile app formats and presents results; it does not silently invent financial calculations.
- Use real empty, loading, error, and offline-ish retry states for every core route. Do not fall back from backend failure to sample data.
- Prefer responsive tokens and reusable layout primitives over one-off dimensions in route files.
- Treat responsiveness and hardcoded-data cleanup as testable gates: scan source, typecheck, run tests, and verify key screens on at least compact and expanded device sizes.

## Phase Plan

### P0 - Deployment and Contract Lock

**Description:** Confirm the deployed backend URL, Supabase project ref, public smoke status, and mobile environment variables before wiring more app logic.

**Acceptance criteria:**
- [x] Public `/health` returns 200 over HTTPS.
- [ ] Authenticated public smoke test passes against the deployed API.
- [x] Mobile environment files point at the same Supabase project and AI API base URL.
- [x] No service-role or secret key exists in mobile code or committed config.

**Verification:** `npm run smoke:public`, `npm run typecheck --workspace services/ai`, env/example diff review.

**Evidence:** 2026-09-20 `GET https://budgetifyai-qika9xe4.b4a.run/health` returned `{"status":"ok","service":"budgetify-ai"}`. A mobile/service scan found no service-role or secret-key usage beyond warning comments in env examples.

**Supabase MCP:** 2026-09-20 retargeted VS Code `mcp.json` to `project_ref=hnlieepsxoqeebkreugt`; `get_project_url` now returns `https://hnlieepsxoqeebkreugt.supabase.co`.

### P1 - App Logic Foundation

**Description:** Create the reusable client-side pattern for authenticated queries, mutations, cache refresh, money formatting, and honest loading/empty/error states.

**Acceptance criteria:**
- Shared finance data hooks exist for accounts, transactions, budgets, plan items, goals, and profile preferences.
- Mutation helpers return typed success/error results and refresh affected reads.
- Currency formatting uses user/profile currency and integer minor units.
- No core screen uses preview data as an error fallback.

**Verification:** mobile typecheck, focused hook tests where practical, manual auth/session refresh check.

**Progress 2026-09-20:** Added authenticated profile, account, transaction, budget progress, planning, goal strategy, salary allocation, financial health, and month-end report hooks. Money, Budgets, Plan, Goals, Bills, Assistant, Salary Day, Financial Health, Month-End Report, and transaction detail now render loading/empty/error states instead of sample financial fallback data. Shared mutation helpers exist for transactions, profile/settings, accounts, budgets, plan items, and goals. Verified with workspace typecheck, lint, tests, and Expo check.

### P2 - Identity, Onboarding, and Preferences

**Description:** Replace preview-session behavior with real Supabase Auth screens and persisted profile setup.

**Acceptance criteria:**
- User can sign up, sign in, sign out, reset password, and restore a session from secure storage.
- Core financial tabs are guarded when unauthenticated.
- Onboarding persists display name, currency, locale, income cadence, and safety buffer.
- Settings/profile changes survive app restart and re-login.

**Verification:** mobile typecheck, Supabase auth manual flow, profile row inspection through authenticated reads.

**Progress 2026-09-20:** Added Supabase sign-in, sign-up, reset-password, sign-out, session restore, and guarded core tab navigation. Profile display name, currency, AI personality, privacy preferences, onboarding priority, monthly income cadence, safety buffer, and first signal are persisted through the `profiles` table.

### P3 - Ledger Write/Read Loop

**Description:** Make the transaction modal and Money tab prove the basic production loop: create money movement, read it back, search it, and open details.

**Acceptance criteria:**
- `apps/mobile/app/modal.tsx` writes a real transaction.
- `apps/mobile/app/(tabs)/expenses.tsx` reads real transactions with search and pagination-ready ordering.
- `apps/mobile/app/transaction/[id].tsx` reads only real transaction details or an empty/not-found state.
- New records appear in the feed without restarting the app.

**Verification:** create/read manual smoke on device, mobile typecheck, RLS denial check from backend tests.

**Progress 2026-09-20:** Transaction modal writes real rows; Money tab reads/searches real transactions ordered by date; transaction detail reads real rows only; Money refreshes on focus after writes.

### P4 - Budgets and Planning Parity

**Description:** Replace static budget categories and planning preview values with backend-derived progress and commitment data.

**Acceptance criteria:**
- Budget progress contract returns limit, spent, remaining, period, and status per category.
- Planning screen derives bills, subscriptions, flexible-spending status, and correction proposals from real contracts.
- Local-only correction messages are removed or replaced by persisted/reviewable actions.

**Verification:** `npm run db:test`, mobile typecheck, manual seeded-data check on Budgets and Plan.

**Progress 2026-09-20:** Added and remotely applied `get_budget_progress`; regenerated hosted Supabase types; Budgets and Plan consume the typed contract. pgTAP coverage was added, but local `npm run db:test` is blocked by Docker Desktop not running.

### P5 - Goals, Bills, Salary, and Detail Screens

**Description:** Finish mixed real/preview screens so goal strategy, bills, salary allocation, and transaction context are backed by contracts.

**Acceptance criteria:**
- Goal strategy screen uses real goal strategy output or a no-data state.
- Bills screen uses real recurring plan items without preview contracts.
- Salary-day recommendations come from backend/core logic and persist applied choices.
- Receipt/OCR blocks are either backed by real metadata or removed from core detail UI.

**Verification:** mobile typecheck, manual screen review with empty and seeded accounts.

**Progress 2026-09-20:** Added and remotely applied `get_goal_strategy` and `get_salary_allocation`; regenerated hosted Supabase types. Goal Strategy and Salary Day now consume typed backend contracts. Transaction detail receipt/OCR preview blocks were removed; Bills now uses recurring plan items only; Goals tab renders real goals with no sample what-if simulator.

### P6 - Insights, Assistant, and Settings Persistence

**Description:** Convert analytical and AI-adjacent surfaces from samples/local state to persisted, explainable data.

**Acceptance criteria:**
- Financial health score and month-end report are computed from backend contracts.
- Assistant startup state is persisted or server-provided, not seeded by local sample messages.
- AI personality and privacy settings persist to the backend.
- Assistant proposals remain reviewable before writes.

**Verification:** service tests, mobile typecheck, public API smoke, manual assistant/settings restart check.

**Progress 2026-09-20:** Added and remotely applied `get_financial_health`, `get_month_end_report`, and profile preference columns; regenerated hosted Supabase types. Financial Health and Month-End Report consume typed backend contracts. AI personality and privacy settings persist to `profiles`. Assistant startup sample messages and fake metric cards were removed; it now renders actual deployed API responses only. Chat history persistence is deferred from the current parity release.

### P7 - Responsive and Hardcoded-Data Release Gate

**Description:** Run a full source cleanup and responsive pass after the core logic is real.

**Acceptance criteria:**
- No `preview`, `sample`, `mock`, or local-only financial data remains in core production routes.
- Fixed dimensions are replaced with tokenized, safe-area-aware, wrapping layouts where they can break small/large screens.
- Touch targets meet the design guide minimums.
- Dynamic text does not overlap controls on compact screens.
- Deferred routes are moved behind an explicit Preview/Lab entry point.

**Verification:** hardcoded-data scan, mobile typecheck, Expo check, Android compact-device review, Android large-screen/tablet review, light/dark theme review.

## Route Priority

1. Core now: `index`, `expenses`, `budgets`, `planning`, `goals`, `assistant`, `settings`, `modal`, onboarding/auth.
2. Core secondary: `forecast`, `bills`, `salary-day`, `transaction/[id]`, `financial-health`, `reports/month-end`, `settings/ai`, `privacy`.
3. Defer or Lab: `allocation`, `automations`, `credit-cards`, `driving-mode`, `income-mode`, `lockdown`, `shared-finances`, `vault`, `platform-surface`, `desktop-reference`.

## Release Gates

- `npm run typecheck`
- `npm run test`
- `npm run expo:check`
- `npm run smoke:public`
- hardcoded-data scan over `apps/mobile/app` and `apps/mobile/src`
- manual responsive review on compact phone and expanded/tablet viewport

## Verification Log

- 2026-09-20: `npm run typecheck` passed.
- 2026-09-20: `npm run lint` passed.
- 2026-09-20: `npm run test` passed: 65 core tests and 14 AI service tests.
- 2026-09-20: `npm run expo:check` passed.
- 2026-09-20: Targeted Prettier check passed for touched TS/TSX/MD files.
- 2026-09-20: `npm run db:test` is blocked locally because Docker Desktop is not running; the non-destructive `get_budget_progress` migration was applied to hosted Budgetify via Supabase MCP and verified in migration history.
- 2026-09-20: Additional hosted migrations applied via Supabase MCP and verified in migration history: `strategy_and_salary_contracts`, `insights_and_preferences`, and `onboarding_baseline`.
- 2026-09-20: Hardcoded-data scan over `apps/mobile/app` now reports only Settings Lab/Preview grouping plus explicitly deferred Lab/reference routes.

## Open Questions

- Chat history persistence is not in the first parity release; AI begins stateless with server-provided responses only.
- Should deferred Preview/Lab routes remain installed but hidden, or be removed from the shipped route tree until their backend contracts exist?
- Which two seeded demo accounts should be used for repeatable public smoke and RLS checks?