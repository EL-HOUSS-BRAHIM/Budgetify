# TODO: Backend-First Parity Execution

Date: 2026-09-15

Next-phase plan: `tasks/plan-app-logic-responsive.md`
Status snapshot: `tasks/progress-app-logic-responsive.md`

P0-P6 committed as `8bbcb95` ("Connect mobile app to real backend contracts"); working tree clean, `origin/main` up to date.

## Status Key

- DONE: Completed and verified.
- READY: Can start immediately.
- WAITING: Requires dependent task completion.
- BLOCKED: Cannot proceed safely until blocker is removed.
- DEFERRED: Not in current parity release.

## Phase M0 - Environment and Target Lock

- [x] DONE - Audit frontend/backend hardcoded vs live surfaces.
- [x] DONE - Confirm schema and RLS foundations exist in migrations and tests.
- [x] DONE - Align Supabase MCP target to Budgetify project for safe remote verification.
- [x] DONE - Add/confirm one canonical project-ref note in backend runbook.

## Phase M1 - Identity and Session UX

- [ ] READY - Add mobile sign-in screen (Supabase Auth).
- [ ] WAITING - Add mobile sign-up screen (depends on sign-in flow wiring).
- [ ] WAITING - Add password-reset flow.
- [ ] WAITING - Add guarded navigation for core financial tabs.
- [ ] WAITING - Persist profile preference updates (display_name/currency/locale).

## Phase M2 - Money Tab Parity

- [ ] READY - Replace hardcoded expenses array with real transactions query.
- [ ] WAITING - Add pagination/search behavior for transaction feed.
- [ ] WAITING - Ensure money feed reflects writes from modal/assistant flows.

## Phase M3 - Budgets and Planning Parity

- [ ] READY - Define budget progress contract (spent, limit, remaining, period).
- [ ] WAITING - Wire budgets tab to real budget data.
- [ ] WAITING - Define planning velocity contract.
- [ ] WAITING - Wire planning tab to backend contract and remove local preview values.
- [ ] WAITING - Add/extend RLS tests for new budget/planning write paths.

## Phase M4 - Goals, Bills, Salary, Transaction Detail Parity

- [ ] READY - Define goal strategy contract and output schema.
- [ ] WAITING - Wire goals strategy screen to contract output.
- [ ] READY - Define salary allocation contract and output schema.
- [ ] WAITING - Wire salary-day screen to backend recommendation output.
- [ ] WAITING - Remove static OCR/receipt line items or back with real receipt source.
- [ ] WAITING - Remove preview fallback from mixed routes once data contracts are complete.

## Phase M5 - Insights Parity

- [ ] READY - Implement financial health score contract.
- [ ] WAITING - Wire financial-health screen to health contract.
- [ ] READY - Implement month-end report contract (metrics + narrative).
- [ ] WAITING - Wire month-end screen to report contract.

## Phase M6 - Assistant and Settings Persistence

- [ ] READY - Add chat_messages persistence contract (if in release scope).
- [ ] WAITING - Persist AI personality and privacy settings in backend.
- [ ] WAITING - Remove local-only save behavior from settings screens.
- [ ] WAITING - Replace seeded assistant startup messages with persisted or backend-provided session context.

## Phase M7 - Preview Cleanup and Release Gates

- [ ] WAITING - Route-by-route classify core vs deferred screens.
- [ ] WAITING - Move deferred screens behind explicit Preview/Lab grouping.
- [ ] WAITING - Run hardcoded-data scan on source routes (exclude dist/build).
- [ ] WAITING - Final parity signoff across core tabs.

## Current Completion Snapshot

- DONE: audit + baseline schema/RLS verification
- DONE: safe remote MCP verification target aligned to Budgetify
- DONE: Core V1 navigation is limited to Home, Transactions, Budget, Goals, and Settings.
- DONE: AI assistant and preview access are removed from the primary product flow; future AI remains isolated.
- READY: begin M1 and M2 implementation in app code immediately

---

## Next Phase - App Logic, Real Data, and Responsive Release

Rule: backend is now treated as deployed at `https://budgetifyai-qika9xe4.b4a.run`, but authenticated public smoke evidence still gates production mobile wiring.

### P0 - Deployment and Contract Lock

