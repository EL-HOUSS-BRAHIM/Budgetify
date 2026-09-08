# Tasks: platform-foundation

Plan: `tasks/plan.md` · Spec: `docs/SPEC-platform-foundation.md`

## Progress

| Task | State | Evidence |
|---|---|---|
| T0 Node toolchain | **blocked — user action** | machine is on v20.3.1, Expo 57 needs >= 20.19.4 |
| T1 Workspace root | done | `npm install` exits 0 |
| T2 TS / lint / format config | done | `npm run lint` and `typecheck` exit 0 |
| T3 core + money primitives | done | 65 tests, 100% line coverage |
| T4 verify + CI | written, **unproven** | `npm run verify` exits 0 locally; CI has never run — no push yet |
| T5 Supabase local stack | written, **unverified** | `supabase start` not run; needs Docker |
| T6 Baseline migration + RLS tests | written, **unverified** | SQL not yet executed against a database |
| T7 Generated types | placeholder only | real generation needs T5 |
| T8 Expo app shell | **not started** | blocked by T0 |
| T9 Supabase client in the app | **not started** | blocked by T8 |
| T10 services/ai health endpoint | done | 2 tests passing |

Anything marked "written, unverified" is a claim, not a fact. It becomes done
when its verification command has actually been run.

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
