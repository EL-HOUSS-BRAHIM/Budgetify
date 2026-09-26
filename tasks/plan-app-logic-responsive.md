# LYVORA Core V1 End-Phase Plan

Date: 2026-09-26
Status: RELEASE_CANDIDATE_BLOCKED
Canonical runbook: `tasks/path-to-end-backend-first.md`

## Objective

Finish and release the existing manual finance foundation as LYVORA Core V1. This plan contains only the remaining end phase. The completed account, ledger, budget, goal, recurring, onboarding, monthly dashboard, auth, migration, and RLS implementation is recorded in the runbook and must not be restarted.

## Release Boundary

Primary tabs: Home, Transactions, Budget, Goals, Settings.

In scope for the final acceptance journey:

- authenticated user creates a profile and at least one manual account;
- user records income, expense, and transfer transactions;
- categories appear on transactions;
- user creates a monthly budget and sees real progress;
- user creates a savings goal and sees real progress;
- user creates a basic recurring transaction and sees it in upcoming items;
- user moves between current and historical months and sees month-scoped calculations;
- a second user cannot read or mutate the first user's financial rows;
- the five core screens remain usable on Android compact and expanded layouts.

Out of scope: AI, voice, connected banks, OCR, imports, forecasting, automatic categorization, smart advice, automation, investments, crypto, payments, and shared-finance extensions.

## Remaining Phases

### Phase 1 - Database proof

Owner: Backend/RLS

Deliverable: explicit pgTAP result for the hosted project, including every file in `supabase/tests`.

Acceptance:

- linked target is `hnlieepsxoqeebkreugt`;
- all intended SQL test files execute;
- cross-user reads/writes are denied;
- transfer constraints and balance trigger behave correctly;
- no reset or destructive command is used.

Failure explanation: `npm run db:test` currently hangs while initializing the remote login role. This is a CLI/session/network problem, so SQL correctness remains unproven until the command returns.

### Phase 2 - Public API proof

Owner: Backend/API

Deliverable: authenticated `npm run smoke:public` result using two locally supplied test-user tokens.

Acceptance:

- HTTPS health returns success;
- unauthenticated API access is rejected;
- user 1 write/read succeeds;
- user 2 cannot access user 1 data;
- output contains no token or financial payload.

Failure explanation: no test-user access tokens are currently supplied. A health check alone cannot prove authentication or RLS isolation.

### Phase 3 - Android acceptance

Owner: Mobile QA

Deliverable: a compact/expanded Android review record with screenshots or equivalent evidence.

Acceptance:

- Home month navigation and aggregate cards fit;
- Transactions search, filters, modal, transfer fields, keyboard, and empty states fit;
- Budget progress and create flow fit;
- Goals progress and create flow fit;
- Settings account/profile/onboarding/recurring actions fit;
- light, dark, large-text, loading, error, and no-data states fit;
- no overlap, clipped text, or unsafe touch target remains.

Failure explanation: responsive implementation exists, but static checks cannot certify runtime Android layout behavior and no final device evidence is recorded.

### Phase 4 - Final verification and release artifact

Owner: Release

Deliverable: green verification log, reviewed commit, and annotated `v1.0.0` tag.

Acceptance:

- `npm run verify` passes after the latest changes;
- `npm run db:test` passes explicitly over the full test directory;
- `npm run smoke:public` passes;
- source scan finds no fake financial data in Core V1 routes;
- no secrets/debug files are included;
- worktree is clean before tagging;
- `v1.0.0` points to the reviewed release commit.

Failure explanation: the current branch is dirty and the database/public smoke gates are unresolved. Tagging now would create an incomplete or non-reproducible V1 marker.

## Roles

| Role | Responsibility | Current state |
|---|---|---|
| Product/Scope | Protect the Core V1 boundary and approve release scope | Needed for final signoff; deferred features must remain deferred |
| Mobile | Fix runtime layout defects and keep all writes connected to real hooks | Implementation is largely present; runtime device evidence is missing |
| Backend/RLS | Prove migrations, RPCs, ownership, and hosted database behavior | Blocked on remote pgTAP login initialization |
| API | Prove public HTTPS auth and two-user isolation | Blocked on locally supplied user tokens |
| QA/Release | Run gates, inspect diff/secrets, commit, and tag | Cannot sign off while any required gate is unresolved |

## Required Handoff

Every completed phase must record: command, date, exact result, environment/target, and any remaining limitation. Do not write “done” from source inspection alone when the acceptance requires runtime or remote evidence.
