# ADR 0001: Rebuild Budgetify as an Expo + Supabase monorepo

- **Status:** Accepted
- **Date:** 2026-09-08
- **Supersedes:** the Flask + React web application, archived at tag `v1.0-legacy-web`

## Context

Budgetify exists as a Flask 3 REST API over MySQL with a Create React App
frontend, deployed to two DigitalOcean droplets and a managed MySQL cluster. An
audit of that codebase (see `docs/LEGACY-AUDIT.md`) found:

- Working, tested-by-use domain logic for budget periods, category aggregation
  and monthly report generation.
- An auth stack (JWT with a 1-minute expiry, bcrypt, in-memory OTP storage) that
  is not production-viable and has no OAuth despite the UI implying it.
- Avatar storage bound to a hardcoded Google Drive folder id.
- A Goals feature with a complete backend and no UI at all.
- Stubbed password change, data export, account deletion and notifications.
- No test suite, no CI, no design tokens, no state management.

The product direction has changed: the target is an Android-first mobile app
(iOS later) with a voice-driven assistant, a spreadsheet-style editing surface,
and planned-item check-off. That is not a port of a web app; the interaction
model is different at the root.

## Decision

Rebuild as a TypeScript monorepo:

```
apps/mobile        Expo (React Native), Android first, iOS-ready
services/ai        AI orchestration HTTP service (tool-calling, transcript handling)
packages/core      Pure domain logic — money math, budget periods, validation schemas
packages/types     Types generated from the Supabase schema
supabase/          Migrations, RLS policies, seed data
docs/              Specs, ADRs, capability map, reuse ledger
legacy/            The archived web app, excluded from all builds
```

Specific choices:

1. **Supabase is the primary backend.** Postgres with row-level security, Auth,
   Storage and Realtime. This removes the entire hand-written auth, session,
   file-storage and email stack.
2. **A separate small AI service** (`services/ai`) handles LLM orchestration and
   tool-calling. It is stateless, authenticates callers with their Supabase JWT,
   and performs every write through Supabase using that same JWT so RLS applies
   identically to human and assistant actions.
3. **Voice is on-device STT → LLM tool-calling → TTS**, not a realtime
   speech-to-speech API. Transcription happens on the handset, so audio never
   leaves the device and only text reaches the model.
4. **Domain logic lives in `packages/core`**, not in the app and not in the
   service. Both consume it.
5. **The legacy app is archived, not deleted**, at tag `v1.0-legacy-web` and in
   `legacy/`, so its behaviour remains readable as a specification source.

## Consequences

**Positive**

- Hosting collapses to one Supabase project plus one small container. No
  droplets, no Nginx, no certificate management for the database.
- OAuth with Google and Facebook is configuration, not code.
- RLS makes authorisation a property of the data rather than something every
  route handler must remember to check — which the legacy code did by hand in
  every service function.
- Assistant tool definitions derive from the same schemas the UI validates
  against, so the two cannot disagree about what a valid write is.

**Negative**

- Postgres-flavoured SQL and RLS is a new competency; the legacy team knowledge
  is MySQL + SQLAlchemy.
- Two deploy targets instead of one, and the AI service needs a secret-bearing
  environment.
- The legacy Python business logic must be re-expressed in TypeScript. It is not
  copy-pasteable. The reuse ledger tracks each function's fate explicitly.

**Neutral**

- Expo's managed workflow constrains native module choice. Every capability in
  the V1 scope is covered by an Expo-supported module.

## Alternatives considered

- **Keep Flask, add a React Native client.** Rejected: retains the auth, storage
  and email code the audit found weakest, and adds a server to host rather than
  removing one.
- **Supabase Edge Functions for AI orchestration.** Rejected for now: Deno
  runtime and the 150s wall-clock ceiling are workable, but streaming
  tool-calling loops are markedly easier to develop and debug in a normal Node
  process, and the service needs no cold-start-sensitive path.
- **React Native CLI instead of Expo.** Rejected: the user requires easy hosting
  and fast Android iteration; Expo's build and OTA-update pipeline delivers that
  with no native toolchain on the developer machine.