- [x] DONE - Record deployed API base URL in ignored mobile env files and examples without secrets.
- [ ] WAITING - Run authenticated smoke against the deployed API with test-user tokens entered outside chat.
- [x] DONE - Public HTTPS health check returns `{"status":"ok","service":"budgetify-ai"}`.
- [x] DONE - Confirm mobile Supabase URL/project ref matches hosted Budgetify project `hnlieepsxoqeebkreugt`.
- [x] DONE - Scan mobile/service committed config for service-role or secret-key usage.
- [x] DONE - Supabase MCP points at `https://hnlieepsxoqeebkreugt.supabase.co` after retargeting VS Code `mcp.json`.

### P1 - App Logic Foundation

- [x] DONE - Create shared authenticated data hooks for profile, transactions, budget progress, and planning/plan items.
- [x] DONE - Add remaining shared hooks for accounts and goals creation/update flows.
- [x] DONE - Add typed mutation helpers for transaction and profile writes.
- [x] DONE - Add typed mutation helpers for budget, plan-item, goal, and settings writes.
- [x] DONE - Centralize transaction money/date formatting from profile currency and integer minor units.
- [x] DONE - Replace preview fallback behavior with loading, empty, error, and retry states on Money, Budgets, Plan, Goals, Bills, Assistant, and transaction detail.

### P2 - Identity, Onboarding, and Preferences

- [x] DONE - Add Supabase sign-in, sign-up, reset-password, sign-out, and session-restore UX.
- [x] DONE - Guard core financial tabs behind authenticated session.
- [x] DONE - Persist onboarding baseline: priority, monthly income cadence, safety buffer, and first signal.
- [x] DONE - Persist profile display name and currency across restart/re-login.
- [x] DONE - Persist remaining AI personality and privacy settings across restart/re-login.

### P3 - Ledger Write/Read Loop

- [x] DONE - Wire transaction modal to create real transactions.
- [x] DONE - Replace Money tab hardcoded expenses with real transaction feed.
- [x] DONE - Add search and pagination-ready ordering over real transactions.
- [x] DONE - Wire transaction detail to real transaction context or empty/not-found state only.
- [x] DONE - Refresh Money feed on focus so new transactions appear without app restart.

### P4 - Budgets and Planning Parity

- [x] DONE - Implement budget progress contract for limit, spent, remaining, period, and status.
- [x] DONE - Wire budgets tab to real progress contract.
- [x] DONE - Implement planning velocity/commitment contract from transactions, budgets, and plan items.
- [x] DONE - Wire planning tab to backend contract and remove local preview/correction messages.
- [x] DONE - Extend RLS tests for new budget progress contract.
- [ ] BLOCKED - Run pgTAP database tests locally; Docker Desktop is not running.

### P5 - Goals, Bills, Salary, and Detail Screens

- [x] DONE - Implement goal strategy output contract.
- [x] DONE - Wire goal strategy screen to real output or no-data state.
- [x] DONE - Implement salary allocation recommendation contract.
- [x] DONE - Wire salary-day screen to backend/core recommendation output and review-only prepared action.
- [x] DONE - Remove receipt/OCR preview blocks from transaction detail until real metadata exists.
- [x] DONE - Remove bills preview contracts and use recurring plan items only.

### P6 - Insights, Assistant, and Settings Persistence

- [x] DONE - Implement financial health score contract.
- [x] DONE - Implement month-end report contract.
- [x] DONE - Wire financial-health and month-end report screens to real outputs.
- [x] DONE - Decide chat history starts stateless for this release; persisted chat remains out of current parity scope.
- [x] DONE - Remove seeded assistant startup messages and fake response metrics.
- [x] DONE - Persist AI personality and privacy settings.

### P7 - Responsive and Hardcoded-Data Release Gate

- [x] DONE - Classify every route as Core, Core secondary, or Preview/Lab.
- [x] DONE - Move deferred Preview/Lab routes out of core navigation promises.
- [ ] READY - Replace brittle fixed dimensions with tokenized, safe-area-aware responsive layout primitives.
- [ ] WAITING - Verify dynamic text, small-phone, large-phone/tablet, light-theme, and dark-theme layouts.
- [x] DONE - Run hardcoded-data scan over mobile source and clear all core-route sample values.
- [x] DONE - Post-commit `typecheck` re-verified clean; `test`, `expo:check` still pending a final re-run after the responsive pass.
- [ ] WAITING - Run authenticated public smoke gate once test-user tokens are available.
