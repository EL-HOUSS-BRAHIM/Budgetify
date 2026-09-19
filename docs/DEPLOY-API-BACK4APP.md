# Deploy Budgetify AI API on Back4App Containers (Docker)

This runbook executes T17 for the hosted AI service. GitHub Actions builds the Docker image from `services/ai/Dockerfile` and pushes it to Docker Hub on every push to `main`; Back4App Containers then deploys that published image.

## Preconditions

- T16 smoke is already passed.
- Supabase target is `hnlieepsxoqeebkreugt`.
- You have two test-user access tokens for public smoke checks.
- A Docker Hub repository exists (e.g. `<dockerhub-username>/budgetify-ai`).
- The GitHub repo has these Actions secrets set (Settings → Secrets and variables → Actions):
	- `DOCKERHUB_USERNAME`
	- `DOCKERHUB_TOKEN` (a Docker Hub access token, not your account password)

## 1. Build and publish the image via GitHub Actions

The [.github/workflows/docker-ai.yml](../.github/workflows/docker-ai.yml) workflow:

- Triggers on pushes to `main` that touch `services/ai/**` or the workflow file, plus manual `workflow_dispatch`.
- Builds `services/ai/Dockerfile` with the repo root as build context.
- Pushes to Docker Hub as `<DOCKERHUB_USERNAME>/budgetify-ai:latest` and `:<short-sha>`.

Push to `main` (or run the workflow manually) and confirm the run succeeds and the tags appear on Docker Hub.

## 2. Provision the container app

1. In the Back4App dashboard, choose **Containers as a Service** and click **New App**.
2. Choose the option to deploy **from an existing Docker image** rather than connecting a GitHub repo.
3. Set the image to `docker.io/<DOCKERHUB_USERNAME>/budgetify-ai:latest` (or pin to a specific `:<short-sha>` tag for reproducible deploys).
4. If the Docker Hub repository is private, provide registry credentials (`DOCKERHUB_USERNAME` + a Docker Hub access token) when prompted.
5. Configure:
	- Exposed Port: 8787 (matches `EXPOSE 8787` in the Dockerfile and the service default)
6. Save and trigger the first deploy.

## 3. Configure environment variables

Set these in the app's Environment Variables section:

- `PORT` = `8787`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `ALLOWED_ORIGINS` (comma-separated explicit allowlist. If the client is a native/mobile app (no browser `Origin` header) rather than a web frontend, this can typically be left empty or set to a placeholder value, since CORS origin checks only apply to browser-based requests. If you also have a web frontend or use webviews that send an `Origin` header, list those exact origins here, e.g. `https://app.budgetify.example.com,https://budgetify.example.com` — no wildcards, no trailing slashes)
- Optional: `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`

Never set any service-role or secret Supabase key.

## 4. Deploy

- Trigger the deploy from the Back4App dashboard (pulls the configured image tag from Docker Hub).
- To ship a new version: push to `main` so GitHub Actions rebuilds and pushes `:latest` (and `:<short-sha>`), then redeploy the app in Back4App so it pulls the new image — Back4App does not automatically detect new Docker Hub pushes on its own.
- Confirm the deploy logs show the image was pulled successfully and the container started.
- Back4App assigns a public HTTPS URL to the app (visible on the app's dashboard page) — use it below as `PUBLIC_API_URL`.

## 5. Public HTTPS smoke checks

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

## 6. Rollback rehearsal

- In Back4App, open the app's deployment history.
- Verify a previous successful deployment can be restored/redeployed.
- Document rollback timestamp and selected deployment id in task evidence.

## 7. Security verification

- Verify no credentials or raw financial payloads are printed in service logs.
- Keep only summary-level status and error telemetry.

## Exit criteria (T17)

- Deployment builds from repository state with no local-machine dependency.
- Hosted `/health` returns 200 over HTTPS.
- Public authenticated smoke and cross-user RLS isolation pass.
- Logs contain no secrets and no sensitive financial payloads.
