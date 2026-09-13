# Tasks: platform-foundation

Plan: `tasks/plan.md` · Spec: `docs/SPEC-platform-foundation.md`

## Progress

| Task | State | Evidence |
|---|---|---|
| T0 Node toolchain | done | Node v24.20.0, npm 11.19.0 |
| T1 Workspace root | done | `npm install` exits 0 across monorepo |
| T2 TS / lint / format config | done | `npm run lint` and `typecheck` exit 0 |
| T3 core + money primitives | done | 65 tests, 100% line coverage |
| T4 verify + CI | done | `npm run verify` exits 0 locally with all gates clean |
| T5 Supabase local stack | superseded | Hosted-only workflow requested; no Docker/local stack |
| T6 Baseline migration + RLS tests | written, unverified remotely | Two migrations exist but are not applied on hosted Budgetify |
| T7 Generated types | stale | Must be regenerated from the hosted schema after migration push |
| T8 Expo app shell | done | Expo Router tab shell, tokens, dark/light theme, dashboard, budgets, expenses, planning checklist, modal |
| T9 Supabase client in the app | done | `src/lib/supabase.ts` with SecureStore session persistence |
| T10 services/ai health endpoint | blocked | 4 tests pass; typecheck and production start fail |
| T11 Safe hosted target | ready | Project ref known; credential rotation and CLI verification pending |
| T12 Shippable server baseline | ready | Compile/start/dependency defects reproduced |
| T13 Hosted auth configuration | blocked | Depends on T11 and T12 |
| T14 Push hosted migrations | blocked | Depends on T11 target gate |
| T15 Generate hosted types | blocked | Depends on T14 |
| T16 Authenticated backend smoke | blocked | Depends on T13 and T15 |
| T17 Public API deployment | deferred | Begins only after T16 passes and host is selected |

Anything marked "written, unverified" is a claim, not a fact. It becomes done
when its verification command has actually been run.

---

## Hosted backend launch — current priority

No task in this phase starts local Supabase or downloads Docker images. Commands
must use the Supabase CLI already installed in `node_modules`.

## T11: Establish the safe hosted target

**Description:** Rotate the database password previously exposed in chat, sign in
to Supabase without sharing credentials, and link only the Budgetify project
`hnlieepsxoqeebkreugt`. Retrieve its publishable key into ignored local environment
files. The unrelated shared MCP is excluded from this workflow.

**Acceptance criteria:**
- [ ] The database password has been rotated in the Supabase Dashboard
- [ ] CLI project output and linked migration output show `hnlieepsxoqeebkreugt`
- [ ] `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` are stored outside git
- [ ] No secret/service-role key is used by the mobile app or AI service

**Verification:** Run the installed CLI's project and linked migration listing;
inspect `git status` and staged diffs for secrets.

**Dependencies:** None · **Scope:** S · **Owner:** user + agent

**Files likely touched:**
- `services/ai/.env.example`
- `apps/mobile/.env.example`
- ignored local `.env` files

---

## T12: Make the AI service compile and boot

**Description:** Declare every runtime dependency, fix the three current strict
TypeScript errors, and use a production build/start path that resolves modules
under supported Node releases. Keep `/health` independent of LLM configuration.

**Acceptance criteria:**
- [ ] `@supabase/supabase-js` and `zod` are direct service dependencies
- [ ] Service type-check and route tests pass
- [ ] Production start serves `GET /health` with HTTP 200
- [ ] Container build/start uses the same proven production artifact

**Verification:** `npm run typecheck --workspace services/ai`; `npm run test
--workspace services/ai`; production start followed by a `/health` request.

**Dependencies:** None · **Scope:** M

**Files likely touched:**
- `services/ai/package.json`
- `services/ai/tsconfig.json`
- `services/ai/src/app.ts`
- `services/ai/src/executor.ts`
- `services/ai/Dockerfile`

---

## T13: Wire hosted Supabase auth safely

**Description:** Replace the placeholder API key with validated hosted
configuration. The service uses a publishable key to identify the application and
the caller's Supabase access token to preserve RLS. Validate HTTP input and make
CORS explicit before public deployment.

