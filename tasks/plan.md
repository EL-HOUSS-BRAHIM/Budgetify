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
