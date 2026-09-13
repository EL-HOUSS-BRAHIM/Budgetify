# Plan: platform-foundation

Spec: `docs/SPEC-platform-foundation.md` · Capability map: `docs/CAPABILITY-MAP.md`

## Dependency graph

```
Node 20.19.4+ toolchain
    │
    └── npm workspace root (tsconfig.base, lint, format, scripts)
            │
            ├── packages/core ──────────────┐
            │       (money primitives)      │
            │                               │
            ├── supabase/ local stack       │
            │       │                       │
            │       └── packages/types      │
            │               │               │
            │               └── apps/mobile ┘
            │                       (theme → router shell → supabase client)
            │
            ├── services/ai (health endpoint only)
            │
            └── CI (runs verify over everything above)
```

Bottom-up: nothing can be verified until the workspace root exists, and
`apps/mobile` cannot be typed until both `core` and `types` exist.

## Vertical slices

The temptation here is horizontal — all config, then all packages, then the app.
That produces a repo that is never runnable until the last task. Instead each
task after T2 leaves the tree in a state where `npm run verify` passes.

The one honest exception is T1–T2, which are pure scaffolding and cannot be
verified independently. They are treated as a single checkpoint.

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| **Node 20.3.1 is below Expo 57's floor** | Blocks everything; nothing installs | T0 gates all other work. Node 22 LTS. |
| Docker unavailable for local Supabase | Blocks T5–T7 | Fall back to a hosted Supabase branch; `db:start` becomes a no-op documented in the README |
| Metro fails to resolve workspace packages | `apps/mobile` cannot import `core` | npm workspaces hoists rather than symlinks, avoiding pnpm's known Metro issue. Verified by T8 importing `core`. |
| `packages/types` drift from the live schema | Type-safe code that lies at runtime | `db:types` runs in CI; a dirty tree afterwards fails the build |
| Expo package versions hand-edited | Runtime crashes that type-check fine | `npx expo install --check` in `verify` |
| Design tokens skipped under delivery pressure | The legacy three-style-system mess returns | T8's acceptance criterion forbids literal colour and spacing values |

Highest-risk items are earliest: the Node floor is T0, and Metro workspace
resolution is proven at T8 rather than discovered during `ledger`.

## Sequence

```
T0  Node toolchain            ← gate, blocks all
T1  Workspace root
T2  Shared TS + lint config
    ── Checkpoint A ──
T3  packages/core + money primitives (first PORT, with tests)
T4  Root verify script + CI
    ── Checkpoint B ──
T5  Supabase local stack + config
T6  Baseline migration + RLS test harness
T7  packages/types generation
    ── Checkpoint C ──
T8  Expo app shell: tokens, theme, router
T9  Supabase client wired into the app, reading real data
T10 services/ai health endpoint
    ── Checkpoint D: module done ──
```

T5 and T10 are independent of T3–T4 and can run in parallel if a second session
is available. Everything else is strictly ordered.

## Deliberate exclusions

- **No auth in this module.** A login screen without `identity` is a stub, and
  stubs were what made the legacy Settings page a lie.
- **No CD.** CI verifies; deployment configuration lands with `identity`, the
  first module with anything worth deploying.
- **No iOS build.** Config only.

---

## Hosted backend restart — 2026-09-13

### Goal

Run Budgetify against the hosted Supabase project immediately, without starting
the local Supabase stack or downloading Docker images. The first usable
checkpoint is the Hono API running locally against the hosted database; public
API deployment follows only after an authenticated write and RLS isolation are
proven end to end.

### Architecture decisions

- The only allowed project target is `hnlieepsxoqeebkreugt` at
    `https://hnlieepsxoqeebkreugt.supabase.co`. Every remote command must name or
    display that ref before a write. The currently configured shared MCP targets a
    different project and must not be used.
