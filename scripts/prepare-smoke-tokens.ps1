param(
  [string]$SupabaseUrl = $env:SUPABASE_URL,
  [string]$PublishableKey = $env:SUPABASE_PUBLISHABLE_KEY,
  [string]$ServiceRoleKey = $env:SUPABASE_SERVICE_ROLE_KEY,
  [string]$PublicApiUrl = $(if ($env:PUBLIC_API_URL) { $env:PUBLIC_API_URL } else { 'https://budgetifyai-qika9xe4.b4a.run' }),
  [switch]$RunSmoke
)

$ErrorActionPreference = 'Stop'

if (-not $SupabaseUrl -or -not $PublishableKey -or -not $ServiceRoleKey) {
  throw 'Provide SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, and SUPABASE_SERVICE_ROLE_KEY.'
}

$SupabaseUrl = $SupabaseUrl.TrimEnd('/')
$suffix = (Get-Date -Format 'yyyyMMddHHmmss')
$password = "Smoke-$suffix-$(Get-Random -Minimum 1000 -Maximum 9999)!"
$adminHeaders = @{ apikey = $ServiceRoleKey; Authorization = "Bearer $ServiceRoleKey"; 'Content-Type' = 'application/json' }
$authHeaders = @{ apikey = $PublishableKey; 'Content-Type' = 'application/json' }

function New-OrGetSmokeUser([string]$Email) {
  $body = @{ email = $Email; password = $password; email_confirm = $true } | ConvertTo-Json
  try {
    $user = Invoke-RestMethod -Method Post -Uri "$SupabaseUrl/auth/v1/admin/users" -Headers $adminHeaders -Body $body
  } catch {
    # If the user already exists, sign-in below still works.
    if ($_.Exception.Response.StatusCode.value__ -ne 422) { throw }
  }
  $login = @{ email = $Email; password = $password } | ConvertTo-Json
  return (Invoke-RestMethod -Method Post -Uri "$SupabaseUrl/auth/v1/token?grant_type=password" -Headers $authHeaders -Body $login).access_token
}

$runId = [guid]::NewGuid().ToString('N').Substring(0, 10)
$token1 = New-OrGetSmokeUser "budgetify-smoke-1-$runId@example.com"
$token2 = New-OrGetSmokeUser "budgetify-smoke-2-$runId@example.com"

$env:SMOKE_USER1_TOKEN = $token1
$env:SMOKE_USER2_TOKEN = $token2
$env:PUBLIC_API_URL = $PublicApiUrl

Write-Host 'Smoke tokens are ready in this PowerShell session.'
Write-Host "PUBLIC_API_URL=$PublicApiUrl"

if ($RunSmoke) { npm run smoke:public }
