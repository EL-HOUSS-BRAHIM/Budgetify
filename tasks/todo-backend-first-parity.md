# LYVORA Core V1 End-Phase Todo

Date: 2026-09-26
Status: RELEASE_CANDIDATE_BLOCKED
Canonical runbook: `tasks/path-to-end-backend-first.md`

Completed implementation is intentionally omitted from the active checklist. See `tasks/progress-app-logic-responsive.md` for the delivered baseline.

## R0 - Freeze and ownership

Owner: Product/Scope + Release

- [ ] Confirm the five-tab boundary remains Home, Transactions, Budget, Goals, Settings.
- [ ] Confirm no deferred AI/Lab feature is required to complete the manual account -> transaction -> budget -> goal journey.
- [ ] Review the dirty worktree and identify exactly which changes belong in the V1 release commit.
- [ ] Record any new issue here before making a scope-changing edit.

Why currently not complete: the worktree contains user/formatter changes and no final release file list has been signed off.

## R1 - Hosted database and RLS proof

Owner: Backend/RLS

- [ ] Verify the linked Supabase ref is `hnlieepsxoqeebkreugt`.
- [ ] Run CLI debug diagnostics for the stalled remote login-role initialization.
- [ ] Re-authenticate or repair the linked CLI session/network path.
- [ ] Run `npm run db:test` with the explicit `supabase/tests` directory.
- [ ] Capture PASS output for all intended test files, including cross-user denial and transfer/balance checks.

Why currently not complete: the command reaches `Initialising login role...` / `Connecting to remote database...` and does not return a result. Do not mark this complete until SQL assertions actually run.

## R2 - Public API smoke

Owner: API

- [ ] Create or select two dedicated test users outside chat.
- [ ] Put their access tokens in ignored local environment variables only.
- [ ] Run `npm run smoke:public`.
- [ ] Confirm health, unauthenticated rejection, user-scoped write/read, and cross-user denial.
- [ ] Save redacted output in the release record.

Why currently not complete: test-user tokens are unavailable. Never substitute a publishable/service-role key or log tokens.

## R3 - Android runtime QA

Owner: Mobile QA

- [ ] Review compact phone around 360 dp.
- [ ] Review large phone and expanded/tablet layout.
- [ ] Review light and dark themes.
- [ ] Review large system text and keyboard-open forms.
- [ ] Review loading, empty, error, populated, and historical-month states.
- [ ] Test add account, income, expense, transfer, category selection, monthly budget, goal, recurring transaction, and search.
- [ ] Record screenshots or a dated PASS/FAIL matrix.

Why currently not complete: no final device/emulator evidence has been recorded; static checks cannot certify runtime layout behavior.

## R4 - Final verify and tag

Owner: QA/Release

- [ ] Run `npm run verify` after all latest edits.
- [ ] Run the source hardcoded-data scan excluding generated output.
- [ ] Run `git diff --check` and inspect secrets/debug files.
- [ ] Confirm R1, R2, and R3 evidence exists.
- [ ] Commit only reviewed release files with `release: LYVORA Core V1`.
- [ ] Create annotated tag `v1.0.0` on the clean release commit.
- [ ] Verify the tag points to the intended commit and publish it according to repository policy.

Why currently not complete: the final combined gate has not been recorded green, remote/API/device evidence is missing, and the worktree is dirty. Tagging now would be misleading.

## Release Stop Conditions

- Wrong Supabase project ref.
- Destructive or reset migration command.
- Any elevated key added to mobile/API runtime.
- Fake financial values introduced into a Core V1 route.
- A tag created before the clean commit and all required evidence.
