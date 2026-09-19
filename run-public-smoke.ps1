Set-Location "C:\dev\Budgetify"

if (-not $env:PUBLIC_API_URL) {
  Write-Error "Set PUBLIC_API_URL, e.g. https://budgetify-ai.back4app.io"
  exit 1
}

if (-not $env:SMOKE_USER1_TOKEN -or -not $env:SMOKE_USER2_TOKEN) {
  Write-Error "Set SMOKE_USER1_TOKEN and SMOKE_USER2_TOKEN before running this script"
  exit 1
}

node services/ai/public-smoke-t17.mjs
Write-Output "Smoke exit code: $LASTEXITCODE"
exit $LASTEXITCODE