**Acceptance criteria:**
- [ ] Missing/invalid hosted configuration fails clearly at startup
- [ ] No project URL, placeholder key, or elevated key is hard-coded
- [ ] Invalid/expired caller tokens return 401 and never execute a tool
- [ ] Chat payloads are schema-validated and CORS is allowlisted

**Verification:** Focused tests cover missing config, invalid payload, invalid JWT,
and successful forwarding of a caller-scoped token.

**Dependencies:** T11, T12 · **Scope:** M

**Files likely touched:**
- `services/ai/.env.example`
- `services/ai/src/app.ts`
- `services/ai/src/executor.ts`
- `services/ai/src/server.ts`
- `services/ai/src/app.test.ts`

---

## T14: Apply migrations to hosted Budgetify

**Description:** Inspect the hosted migration history and public schema, run a
remote dry run, and apply the two committed migrations to the verified project.
No linked reset, schema pull, local stack, or Docker command is permitted.

**Acceptance criteria:**
- [ ] Preflight confirms the exact project ref and expected remote state
- [ ] Dry run contains only the two expected migrations and no destructive SQL
- [ ] Push succeeds and both timestamps appear in remote migration history
- [ ] Remote database lint reports no errors

**Verification:** Installed CLI `migration list --linked`, `db push --dry-run`,
`db push`, then `db lint --linked --fail-on error`.

**Dependencies:** T11 · **Scope:** S

**Files likely touched:**
- `supabase/migrations/20260908000000_baseline_profiles.sql`
- `supabase/migrations/20260913000000_schema_budgetify.sql`

---

## Checkpoint E — hosted schema and runtime
- [ ] T11 target gate passed before any remote write
- [ ] T12 production server boots and passes tests/type-check
- [ ] T13 has no elevated Supabase key and rejects invalid callers
- [ ] T14 migration history and remote lint are clean

---

## T15: Generate types from hosted schema

**Description:** Regenerate the committed database types directly from the hosted
Budgetify project after migration deployment, replacing the local-only workflow.

**Acceptance criteria:**
- [ ] Type generation explicitly targets `hnlieepsxoqeebkreugt`
- [ ] Generated tables and RPCs match the hosted public schema
- [ ] Workspace type-check and tests pass with the regenerated file

**Verification:** Generate types with `--project-id` or `--linked`; run workspace
type-check and tests; inspect the generated diff.

**Dependencies:** T14 · **Scope:** S

**Files likely touched:**
- `package.json`
- `packages/types/src/database.ts`

---

## T16: Run an authenticated hosted-backend smoke test

**Description:** Start Hono locally on port 8787 using hosted Supabase values. Use
a dedicated test account to exercise one read and one write through `/api/chat`,
then prove a second account cannot access the first account's data.

**Acceptance criteria:**
- [ ] `/health` returns 200 and `/api/chat` without a token returns 401
- [ ] A caller-scoped expense command creates the expected hosted row
- [ ] Summary reads only that caller's data
- [ ] A second user cannot read or mutate the first user's rows

**Verification:** HTTP smoke script against localhost plus read-only confirmation
in the Supabase Dashboard. Tokens and financial payloads are not logged.

**Dependencies:** T13, T15 · **Scope:** M

**Files likely touched:**
- `services/ai/.env.example`
- `services/ai/src/app.test.ts`
- optional smoke-test script under `services/ai`

---

## Checkpoint F — backend usable now
- [ ] Hosted schema is applied and typed
- [ ] Local Hono server talks to hosted Supabase
- [ ] Authenticated write/read works end to end
- [ ] Cross-user RLS denial is proven

---

## T17: Deploy the API publicly

**Description:** Select a managed Node/Docker host, configure environment values in
its secret store, deploy the verified artifact, and repeat the smoke tests over
HTTPS. This task is intentionally after the local-to-hosted proof.

**Acceptance criteria:**
- [ ] Deployment builds from the repository without local machine state
- [ ] Hosted `/health` returns 200 over HTTPS
- [ ] Authenticated smoke and RLS isolation tests pass against the public URL
- [ ] Logs expose neither credentials nor user financial data

