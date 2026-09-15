# Deploy Budgetify AI API on Render (Docker)

This runbook executes T17 for the hosted AI service using the committed Docker artifact.

## Preconditions

- T16 smoke is already passed.
- Supabase target is `hnlieepsxoqeebkreugt`.
- You have two test-user access tokens for public smoke checks.

## 1. Provision service from blueprint

1. In Render, create a new Blueprint and point it to this repository.
2. Use [render.yaml](../render.yaml).
3. Replace `repo` in the blueprint file with the real GitHub owner/repo before first apply.

## 2. Configure environment variables in Render secret store

Set these variables on the `budgetify-ai` service:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `ALLOWED_ORIGINS` (comma-separated explicit allowlist)
- Optional: `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`

Never set any service-role or secret Supabase key.

## 3. Deploy

- Trigger deploy from `main`.
- Confirm build logs show Docker build success from `services/ai/Dockerfile`.

## 4. Public HTTPS smoke checks

Run from repo root in PowerShell:

```powershell
$env:PUBLIC_API_URL='https://REPLACE_WITH_RENDER_URL'
$env:SMOKE_USER1_TOKEN='REPLACE_ME'
$env:SMOKE_USER2_TOKEN='REPLACE_ME'
node services/ai/public-smoke-t17.mjs
```

Or run the helper:

```powershell
./run-public-smoke.ps1
```

Expected output includes `"ok": true` and all checks `true`.

## 5. Rollback rehearsal

- In Render, open deploy history.
- Verify a previous deploy can be restored.
- Document rollback timestamp and selected deploy id in task evidence.

## 6. Security verification

- Verify no credentials or raw financial payloads are printed in service logs.
- Keep only summary-level status and error telemetry.

## Exit criteria (T17)

- Deployment builds from repository state with no local-machine dependency.
- Hosted `/health` returns 200 over HTTPS.
- Public authenticated smoke and cross-user RLS isolation pass.
- Logs contain no secrets and no sensitive financial payloads.
