# Spec: platform-foundation

Module id: `platform-foundation` · Release: V1 · Depends on: —
Status: **draft** — review before implementation.

## Objective

Establish the repository, toolchain and app shell that every other module is
built inside. When this module is done, a developer can clone the repo, run one
install command, launch the Expo app on an Android device, and see a themed
screen that reads from a local Supabase instance — with lint, type-check and
tests all passing in CI.

This module ships no user-facing features. Its user is the developer, and its
success condition is that no later module has to make an infrastructure
decision.

**Not in scope:** authentication (`identity`), any screen with real data
(`ledger`), the AI service's actual tool-calling (`assistant`). The
`services/ai` directory is created with a health endpoint only, to prove the
deploy path exists.

## Assumptions

1. Android is the only build target initially; iOS config is present but
   unbuilt. No Apple developer account is assumed.
2. Development uses Expo Go plus development builds; no bare workflow, no
   committed `android/` or `ios/` directories.
3. Supabase runs locally via the Supabase CLI in Docker for development, and as
   a hosted project for staging/production.
4. The developer machine can run Docker. If not, development points at a hosted
   Supabase branch instead and the local-stack tasks are skipped.
5. Package manager is npm with workspaces — no pnpm/yarn, to avoid Metro
   symlink resolution issues that pnpm's store layout causes in React Native.

## Tech stack

| Concern | Choice | Why |
|---|---|---|
| Language | TypeScript, `strict: true` | Assistant tool schemas are generated from types; unsound types would silently widen the tool surface |
| Monorepo | npm workspaces | Native to the installed npm; Metro resolves hoisted `node_modules` without extra config |
| App | Expo SDK 57 (`expo@~57.0.20`) | Confirmed current release |
| Navigation | `expo-router` | File-based routing keeps the route tree greppable, which matters when the assistant needs to deep-link |
| Backend | Supabase (Postgres + RLS + Auth + Storage) | ADR 0001 |
| Client data | TanStack Query over `@supabase/supabase-js@^2.116.0` | Cache invalidation is the hard part of the offline-sync module later; Query gives it a seam now |
| Validation | Zod | One schema serves form validation, RPC input, and assistant tool definitions |
| Styling | Design tokens in TS, consumed by a theme provider | Legacy had no tokens and three competing style systems; see `docs/LEGACY-AUDIT.md` |
| Tests | Vitest for `packages/core` and `services/ai`; Jest + React Native Testing Library for `apps/mobile` | Vitest cannot run React Native's Metro-transformed modules |
| AI service | Hono on Node | Small, portable, runs on Fly/Render/Cloud Run unchanged |

### Version policy

`expo` is the only pinned Expo package. Every `expo-*` and React Native
dependency is installed with `npx expo install`, which selects the version
matching the installed SDK. Hand-editing those versions in `package.json` is a
defect — `npx expo install --check` must report clean.

## Repository structure

```
apps/mobile/          Expo app. expo-router routes in app/, everything else in src/
packages/core/        Pure TypeScript domain logic. No React, no I/O, no Supabase import.
packages/types/       Types generated from the Supabase schema. Generated, never hand-edited.
services/ai/          Hono HTTP service for LLM tool-calling.
supabase/             config.toml, migrations/, seed.sql, RLS policies.
docs/                 Specs, ADRs, capability map, reuse ledger, legacy audit.
tasks/                plan.md and todo.md for the module currently in flight.
legacy/               Archived web app. Excluded from every build. Never imported.
```

`packages/core` having no I/O is the load-bearing rule. It is what lets the same
function back a UI form, a Postgres RPC and an assistant tool without three
implementations drifting apart. A `fetch` or a Supabase import inside `core` is
a review blocker.

## Commands

Run from the repository root.

```
npm install                      Install all workspaces
npm run dev                      Start Expo (Metro) for the mobile app
npm run dev:api                  Start the AI service on :8787
npm run db:start                 Start the local Supabase stack
npm run db:reset                 Recreate the local database from migrations + seed
npm run db:types                 Regenerate packages/types from the local schema
npm run lint                     ESLint across all workspaces
npm run typecheck                tsc --noEmit across all workspaces
npm run test                     All test suites
npm run test:core                packages/core only (fast; use during TDD)
npm run verify                   lint + typecheck + test. The pre-push gate.
```

## Code style

