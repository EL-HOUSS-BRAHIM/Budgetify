# Tasks: platform-foundation

Plan: `tasks/plan.md` · Spec: `docs/SPEC-platform-foundation.md`

## Backend-Frontend parity planning (new)

- Progress state matrix: `tasks/progress-backend-frontend-parity.md`
- Path to end (backend-first): `tasks/path-to-end-backend-first.md`
- Execution todo board: `tasks/todo-backend-first-parity.md`

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
| T10 services/ai health endpoint | done | 2026-09-15: `/health` returns 200 locally and in Docker; no secret required to boot; route tests pass |
| T11 Safe hosted target | done | 2026-09-15: user confirmed password rotation; linked target `hnlieepsxoqeebkreugt` verified via CLI; required env keys present only in local ignored env files; no service-role key usage in app/service |
| T12 Shippable server baseline | done | 2026-09-15: `npm run typecheck --workspace services/ai` pass; `npm run test --workspace services/ai` pass (12 tests); `npm run start --workspace services/ai` serves `/health` 200; Docker build+run serves `/health` 200 |
| T13 Hosted auth configuration | done | 2026-09-15: startup config validation added (`SUPABASE_URL` + publishable key format); placeholder/elevated key paths rejected; caller JWT validation and schema validation tests pass; CORS allowlist enforced for `/api/*` |
| T14 Push hosted migrations | done | 2026-09-15: preflight target `hnlieepsxoqeebkreugt` verified; `db push --linked --dry-run` up-to-date with no pending SQL; `db push --linked` no-op success; `db lint --linked --schema public --fail-on error` clean |
| T15 Generate hosted types | done | 2026-09-15: generated via `supabase gen types typescript --linked --schema public` on linked `hnlieepsxoqeebkreugt`; UTF-8 normalized; workspace `npm run typecheck` and `npm run test` pass |
| T16 Authenticated backend smoke | done | 2026-09-15: user confirmed token-driven two-user smoke passed; `/health` 200 and unauthenticated `/api/chat` 401 verified; caller-scoped write/read and cross-user RLS denial proven |
| T17 Public API deployment | in progress | 2026-09-19: Switched to Back4App Containers; deployment runbook (`docs/DEPLOY-API-BACK4APP.md`) and public HTTPS smoke script (`services/ai/public-smoke-t17.mjs`) updated; awaiting Back4App deploy URL + token run evidence |

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
- [x] The database password has been rotated in the Supabase Dashboard
- [x] CLI project output and linked migration output show `hnlieepsxoqeebkreugt`
- [x] `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` are stored outside git
- [x] No secret/service-role key is used by the mobile app or AI service

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
- [x] `@supabase/supabase-js` and `zod` are direct service dependencies
- [x] Service type-check and route tests pass
- [x] Production start serves `GET /health` with HTTP 200
- [x] Container build/start uses the same proven production artifact

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
- [x] Missing/invalid hosted configuration fails clearly at startup
- [x] No project URL, placeholder key, or elevated key is hard-coded
- [x] Invalid/expired caller tokens return 401 and never execute a tool
- [x] Chat payloads are schema-validated and CORS is allowlisted

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
- [x] Preflight confirms the exact project ref and expected remote state
- [x] Dry run contains only the two expected migrations and no destructive SQL
- [x] Push succeeds and both timestamps appear in remote migration history
- [x] Remote database lint reports no errors

**Verification:** Installed CLI `migration list --linked`, `db push --dry-run`,
`db push`, then `db lint --linked --schema public --fail-on error`.

**Dependencies:** T11 · **Scope:** S

**Files likely touched:**
- `supabase/migrations/20260908000000_baseline_profiles.sql`
- `supabase/migrations/20260913000000_schema_budgetify.sql`

---

## Checkpoint E — hosted schema and runtime
- [x] T11 target gate passed before any remote write
- [x] T12 production server boots and passes tests/type-check
- [x] T13 has no elevated Supabase key and rejects invalid callers
- [x] T14 migration history and remote lint are clean

---

## T15: Generate types from hosted schema

**Description:** Regenerate the committed database types directly from the hosted
Budgetify project after migration deployment, replacing the local-only workflow.

**Acceptance criteria:**
- [x] Type generation explicitly targets `hnlieepsxoqeebkreugt`
- [x] Generated tables and RPCs match the hosted public schema
- [x] Workspace type-check and tests pass with the regenerated file

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
- [x] `/health` returns 200 and `/api/chat` without a token returns 401
- [x] A caller-scoped expense command creates the expected hosted row
- [x] Summary reads only that caller's data
- [x] A second user cannot read or mutate the first user's rows

**Verification:** HTTP smoke script against localhost plus read-only confirmation
in the Supabase Dashboard. Tokens and financial payloads are not logged.

**Dependencies:** T13, T15 · **Scope:** M

**Files likely touched:**
- `services/ai/.env.example`
- `services/ai/src/app.test.ts`
- optional smoke-test script under `services/ai`

---

