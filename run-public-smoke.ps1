Set-Location "C:\dev\Budgetify"

if (-not $env:PUBLIC_API_URL) {
  $env:PUBLIC_API_URL = 'https://budgetifyai-qika9xe4.b4a.run'
}

if (-not $env:SMOKE_USER1_TOKEN -or -not $env:SMOKE_USER2_TOKEN) {
  Write-Error "Set SMOKE_USER1_TOKEN and SMOKE_USER2_TOKEN before running this script"
  exit 1
}

node services/ai/public-smoke-t17.mjs
Write-Output "Smoke exit code: $LASTEXITCODE"
exit $LASTEXITCODE