```ts
// packages/core/src/money/money.ts
import { z } from 'zod';

/** Money is integer minor units. Never a float — see docs/REUSE-LEDGER.md. */
export const MoneySchema = z.object({
  amount: z.number().int(),
  currency: z.string().length(3).toUpperCase(),
});

export type Money = z.infer<typeof MoneySchema>;

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new MismatchedCurrencyError(a.currency, b.currency);
  }
  return { amount: a.amount + b.amount, currency: a.currency };
}
```

Conventions:

- Named exports only. No default exports — they defeat rename refactors and make
  the assistant's tool registry harder to enumerate.
- Files and directories `kebab-case`; types and components `PascalCase`;
  functions and variables `camelCase`.
- Every exported `core` function takes one object argument and returns a value
  or throws a typed error. No booleans-as-return-status.
- Errors are classes extending a `BudgetifyError` base with a stable `code`, so
  the assistant can map failures to spoken responses without string matching.
- No comment restates the code. Comments explain a constraint or a decision.

## Testing strategy

| Layer | Framework | Location | Bar |
|---|---|---|---|
| Domain logic | Vitest | `packages/core/src/**/*.test.ts` beside the source | 90% line coverage, enforced in CI |
| AI service | Vitest | `services/ai/src/**/*.test.ts` | Every route has a test |
| Components | Jest + RNTL | `apps/mobile/src/**/*.test.tsx` | Behaviour, not snapshots |
| Database | pgTAP via `supabase test db` | `supabase/tests/` | Every RLS policy has a test proving a second user is denied |

The RLS bar is non-negotiable. Legacy enforced ownership by convention — a
`filter_by(user_id=...)` a developer had to remember in every service function.
Under RLS the same mistake is a silent cross-tenant data leak, so each policy
gets a test that asserts denial, not just permission.

Ported logic (`docs/REUSE-LEDGER.md`, verdict `PORT`) must have its tests written
against the legacy behaviour **before** the port, except where the ledger records
a deliberate change.

## Boundaries

**Always**

- Run `npm run verify` before pushing.
- Install Expo packages with `npx expo install`, never `npm install`.
- Update the row in `docs/REUSE-LEDGER.md` when a capability is ported or dropped.
- Write RLS policies in a migration, never through the Supabase dashboard.

**Ask first**

- Adding a dependency to `packages/core` — it is meant to stay dependency-light.
- Any schema change after `ledger` ships.
- Changing the module boundaries in `docs/CAPABILITY-MAP.md`.
- Ejecting from the Expo managed workflow.

**Never**

- Import from `legacy/`.
- Commit secrets, keys, certificates or `.env` files. This repo has already
  leaked one private key; see the security note in `README.md`.
- Put the Supabase service-role key in `apps/mobile`. It bypasses RLS, and
  anything shipped in an app binary is public.
- Store money as a float.
- Weaken a test or add a lint suppression to make CI green.

## Success criteria

1. `npm install` from a clean clone succeeds on Node >= 20.19.4.
2. `npm run verify` passes with zero warnings.
3. `npm run db:start && npm run db:reset` produces a running local Postgres with
   migrations applied.
4. `npm run db:types` regenerates `packages/types` and leaves the tree clean.
5. `npm run dev` launches Metro; the app opens on a physical Android device and
   renders a themed screen sourcing every colour and spacing value from tokens.
6. The app reads a value from local Supabase and displays it, proving the client
   is wired end to end.
7. `npm run dev:api` serves `GET /health` returning `{"status":"ok"}`.
8. `packages/core` exports money primitives with >= 90% coverage.
9. CI runs `verify` on every pull request and fails the build on any error.
10. No file in `apps/mobile` or `packages/core` imports from `legacy/`, enforced
    by an ESLint `no-restricted-imports` rule.

## Open questions

1. **Node upgrade required.** The machine has Node v20.3.1 / npm 9.6.7. Expo 57
   requires Node >= 20.19.4. Nothing installs until this is upgraded — Node 22
   LTS recommended.
2. **Supabase project** — does a project already exist, or is one to be created?
   Region should be closest to the primary user base.
3. **Facebook OAuth** requires a Meta app with Business Verification, which takes
   days. Confirm this is started, or `identity` ships Google-only and Facebook
   follows.
4. **LLM provider** for `assistant` is undecided. It does not block V1, but the
   `services/ai` skeleton assumes an OpenAI-compatible chat-completions API with
   tool-calling.
