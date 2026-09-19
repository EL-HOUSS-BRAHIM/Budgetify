# Deploy Budgetify AI API on Back4App Containers (Docker)

This runbook executes T17 for the hosted AI service using the committed Docker artifact, deployed via Back4App Containers.

## Preconditions

- T16 smoke is already passed.
- Supabase target is `hnlieepsxoqeebkreugt`.
- You have two test-user access tokens for public smoke checks.
- Repository is pushed to GitHub (Back4App Containers deploys from a connected GitHub repo).

## 1. Provision the container app

1. In the Back4App dashboard, choose **Containers as a Service** and click **New App**.
2. Connect your GitHub account and select this repository.
3. Configure the build:
	- Branch: main
	- Dockerfile Path: services/ai/Dockerfile
	- Docker Build Context: . (repo root — the Dockerfile copies root `package.json`/`package-lock.json` plus `services/ai`)
	- Exposed Port: 8787 (matches `EXPOSE 8787` in the Dockerfile and the service default)
4. Save and trigger the first deploy.

## 2. Configure environment variables

Set these in the app's Environment Variables section:

- `PORT` = `8787`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `ALLOWED_ORIGINS` (comma-separated explicit allowlist)
- Optional: `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`

Never set any service-role or secret Supabase key.

## 3. Deploy

- Trigger a deploy from `main` (Back4App also auto-deploys on new commits to the tracked branch).
- Confirm build logs show a successful Docker build from `services/ai/Dockerfile`.
- Back4App assigns a public HTTPS URL to the app (visible on the app's dashboard page) — use it below as `PUBLIC_API_URL`.

## 4. Public HTTPS smoke checks

Run from repo root in PowerShell:

```powershell
$env:PUBLIC_API_URL='https://REPLACE_WITH_BACK4APP_URL'
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

- In Back4App, open the app's deployment history.
- Verify a previous successful deployment can be restored/redeployed.
- Document rollback timestamp and selected deployment id in task evidence.

## 6. Security verification

- Verify no credentials or raw financial payloads are printed in service logs.
- Keep only summary-level status and error telemetry.

## Exit criteria (T17)

- Deployment builds from repository state with no local-machine dependency.
- Hosted `/health` returns 200 over HTTPS.
- Public authenticated smoke and cross-user RLS isolation pass.
- Logs contain no secrets and no sensitive financial payloads.
