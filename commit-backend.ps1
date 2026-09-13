Set-Location "C:\dev\Budgetify"
$msg = @"
feat(backend): ship complete Supabase schema, RPCs, and AI voice chatbot service

- supabase/migrations: accounts, categories, budgets, transactions, plan_items, goals
- RPC get_monthly_summary: aggregates monthly financial health, budget usage & checklist
- RPC toggle_plan_item: atomic plan check-off and transaction materialization
- services/ai: AI voice & chatbot endpoint (POST /api/chat) with tool-calling
- apps/mobile: dynamic Supabase data fetching and live state integration
"@
git add -A
git commit -q -m $msg
Write-Output "commit: $LASTEXITCODE"
git log --oneline -3
