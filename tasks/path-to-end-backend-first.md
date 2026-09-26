# LYVORA Core V1 End-Phase Runbook

Date: 2026-09-26
Status: RELEASE_CANDIDATE_BLOCKED
Purpose: One executable path from the current finance foundation to a verified Core V1 tag.

This file is the operational source of truth for the remaining work. Completed implementation is recorded below so nobody repeats it, but completed items are not active tasks.

## Product Contract

Core V1 navigation is exactly:

1. Home
2. Transactions
3. Budget
4. Goals
5. Settings

The release loop is manual account -> transaction -> budget -> goal. AI assistant, voice, bank connections, OCR, PDF/CSV import, forecasting, automatic categorization, smart advice, automation, investments, crypto, and payments are outside this tag.

## Delivered Baseline: Do Not Rebuild

- Authentication: Supabase sign-in, sign-up, password reset, sign-out, persisted session restore, and guarded financial routes.
- Profile and onboarding: display name, currency, locale/profile baseline, income cadence, safety buffer, onboarding priority, and first signal are persisted.
- Accounts: user-scoped manual checking, cash, savings, and credit accounts with starting balances.
- Ledger: real income, expense, and transfer rows with source/destination account validation, category support, currency, date, and description.
- Transactions: modal creation, searchable month-scoped feed, refresh-after-write behavior, detail route, and no fake finance rows in Core V1.
- Budget: monthly budget records and real progress calculations for limit, spent, remaining, status, and daily allowance.
- Goals: create/update/contribution foundation, real progress, target currency handling, and strategy output for secondary screens.
- Recurring: basic recurring transaction records and upcoming entries; no automatic money movement.
- Dashboard: historical month navigation, local calendar month boundaries, account balance, income, expenses, net/saved amount, category spending, recurring items, and goal aggregate.
- Database: hosted Supabase migrations, generated types, user-scoped RLS, transfer constraints, account balance trigger, budget/goal/insight contracts, and pgTAP coverage.
- Scope cleanup: AI is hidden from the primary navigation; privacy/settings surfaces describe manual finance behavior.

## End Phase

### E0 - Freeze the release scope

Owner: Product/Scope owner

Instructions:

1. Treat the Core V1 contract above as frozen.
2. Do not add deferred AI/Lab routes to the five primary tabs.
3. Review the worktree and separate intentional V1 changes from unrelated user edits before committing.
4. Record any newly discovered issue in `tasks/todo-backend-first-parity.md` before fixing it.

Complete when the release file list is agreed and no deferred feature is required for the manual finance loop.

### E1 - Prove hosted database and RLS behavior

Owner: Backend/RLS owner

Run from the repository root:

```text
npm run db:test
```

Expected result: every explicitly supplied file under `supabase/tests` runs and reports PASS. The command must prove cross-user denial, transfer ownership rules, account balance behavior, budget progress, and app-config write restrictions.

Current failure: the command currently stops at `Initialising login role...` or `Connecting to remote database...` without returning a result.

Why it is not working: this is an environment/remote CLI failure, not evidence of a passing or failing SQL assertion. The linked Supabase session, network path, or remote test-login initialization is not completing. Local Docker is intentionally not part of this hosted-only workflow.

Recovery:

1. Confirm the linked project is `hnlieepsxoqeebkreugt` and the URL is `https://hnlieepsxoqeebkreugt.supabase.co`.
2. Run the Supabase CLI with debug output and capture the first network/auth error.
3. Re-authenticate the CLI through its supported browser flow if the session is stale.
4. Run the explicit test directory, not default discovery, so all SQL files execute.
5. Do not use `supabase db reset --linked` or mark this gate complete from a hanging process.

### E2 - Prove public authenticated smoke

Owner: Backend/API owner

Required secrets must be entered locally, never in chat or source control:

```text
SMOKE_USER1_TOKEN=<token in local ignored environment>
SMOKE_USER2_TOKEN=<token in local ignored environment>
npm run smoke:public
```

Expected result: HTTPS health succeeds, unauthenticated chat is rejected, user 1 can perform the supported scoped write/read flow, and user 2 cannot access user 1 data.

Current failure: only public health has evidence. The authenticated smoke has not run because two test-user access tokens are not available in the environment.

Why it is not working: the script cannot create a trustworthy authenticated/RLS result without real short-lived user tokens. Never replace this with a publishable key or a service-role key.

Complete when the output is captured without printing tokens or financial payloads.

### E3 - Perform Android responsive acceptance

Owner: Mobile QA owner

Verify the five primary tabs and the add transaction action on:

- compact Android phone around 360 dp width;
- large Android phone;
- expanded/tablet layout;
- light theme and dark theme;
- large system text;
- loading, empty, error, populated, historical-month, and keyboard states.

Check that text wraps, controls retain touch targets, safe areas are respected, month navigation remains usable, and no account/transaction/budget/goal value overlaps another control.

Current failure: static type/lint checks do not prove Android layout behavior, and no final device screenshot/evidence set is recorded.

Why it is not working: this requires an emulator or physical device session; it cannot be honestly inferred from TypeScript.

Complete when screenshots or a QA log identify each viewport/theme as PASS, with any defect fixed and rechecked.

### E4 - Run the final release gate

Owner: Release owner

Run after E1-E3:

```text
npm run verify
npm run db:test
npm run smoke:public
```

Also run the source scan over `apps/mobile/app` and `apps/mobile/src`, excluding generated `dist` and build output. The scan must find no fake financial values in Core V1 routes. Review `git diff --check`, secrets, debug output, and the final file list.

Current failure: the consolidated gate has not yet produced a final green result after the latest responsive/dashboard changes; the hosted database and authenticated smoke gates are also unresolved.

Complete when all commands return success, the worktree contains only reviewed release changes, and the release owner signs off.

### E5 - Commit and tag V1

Owner: Release owner + Product/Scope owner

Do not tag a dirty tree or tag before E1-E4.

```text
git status --short
git add <reviewed-release-files>
git commit -m "release: LYVORA Core V1"
git tag -a v1.0.0 -m "LYVORA Core V1"
git show --stat --oneline v1.0.0
```

The existing `v1.0-legacy-web` tag is unrelated and must not be reused. Push the commit and tag only after local review and any required deployment approval.

## Stop Rules

- Stop if the Supabase project ref differs from `hnlieepsxoqeebkreugt`.
- Stop if a test requires a secret/service-role key in the mobile app or API.
- Stop if a migration is destructive or remote history is unexpected.
- Stop if a release tag would omit uncommitted implementation changes.
- Stop if a deferred AI/Lab feature is being used to hide a missing manual finance contract.