**Verification:** Provider deployment status plus external health/auth/write/RLS
smoke checks and a rollback rehearsal.

**Dependencies:** T16, deployment-host decision · **Scope:** M

**Files likely touched:**
- provider deployment configuration
- `services/ai/Dockerfile`
- `README.md`

---

## T0: Upgrade the Node toolchain

**Description:** The machine runs Node v20.3.1 / npm 9.6.7. Expo 57 requires
Node >= 20.19.4. This gates every other task — nothing installs until it is done.
Requires the user to run an installer.

**Acceptance criteria:**
- [ ] `node --version` reports >= 20.19.4 (Node 22 LTS recommended)
- [ ] `.nvmrc` at the repo root pins the chosen version
- [ ] Root `package.json` declares `engines.node`

**Verification:** `node --version` and `npm --version` in a fresh shell.

**Dependencies:** None · **Scope:** XS · **Owner:** user

---

## T1: Workspace root

**Description:** Root `package.json` with npm workspaces covering `apps/*`,
`packages/*` and `services/*`, plus the script surface from the spec. `legacy/`
is excluded from workspaces so its stale `package.json` is never installed.

**Acceptance criteria:**
- [ ] `npm install` completes from a clean clone
- [ ] `legacy/` is not in the workspace globs and its deps are not installed
- [ ] Every script named in the spec exists, even if some are stubs at this point

**Verification:** `npm install`; `npm run` lists all documented scripts.

**Dependencies:** T0 · **Scope:** S

---

## T2: Shared TypeScript, lint and format config

**Description:** `tsconfig.base.json` with `strict: true` and path aliases for
`@budgetify/core` and `@budgetify/types`. Flat ESLint config. Prettier. The
`no-restricted-imports` rule banning `legacy/` lands here.

**Acceptance criteria:**
- [ ] `strict` and `noUncheckedIndexedAccess` are on
- [ ] Importing from `legacy/` fails lint with a message pointing at the reuse ledger
- [ ] Default exports are a lint error
- [ ] `npm run lint` and `npm run typecheck` pass on the empty tree

**Verification:** Add a temporary file importing from `legacy/`, confirm lint
fails, delete it.

**Dependencies:** T1 · **Scope:** S

---

## Checkpoint A — after T0–T2
- [ ] Clean clone installs
- [ ] Lint and typecheck pass on an empty tree
- [ ] Review structure with the user before adding code

---

## T3: `packages/core` with money primitives

**Description:** First real code and the first reuse-ledger action. Money as
integer minor units: `Money` type, `addMoney`, `subtractMoney`, `multiplyMoney`,
`allocate` (remainder-distributing split), `formatMoney` (ported from legacy
`formatCurrency`), parsing from user input. Typed `BudgetifyError` base.

Tests are written before the implementations, and `formatMoney` is tested
against the legacy `Intl.NumberFormat` behaviour it replaces.

**Acceptance criteria:**
- [ ] Mixing currencies throws `MismatchedCurrencyError`, never coerces
- [ ] `allocate` distributes remainder without losing or inventing a minor unit
- [ ] `formatMoney` output matches legacy `formatCurrency` for USD, EUR, MAD
- [ ] Coverage >= 90%
- [ ] `packages/core` imports nothing with I/O

**Verification:** `npm run test:core -- --coverage`

**Dependencies:** T2 · **Scope:** M

**Ledger rows actioned:** currency formatting → `done`

---

## T4: Root `verify` script and CI

**Description:** `npm run verify` = lint + typecheck + test + `expo install --check`.
GitHub Actions runs it on every PR and on pushes to `main`.

**Acceptance criteria:**
- [ ] `verify` fails if any sub-step fails
- [ ] CI runs on PR and on `main`
- [ ] CI caches npm to keep runs under ~3 minutes
- [ ] A deliberately broken commit fails CI

**Verification:** Open a throwaway PR with a type error; confirm red.

**Dependencies:** T3 · **Scope:** S

---

## Checkpoint B — after T3–T4
- [ ] CI green on `main`
- [ ] Coverage threshold enforced, not merely reported

