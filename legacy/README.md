# Legacy — Budgetify web application (archived)

This folder holds the original Budgetify web app: a Flask 3 REST API over MySQL
(`legacy/backend`) and a Create React App frontend (`legacy/frontend`). It was
built during the ALX programme and deployed at `api.brahim-crafts.tech`.

**It is archived, not maintained.** Nothing here is built, tested, linted or
deployed. It is kept in the tree for one reason: it is the most accurate
specification of what Budgetify did, and the rebuild reads from it.

- Final working state is tagged `v1.0-legacy-web`.
- What was found in it: `docs/LEGACY-AUDIT.md`
- What is being reused, rewritten or dropped, artefact by artefact:
  `docs/REUSE-LEDGER.md`
- Why it is being replaced: `docs/adr/0001-rebuild-as-expo-supabase-monorepo.md`

## Do not

- Import from `legacy/` in any new code. The reuse ledger records the intended
  fate of every piece; if something here is worth keeping, it gets re-expressed
  in `packages/core` with tests, and the ledger row is updated to say so.
- Deploy it. The API host it targeted is being decommissioned.

## Running it, if you must

See `legacy/backend/README.md` and `legacy/frontend/README.md`. Both need
credentials that are no longer provisioned.
