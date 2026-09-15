# TODO: Backend-First Parity Execution

Date: 2026-09-15

## Status Key

- DONE: Completed and verified.
- READY: Can start immediately.
- WAITING: Requires dependent task completion.
- BLOCKED: Cannot proceed safely until blocker is removed.
- DEFERRED: Not in current parity release.

## Phase M0 - Environment and Target Lock

- [x] DONE - Audit frontend/backend hardcoded vs live surfaces.
- [x] DONE - Confirm schema and RLS foundations exist in migrations and tests.
- [ ] BLOCKED - Align Supabase MCP target to Budgetify project for safe remote verification.
- [ ] READY - Add/confirm one canonical project-ref note in backend runbook.

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
- BLOCKED: safe remote MCP verification target
- READY: begin M1 and M2 implementation in app code immediately
