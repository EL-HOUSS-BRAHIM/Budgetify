param(
  [Parameter(Mandatory = $true)]
  [string]$ApiUrl,
  [string]$SupabaseUrl = $env:SUPABASE_URL,
  [string]$ServiceRoleKey = $env:SUPABASE_SERVICE_ROLE_KEY,
  [switch]$VerifyHealth,
  [switch]$RunSmoke
)

$ErrorActionPreference = 'Stop'

function Normalize-ApiUrl([string]$Value) {
  try {
    $uri = [Uri]$Value.Trim()
    if ($uri.Scheme -ne 'https') { throw 'The API URL must use HTTPS.' }
    if ($uri.AbsolutePath -ne '/' -and $uri.AbsolutePath -ne '') {
      throw 'The API URL must not include a path.'
    }
    return $uri.GetLeftPart([UriPartial]::Authority).TrimEnd('/')
  } catch {
    throw "Invalid API URL: $Value. Use a plain HTTPS URL such as https://example.b4a.run"
  }
}

if (-not $SupabaseUrl -or -not $ServiceRoleKey) {
  throw 'Provide SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY through the environment.'
}

$normalizedUrl = Normalize-ApiUrl $ApiUrl
$supabaseBase = $SupabaseUrl.TrimEnd('/')
$headers = @{
  apikey = $ServiceRoleKey
  Authorization = "Bearer $ServiceRoleKey"
  'Content-Type' = 'application/json'
  Prefer = 'resolution=merge-duplicates,return=representation'
}
$body = @{ key = 'ai_api_url'; value = $normalizedUrl } | ConvertTo-Json

if ($VerifyHealth -or $RunSmoke) {
  $health = Invoke-RestMethod -Uri "$normalizedUrl/health" -Method Get
  if ($health.status -ne 'ok') {
    throw "API health check failed for $normalizedUrl"
  }
}

$published = Invoke-RestMethod `
  -Uri "$supabaseBase/rest/v1/app_config?on_conflict=key" `
  -Method Post `
  -Headers $headers `
  -Body "[$body]"

if (-not $published) {
  throw 'Supabase did not confirm the app_config update.'
}

Write-Host "Published ai_api_url=$normalizedUrl"

if ($RunSmoke) {
  if (-not $env:SMOKE_USER1_TOKEN -or -not $env:SMOKE_USER2_TOKEN) {
    throw 'RunSmoke requires SMOKE_USER1_TOKEN and SMOKE_USER2_TOKEN in the current session.'
  }
  $env:PUBLIC_API_URL = $normalizedUrl
  npm run smoke:public
}