## Checkpoint F — backend usable now
- [x] Hosted schema is applied and typed
- [x] Local Hono server talks to hosted Supabase
- [x] Authenticated write/read works end to end
- [x] Cross-user RLS denial is proven

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

**Execution notes (2026-09-15):**
- Render blueprint: `render.yaml`
- Deployment runbook: `docs/DEPLOY-API-RENDER.md`
- Public smoke script: `services/ai/public-smoke-t17.mjs` (also `npm run smoke:public`)

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

---

## Financial OS core — current product phase

The earlier platform tasks remain as historical implementation evidence. These
tasks implement the accepted product direction in `docs/DESIGN-GUIDE.md` and
`docs/CAPABILITY-MAP.md`.

## T18: Product contract and five-tab shell

**State:** done

**Description:** Establish the Financial OS product promise, Safe-to-Spend trust
rules, AI authority levels, shared mobile primitives, and the visible `Home`,
`Money`, `Plan`, `Goals`, `AI` navigation. Add a live, fixture-free Goals read.

**Acceptance criteria:**
- [x] Design guide and capability map encode the accepted direction
- [x] Visible navigation contains exactly five product jobs
- [x] Goals has loading, empty, error, refresh, and live-data states
- [x] Changed mobile files pass focused lint, formatting, and typechecking

**Verification:** `npx prettier --check` and `npx eslint` on changed files;
`npm run typecheck --workspace apps/mobile`.

**Dependencies:** Hosted platform foundation · **Scope:** M

---

## T19: Authentication and session gate

**Description:** Restore persisted sessions before routing and provide sign-in,
registration, verification, reset-password, and sign-out flows. Unauthenticated
users cannot enter financial tabs or call AI tools.

**Acceptance criteria:**
- [ ] Cold start routes deterministically after session restoration
- [ ] Auth forms validate input and preserve safe error messages
- [ ] Authenticated sessions survive restart; sign-out clears local session data

**Verification:** Focused auth tests, mobile typecheck, and emulator flows for new,
returning, expired-session, and signed-out users.

**Dependencies:** T18 · **Scope:** M

---

## T20: Safe-to-Spend domain contract

**Description:** Define and test pure minor-unit math for liquid funds, reliable
income, due obligations, committed saving, safety buffer, and forecast essentials.
Return readiness, confidence, horizon, included inputs, and missing inputs.

**Acceptance criteria:**
- [ ] Complete inputs produce a deterministic signed amount without losing units
- [ ] Missing required inputs return `not_ready`, never a fabricated zero
- [ ] Mixed currencies and invalid horizons fail with typed errors

**Verification:** Test-first focused core suite with boundary, negative, and
missing-input cases; core coverage remains above the enforced threshold.

**Dependencies:** T19 · **Scope:** M

---

## T21: Persist the financial baseline

**Description:** Add the minimum user-scoped data needed by T20: safety buffer,
income cadence/next expected income, and planning horizon. Provide a focused setup
flow and regenerate hosted types after a forward-only migration.

**Acceptance criteria:**
- [ ] Migration is additive and every new row/field remains user-scoped under RLS
- [ ] Setup stores integer minor units and original currency
- [ ] Generated types match hosted schema and setup can be resumed safely

**Verification:** Migration dry-run, pgTAP cross-user denial, generated-type diff,
mobile typecheck, and emulator setup flow.

**Dependencies:** T20 · **Scope:** M

---

## T22: Home command center

**Description:** Replace dashboard fixtures with Safe-to-Spend, financial snapshot,
attention queue, upcoming commitments, and an actual/scheduled timeline sourced
from hosted data.

**Acceptance criteria:**
- [ ] No mock amount is presented as current user data
- [ ] Safe-to-Spend shows horizon, confidence, provenance, and missing-input state
- [ ] Loading, empty, error, stale/offline, refresh, and negative-shortfall states work

**Verification:** Focused data-mapping tests, mobile checks, and emulator screenshots
at light/dark 360 dp plus large text.

**Dependencies:** T21 · **Scope:** M

---

## T23-T26: Complete the Core tabs

- [ ] **T23 Money:** live accounts and transaction ledger with search and honest states
- [ ] **T24 Plan:** live allocations, budgets, bills, commitments, and completion flow
- [ ] **T25 Goals:** validated create/edit/contribution flows and target alternatives
- [ ] **T26 AI:** structured action proposals, “Why?”, confirmation, result links, and undo

Each task is a separate medium vertical slice with focused tests, typecheck, lint,
and Android emulator verification. T26 depends on the domain operations from
T23-T25 and never implements a parallel write path.

## Checkpoint G — Financial OS core

- [ ] Fresh-user authentication and baseline setup pass end to end
- [ ] All five tabs use hosted user-scoped data and shared primitives
- [ ] Safe-to-Spend is explainable and refuses incomplete calculations
- [ ] AI Inform/Suggest/Prepare flows are reviewed; external execution is disabled
- [ ] Full `npm run verify` and Expo compatibility checks pass
