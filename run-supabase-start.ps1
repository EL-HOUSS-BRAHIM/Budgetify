Set-Location "C:\dev\Budgetify"
$npx = Join-Path $env:ProgramFiles 'nodejs\npx.cmd'
Write-Output "Starting Supabase local stack..."
& $npx supabase start
Write-Output "Supabase start exit code: $LASTEXITCODE"