- Existing SQL migrations remain the schema source of truth. Use the repository's
    already-installed Supabase CLI (`2.117.0`) for `link`, `db push --dry-run`,
    `db push`, remote linting, and type generation. Do not run `supabase start`,
    `db reset`, `db pull`, or any Docker-dependent command.
- The API uses a Supabase **publishable** key plus each caller's user access token.
    This preserves Row Level Security. It must not hold a secret or service-role key.
- No credential is pasted into chat, committed, printed to logs, or passed as a
    command-line argument. Dashboard/browser login, native credential storage, and
    ignored `.env` files are the allowed paths.
- The current deterministic command parser is enough for the first live smoke
    test. LLM provider setup is not on the startup critical path.

### Verified starting state

- `services/ai` route tests pass: 4/4.
- `services/ai` type-checking fails with three errors in `app.ts` and
    `executor.ts`.
- The production start command fails with `ERR_MODULE_NOT_FOUND` for `src/app`.
- `@supabase/supabase-js` and `zod` are imported at runtime but are not declared
    by `services/ai/package.json`.
- `SUPABASE_ANON_KEY` is documented but ignored; the executor currently uses the
    literal `anon-key-placeholder`.
- The two migration files exist locally but have not been verified or applied on
    the hosted Budgetify project.

### Dependency graph

```text
T11 verify project + rotate credentials
 ├── T14 inspect/dry-run/push hosted migrations ── T15 generate hosted types ──┐
 └── T13 wire hosted auth configuration ───────────────────────────────────────┤
T12 make the service compile and boot ─────────────────────────────────────────┤
                                                                                                                                                             └── T16 authenticated local API smoke
                                                                                                                                                                             └── T17 public API deployment
```

### Execution order

1. **T11 — Establish the safe hosted target.** Rotate the database password that
     was previously shared, authenticate the installed CLI through the browser,
     verify the exact project ref, retrieve a publishable key, and store local
     values only in ignored environment files.
2. **T12 — Restore a shippable server baseline.** Declare runtime dependencies,
     fix the three TypeScript errors, and replace the broken source-level production
     start path with a build/start path that boots under the supported Node version.
3. **T13 — Correct the Supabase auth boundary.** Validate required environment
     variables at boot, pass the publishable key into `createClient`, forward the
     caller token using the supported access-token mechanism, validate request
     bodies, and restrict CORS before exposure.
4. **T14 — Push schema to hosted Supabase.** Inspect remote migration history and
     public tables, run a dry run, then apply only the two committed migrations.
     Never run a linked reset. Run remote database linting after the push.
5. **T15 — Regenerate types from the hosted schema.** Generate
     `packages/types/src/database.ts` from the project ref, then run workspace type
     checks and tests so code and live schema agree.
6. **T16 — Start and prove the backend locally.** Start Hono on port 8787 with
     hosted environment values, verify health and unauthenticated rejection, then
     use a dedicated test user token to create/read data through `/api/chat`.
     Confirm a second user cannot read the first user's rows.
7. **T17 — Deploy the API publicly.** After T16 passes, choose the Node/Docker host,
     configure secrets in that host, deploy, and repeat the health, auth, write, and
     RLS smoke tests against HTTPS. The existing Dockerfile is not considered ready
     until its production-start test passes.

### Checkpoints

- **Target gate:** CLI output shows `hnlieepsxoqeebkreugt`; rotated credentials are
    stored outside git; no remote write has happened yet.
- **Schema/runtime gate:** migration history lists both migrations, remote linting
    passes, generated types are current, and `npm run start --workspace services/ai`
    serves `/health` successfully.
- **Usable backend gate:** an authenticated command creates a row owned by the
    caller, another user is denied by RLS, and no elevated Supabase key exists in
    the service.
- **Public launch gate:** HTTPS health check and authenticated smoke test pass on
    the selected host; logs contain no tokens or financial payloads.

### Rollback and stop conditions

