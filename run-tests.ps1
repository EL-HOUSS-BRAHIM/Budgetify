Set-Location "C:\dev\Budgetify"
$npm = Join-Path $env:ProgramFiles 'nodejs\npm.cmd'
& $npm run test --workspaces --if-present
Write-Output "Test exit code: $LASTEXITCODE"
