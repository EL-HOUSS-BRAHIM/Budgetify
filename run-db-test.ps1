Set-Location "C:\dev\Budgetify"
& "C:\Program Files\nodejs\npx.cmd" supabase test db --linked --debug supabase/tests 2>&1 | Tee-Object -FilePath db-test-debug.log
Write-Output "EXIT CODE: $LASTEXITCODE"
