# Budgetify

Voice-assisted personal budgeting for Android. Talk to it, and it records the
spend, ticks off the bill, or tells you what is left in a category.

Budgetify began as an ALX project — a Flask and React web app, now archived in
[`legacy/`](legacy/README.md) at tag `v1.0-legacy-web`. This is the rebuild: an
Expo mobile app on Supabase, with an assistant that can actually change your
budget rather than just talk about it.

---

## ⚠️ Outstanding security issue

An unencrypted private key (`backend/conf/certs/certificates.key`) was committed
to this **public** repository and is present in git history from commit
`e21b27c` onward. It has been removed from the working tree, but removal does
not undo the exposure.

Still required:

1. Revoke the key and rotate the credentials for the DigitalOcean MySQL cluster
   it authenticated against.
2. Purge it from history with `git filter-repo` and force-push.
3. Rotate any other secret that lived in that environment.

Until step 1 is done, treat those credentials as compromised.

---

## Status

`platform-foundation` is in progress. Nothing is user-facing yet.

| Module | Release | State |
|---|---|---|
| `platform-foundation` | V1 | in progress — core, AI service and database scaffolded; mobile app blocked on the Node upgrade |
| `identity` | V1 | not started |
| `consent-onboarding` | V1 | not started |
| `ledger` | V1 | not started |
| `budgeting` | V1 | not started |
| `notifications` | V1 | not started |
| `planning`, `sheet-view`, `assistant` | V2 | not started |
| `insights`, `goals`, `data-io`, `offline-sync` | V3 | not started |

Full breakdown: [`docs/CAPABILITY-MAP.md`](docs/CAPABILITY-MAP.md).

## Getting started

**Requires Node >= 20.19.4** (see `.nvmrc`; Node 22 LTS recommended). Expo 57
will not install below this.

```bash
npm install
npm run db:start      # local Supabase — needs Docker
npm run db:reset      # apply migrations and seed
npm run db:types      # regenerate packages/types from the schema
npm run dev           # Expo dev server
npm run dev:api       # AI service on :8787
```

No Docker? Point `SUPABASE_URL` at a hosted Supabase branch and skip
`db:start` / `db:reset`.

### Verifying

```bash
npm run verify        # format + lint + typecheck + test + expo version check
npm run test:core     # fast domain-logic loop for TDD
npm run coverage      # enforces the 90% threshold on packages/core
npm run db:test       # pgTAP tests, including RLS denial tests
```

`verify` is the pre-push gate and is what CI runs.

## Layout

```
apps/mobile/      Expo app. Routes in app/, everything else in src/
packages/core/    Pure domain logic. No React, no I/O, no Supabase.
packages/types/   Generated from the Supabase schema. Never hand-edited.
services/ai/      Hono service for the assistant's tool-calling.
supabase/         Migrations, RLS policies, pgTAP tests, seed data.
docs/             Specs, ADRs, capability map, reuse ledger, legacy audit.
tasks/            Plan and task list for the module in flight.
legacy/           Archived web app. Never built, never imported.
```

## Rules that are enforced, not just documented

- **Money is integer minor units.** The legacy app used SQL `FLOAT` and the
  error compounds across a month. `packages/core` rejects a non-integer amount.
- **`packages/core` has no I/O.** Lint blocks importing `@supabase/supabase-js`,
  `react`, `react-native` or Node I/O modules there. It is what lets one
  function back a UI form, an RPC and an assistant tool without drifting.
- **`legacy/` is never imported.** Lint blocks it and points at the reuse ledger.
- **Every RLS policy has a denial test.** Ownership was a convention in the
  legacy code; under RLS a forgotten check is a cross-tenant leak.
- **The service-role key never enters the app.** It bypasses RLS, and anything
  in an app binary is public.

## Documentation

Every decision is written down before it is built, and no feature is
reimplemented without first checking whether it already exists.

| Document | Purpose |
|---|---|
| [`docs/CAPABILITY-MAP.md`](docs/CAPABILITY-MAP.md) | Module boundaries, dependencies, build order |
| [`docs/REUSE-LEDGER.md`](docs/REUSE-LEDGER.md) | One verdict per legacy artefact: port, rewrite or drop |
| [`docs/LEGACY-AUDIT.md`](docs/LEGACY-AUDIT.md) | What the old app actually did |
| [`docs/SPEC-platform-foundation.md`](docs/SPEC-platform-foundation.md) | Spec for the module in flight |
| [`docs/adr/`](docs/adr/) | Architecture decision records |
| [`tasks/plan.md`](tasks/plan.md), [`tasks/todo.md`](tasks/todo.md) | Current plan and task list |

Before writing a function, search the reuse ledger for the capability. If it has
a row, the verdict is already decided. If it has no row, it is new — add one.

## Licence

MIT