- Stop immediately if any command shows a project ref other than
    `hnlieepsxoqeebkreugt`, if remote migration history is unexpected, or if the
    dry run includes destructive SQL.
- Do not use `supabase db reset --linked`. Correct schema failures with a new
    forward migration. If the project contains important existing data, take a
    platform backup or use a Supabase branch before the first push.
- Do not deploy the API if it needs a secret/service-role key to make tests pass;
    that would bypass the RLS design rather than fix it.

### Official references

- Supabase CLI link: https://supabase.com/docs/reference/cli/supabase-link
- Supabase database push: https://supabase.com/docs/reference/cli/supabase-db-push
- Supabase type generation: https://supabase.com/docs/guides/api/rest/generating-types
- Supabase API keys: https://supabase.com/docs/guides/api/api-keys
- Supabase JWTs: https://supabase.com/docs/guides/auth/jwts

---

## Financial OS core — 2026-09-13

### Goal

Turn the proven Expo/Supabase foundation into the first trustworthy Financial OS
experience: `Home`, `Money`, `Plan`, `Goals`, and `AI`, centered on an explainable
Safe-to-Spend value rather than a renamed balance.

### Architecture decisions

- The five-tab shell is fixed. Detailed capabilities are secondary routes within
    those jobs, not additional permanent tabs.
- Safe-to-Spend is pure domain math over explicit inputs. It returns an amount,
    horizon, confidence, included sources, and missing inputs. The UI cannot
    substitute budget remaining or fixture data.
- Actual, scheduled, and predicted timeline events are distinct data states.
- UI and AI call the same validated domain operations. AI output is untrusted
    until parsed, authorized, and reviewed.
- AI authority progresses through Inform, Suggest, Prepare, and Execute. External
    money movement remains out of the Core release.
- Money is always integer minor units with its original currency. Mixed currencies
    are never summed without an explicit conversion quote and timestamp.

### Dependency graph

```text
T18 product contract + five-tab shell
    └─ T19 authentication + session gate
             └─ T20 Safe-to-Spend domain contract
                        └─ T21 financial baseline persistence
                                 └─ T22 Home command center
                                            ├─ T23 Money hub
                                            ├─ T24 Plan hub
                                            ├─ T25 Goals write flow
                                            └─ T26 AI action review
                                                     └─ Core release checkpoint

After Core: forecasting → AI Inbox → voice → automation → connected ingestion
```

### Delivery strategy

Each task is a vertical slice with honest loading, empty, error, and success
states. Domain math is test-first in `packages/core`; schema changes are forward
migrations with pgTAP RLS coverage; mobile work is typechecked, linted, and
verified on the Android emulator before the next screen begins.

### Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Safe-to-Spend appears authoritative with incomplete inputs | Harmful financial decisions | Return readiness/confidence and missing inputs from the domain contract; render “not ready” when required data is absent |
| AI writes a plausible but wrong action | User data corruption or money loss | Parse structured proposals, authorize server-side, require review, audit writes, and keep external transfers disabled |
| Predicted events look like posted transactions | User cannot trust the timeline | Persist event kind and provenance; use explicit text labels in addition to styling |
| Bank or document ingestion expands the attack surface | Sensitive-data exposure | Keep it outside Core; require a separate threat model, consent scope, provider review, and retention policy |
| Broad screen rebuild hides regressions | Unverifiable UI | Ship one screen at a time and run focused checks plus emulator screenshots at each checkpoint |

### Core release checkpoint

- A fresh user can authenticate and establish currency, accounts, income cadence,
    commitments, and a safety buffer.
- Home either shows a sourced Safe-to-Spend value with horizon/confidence or says
    exactly why it is not ready.
- Money, Plan, and Goals read and write hosted user-scoped data without fixtures.
- AI can explain state and prepare reviewed app writes; it cannot silently commit
    ambiguous actions or initiate external money movement.
- Light/dark, 360 dp width, large text, offline/stale, and Android emulator checks
    pass for every primary tab.
