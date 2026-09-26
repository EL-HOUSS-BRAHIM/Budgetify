# LYVORA Core V1 Release Handoff

Date: 2026-09-26
Status: RELEASE_CANDIDATE_BLOCKED

This is the short index for the end phase. Do not use the historical T0-T26 platform checklist; those phases are complete, superseded, or outside the manual-first Core V1 boundary.

## Canonical Documents

- Detailed commands and stop rules: `tasks/path-to-end-backend-first.md`
- Acceptance plan and roles: `tasks/plan-app-logic-responsive.md`
- Project release rules: `tasks/plan.md`
- Evidence and blockers: `tasks/progress-app-logic-responsive.md`
- Backend/frontend handoff: `tasks/progress-backend-frontend-parity.md`
- Executable checklist: `tasks/todo-backend-first-parity.md`

## Current End Phase

1. Hosted database/RLS proof.
2. Authenticated public API smoke.
3. Android responsive/runtime acceptance.
4. Final verify, clean commit, and `v1.0.0` tag.

## Current Blocker Summary

- Database: `npm run db:test` stalls at remote login-role initialization; CLI/session/network recovery is required.
- Public smoke: two local test-user tokens are missing; authenticated isolation is unproven.
- Android QA: no final compact/expanded/theme/large-text runtime evidence exists.
- Release: worktree is dirty and the complete post-change verification record is not green.

## Core V1 Boundary

Home, Transactions, Budget, Goals, Settings; authenticated manual accounts; income/expense/transfer transactions; categories; monthly budgets; savings goals; basic recurring transactions; historical month dashboard calculations; onboarding; strict RLS.

AI, voice, bank connections, OCR/imports, forecasting, automatic categorization, smart advice, automation, investments, crypto, payments, and other Lab routes remain deferred and must not be added to the release checklist.

## Tag Rule

Create the annotated `v1.0.0` tag only after all four end-phase gates pass, the selected release files are committed, `git status --short` is empty, and the tag hash is recorded.
