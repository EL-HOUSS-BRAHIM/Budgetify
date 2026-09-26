# LYVORA Core V1 End-Phase Progress

Date: 2026-09-26
Status: RELEASE_CANDIDATE_BLOCKED
Runbook: `tasks/path-to-end-backend-first.md`

## Delivered Baseline

The following work is complete enough that it must not be reopened as a planning task:

- Supabase auth lifecycle and guarded core routes.
- Profile/onboarding persistence, currency, income cadence, safety buffer, and account setup.
- Manual accounts, categories, income/expense/transfer transactions, search, details, and refresh-after-write.
- Monthly budgets with real progress, savings goals, basic recurring transactions, and account balance synchronization.
- Historical month-scoped Home calculations for balance, income, expenses, net, category spending, upcoming recurring entries, and goal aggregate.
- Hosted migrations, generated database types, RLS policies, transfer constraints, balance trigger, and finance RPCs.
- Core V1 navigation: Home, Transactions, Budget, Goals, Settings.
- AI removed from the primary product flow; deferred AI/Lab routes remain outside the release boundary.

## Current Evidence

| Check | Latest observed state | Meaning |
|---|---|---|
| Core unit suite | PASS: 180 tests | Domain dashboard, money, calendar, recurring, and related core logic pass |
| AI service suite | Previously PASS: 14 tests | Service tests passed before the latest documentation-only pass |
| Lint | PASS after finance fixes | No current ESLint findings were reported |
| Editor diagnostics | PASS | No diagnostics reported for the touched finance/dashboard files |
| Expo dependency check | PASS in the current session | Expo dependencies were reported up to date |
| Formatting | PASS on the latest reported files | Prettier cleared the files reported by the gate |
| Hosted pgTAP | BLOCKED | CLI stalls during remote login-role initialization |
| Authenticated public smoke | BLOCKED | `SMOKE_USER1_TOKEN` and `SMOKE_USER2_TOKEN` are not supplied |
| Android runtime QA | NOT RUN | No final emulator/device evidence is recorded |
| Release tag | NOT CREATED | Required gates and clean commit are not complete |

## Active Blockers

### B1 - Hosted pgTAP does not return

Owner: Backend/RLS

Observed output: `Initialising login role...` / `Connecting to remote database...`.

Why blocked: remote CLI login/session/network/test-role initialization does not complete, so the command gives no trustworthy SQL result.

Next action: verify linked ref and URL, run Supabase CLI debug output, re-authenticate through the supported flow if needed, then run `npm run db:test` with the explicit `supabase/tests` directory.

Exit evidence: all intended pgTAP files report PASS.

### B2 - Public authenticated smoke has no credentials

Owner: API

Why blocked: health does not exercise caller authentication or two-user RLS isolation; access tokens cannot be invented or placed in source control.

Next action: provide two dedicated local test-user tokens through ignored environment variables, then run `npm run smoke:public`.

Exit evidence: redacted output showing health, 401 unauthenticated rejection, user-scoped write/read, and cross-user denial.

### B3 - Android runtime review is missing

Owner: Mobile QA

Why blocked: static checks cannot prove small-screen wrapping, safe areas, keyboard behavior, theme contrast, or large-text layout.

Next action: review compact phone, large phone/tablet, light/dark, large text, loading/empty/error, and populated historical-month states.

Exit evidence: dated QA matrix and screenshots or equivalent device notes.

### B4 - Final verify and tag are pending

Owner: QA/Release

Why blocked: the full gate has not been captured green after all latest edits, and the worktree is dirty.

Next action: rerun `npm run verify`, inspect the release diff, commit only reviewed release files, then create annotated `v1.0.0`.

Exit evidence: clean `git status`, commit hash, tag hash, and green gate log.

## Deferred, Not Blocked

Forecast preview fallback, assistant, AI settings, voice, bank connections, OCR/imports, forecasting, automation, smart advice, investments, crypto, payments, shared finance, vault, and credit-card extensions are deliberately not Core V1 work. Do not convert these into release blockers.
