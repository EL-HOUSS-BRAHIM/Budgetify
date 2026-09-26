# LYVORA Core V1 Release Plan

Date: 2026-09-26
Status: RELEASE_CANDIDATE_BLOCKED
Canonical execution: `tasks/path-to-end-backend-first.md`

## Purpose

This file replaces the old platform-foundation and Financial OS build sequence. Those foundation phases are complete or superseded. The remaining work is release proof for the manual account -> transaction -> budget -> goal loop.

## Non-Negotiable Rules

1. Supabase project target is `hnlieepsxoqeebkreugt`.
2. Supabase Auth is the only mobile identity boundary.
3. Every finance table and write remains user-scoped under RLS.
4. Money remains integer minor units with an explicit currency.
5. Core V1 contains no AI-first navigation or simulated financial values.
6. No service-role key is shipped to mobile or used to bypass RLS.
7. No remote reset is allowed; schema changes are forward migrations only.
8. A release tag is allowed only on a clean, reviewed commit with green required gates.

## End-Phase Work Only

| Phase | Owner | Required result | Current problem |
|---|---|---|---|
| Database proof | Backend/RLS | Hosted pgTAP passes all intended files | CLI stops at remote login initialization |
| Public smoke | API | Two-user HTTPS auth/RLS smoke passes | Test-user tokens are not available |
| Android QA | Mobile QA | Five tabs pass compact/expanded/theme/text review | No final runtime evidence is recorded |
| Release | QA/Release | Verify, clean commit, `v1.0.0` tag | Earlier gates and worktree are unresolved |

## Why Gates Are Currently Not Working

### Hosted database

`npm run db:test` reaches `Initialising login role...` or `Connecting to remote database...` and does not return. This means the command has not produced a SQL result. The likely boundary is Supabase CLI authentication, linked-project connectivity, or remote test-role initialization. The next owner must run the CLI with debug output, verify the project ref, and repair the session/network path before interpreting SQL assertions.

### Authenticated public smoke

`npm run smoke:public` needs two real user access tokens. They are intentionally not generated, pasted into chat, logged, or committed. Without them, only `/health` and unauthenticated behavior can be tested; authenticated writes and cross-user isolation remain unproven.

### Android responsiveness

TypeScript, lint, and Expo dependency checks cannot reveal clipped text, keyboard overlap, safe-area errors, or tablet layout failures. A device/emulator review with evidence is still required.

### Release tag

The worktree contains uncommitted implementation, formatter, and documentation changes. A tag at the current commit would not include those changes; a tag on a dirty tree would not be reproducible. The release owner must select, review, commit, and then tag the exact release contents.

## Completion Artifact

The final release record must include:

- hosted pgTAP output;
- public smoke output summary with tokens redacted;
- Android QA matrix;
- `npm run verify` result;
- source scan result;
- reviewed commit hash;
- `v1.0.0` tag hash.