---

## T5: Supabase local stack

**Description:** `supabase/config.toml` and the `db:start` / `db:reset` scripts.
No application schema yet.

**Acceptance criteria:**
- [ ] `npm run db:start` brings up Postgres, Auth, Storage locally
- [ ] `npm run db:reset` is idempotent
- [ ] README documents the hosted-branch fallback when Docker is unavailable

**Verification:** `npm run db:start`, connect with `psql`, `npm run db:reset` twice.

**Dependencies:** T1 · **Scope:** S

---

## T6: Baseline migration and RLS test harness

**Description:** One migration creating a `profiles` table keyed to `auth.users`
with RLS enabled, plus its pgTAP tests. This is not the `identity` module — it
exists to prove the migration and policy-testing loop works before real tables
depend on it.

**Acceptance criteria:**
- [ ] Migration applies cleanly on a reset database
- [ ] RLS is enabled; the table denies by default
- [ ] A pgTAP test proves user A **cannot** read user B's row
- [ ] `supabase test db` runs from `npm run test`

**Verification:** `npm run db:reset && npx supabase test db`

**Dependencies:** T5 · **Scope:** M

---

## T7: Generated database types

**Description:** `db:types` writes `packages/types` from the local schema. Never
hand-edited; CI fails if regeneration dirties the tree.

**Acceptance criteria:**
- [ ] `npm run db:types` produces a compiling `packages/types`
- [ ] The generated file carries a do-not-edit header
- [ ] CI fails when the committed types are stale

**Verification:** Regenerate, confirm `git diff` is empty.

**Dependencies:** T6 · **Scope:** S

---

## Checkpoint C — after T5–T7
- [ ] Local database reproducible from migrations alone
- [ ] RLS denial proven by test, not assumed
- [ ] Types flow from schema to TypeScript with no manual step

---

## T8: Expo app shell — tokens, theme, router

**Description:** The Expo app with design tokens (colour, spacing, radius, type
scale, both schemes), a theme provider, and an `expo-router` layout with a tab
shell. One screen, rendering from tokens. Imports `@budgetify/core` to prove
Metro resolves workspace packages.

**Acceptance criteria:**
- [ ] App launches on a physical Android device via `npm run dev`
- [ ] No literal colour or spacing value in any component — tokens only
- [ ] Light and dark schemes both render, following the OS setting
- [ ] A value formatted by `@budgetify/core`'s `formatMoney` appears on screen
- [ ] Type scale respects the OS font-size accessibility setting

**Verification:** Run on device; toggle OS dark mode; enlarge system font.

**Dependencies:** T3, T7 · **Scope:** M

---

## T9: Supabase client wired into the app

**Description:** Typed Supabase client using SecureStore for session persistence
and the anon key only, plus a TanStack Query provider. One screen reads a real
row from the local database.

**Acceptance criteria:**
- [ ] Client is typed from `packages/types`
- [ ] Session persists across app restarts
- [ ] Only the anon key is present in the app; no service-role key anywhere
- [ ] `.env.example` documents every variable; no real `.env` is committed
- [ ] A row inserted with `psql` appears in the app after refresh

**Verification:** Insert a row locally; pull to refresh; restart the app and
confirm the session survives.

**Dependencies:** T8 · **Scope:** M

---

## T10: `services/ai` health endpoint

**Description:** Hono service with `GET /health` and a Dockerfile. No LLM code —
this proves the deploy path before `assistant` needs it.

**Acceptance criteria:**
- [ ] `npm run dev:api` serves `GET /health` → `{"status":"ok"}` on :8787
- [ ] Container builds and runs
- [ ] A route test runs under `npm run test`
- [ ] No secret is required to boot

**Verification:** `curl localhost:8787/health`; `docker build && docker run`.

**Dependencies:** T1 · **Scope:** S

---

## Checkpoint D — module complete
- [ ] All ten success criteria in `docs/SPEC-platform-foundation.md` met
- [ ] `npm run verify` green from a clean clone
- [ ] Reuse-ledger rows actioned in this module marked `done`
- [ ] Review with the user, then start `SPEC-identity.md`
