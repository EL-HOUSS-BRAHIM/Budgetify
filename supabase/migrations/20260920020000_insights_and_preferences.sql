alter table public.profiles
  add column if not exists ai_personality text not null default 'coach'
    check (ai_personality in ('coach', 'analyst', 'guardian', 'minimalist')),
  add column if not exists ai_context_scope text not null default 'full'
    check (ai_context_scope in ('full', 'limited', 'none')),
  add column if not exists auto_categorize_enabled boolean not null default true,
  add column if not exists intelligent_alerts_enabled boolean not null default true;

create or replace function public.get_financial_health(target_date date default current_date)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_currency text;
  v_month_start timestamptz := date_trunc('month', target_date::timestamptz);
  v_month_end timestamptz := date_trunc('month', target_date::timestamptz) + interval '1 month';
  v_available bigint := 0;
  v_income bigint := 0;
  v_expense bigint := 0;
  v_upcoming bigint := 0;
  v_goal_current bigint := 0;
  v_goal_target bigint := 0;
  v_liquidity_score int;
  v_goal_score int;
  v_spending_score int;
  v_score int;
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  select coalesce(
    (select currency from public.profiles where id = v_user_id),
    (select currency from public.accounts where user_id = v_user_id order by is_default desc, created_at asc limit 1),
    'USD'
  ) into v_currency;

  select coalesce(sum(current_balance), 0)
  into v_available
  from public.accounts
  where user_id = v_user_id
    and currency = v_currency;

  select
    coalesce(sum(case when type = 'income' then amount else 0 end), 0),
    coalesce(sum(case when type = 'expense' then amount else 0 end), 0)
  into v_income, v_expense
  from public.transactions
  where user_id = v_user_id
    and currency = v_currency
    and date >= v_month_start
    and date < v_month_end;

  select coalesce(sum(expected_amount), 0)
  into v_upcoming
  from public.plan_items
  where user_id = v_user_id
    and currency = v_currency
    and is_done = false
    and (due_date is null or (due_date >= target_date and due_date < v_month_end::date));

  select coalesce(sum(current_amount), 0), coalesce(sum(target_amount), 0)
  into v_goal_current, v_goal_target
  from public.goals
  where user_id = v_user_id
    and currency = v_currency;

  v_liquidity_score := case
    when v_upcoming = 0 and v_available > 0 then 85
    when v_upcoming = 0 then 45
    else least(100, round((v_available::numeric / v_upcoming::numeric) * 100))::int
  end;
  v_goal_score := case
    when v_goal_target = 0 then 50
    else least(100, round((v_goal_current::numeric / v_goal_target::numeric) * 100))::int
  end;
  v_spending_score := case
    when v_income = 0 and v_expense = 0 then 50
    when v_income = 0 then 20
    else greatest(0, least(100, 100 - round((v_expense::numeric / v_income::numeric) * 100)::int))
  end;
  v_score := round((v_liquidity_score + v_goal_score + v_spending_score)::numeric / 3)::int;

  return json_build_object(
    'currency', v_currency,
    'score', v_score,
    'label', case
      when v_score >= 80 then 'Resilient'
      when v_score >= 60 then 'Stable'
      when v_score >= 40 then 'Needs attention'
      else 'At risk'
    end,
    'liquidity_score', v_liquidity_score,
    'goal_score', v_goal_score,
    'spending_score', v_spending_score,
    'available', v_available,
    'monthly_income', v_income,
    'monthly_expense', v_expense,
    'upcoming_commitments', v_upcoming,
    'goal_saved', v_goal_current,
    'goal_target', v_goal_target,
    'next_move', case
      when v_upcoming > v_available then 'Reduce flexible spending or add income before upcoming commitments clear.'
      when v_goal_target > 0 and v_goal_score < 50 then 'Increase goal contributions after commitments are covered.'
      when v_income > 0 and v_expense > (v_income * 0.8) then 'Review recurring and flexible spending before the next cycle.'
      else 'Maintain current commitments and keep reviewing new transactions.'
    end
  );
end;
$$;

revoke all on function public.get_financial_health(date) from public;
grant execute on function public.get_financial_health(date) to authenticated;

create or replace function public.get_month_end_report(target_date date default current_date)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_currency text;
  v_month_start timestamptz := date_trunc('month', target_date::timestamptz);
  v_month_end timestamptz := date_trunc('month', target_date::timestamptz) + interval '1 month';
  v_income bigint := 0;
  v_expense bigint := 0;
  v_commitments bigint := 0;
  v_goal_saved bigint := 0;
  v_score int;
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  select coalesce(
    (select currency from public.profiles where id = v_user_id),
    (select currency from public.accounts where user_id = v_user_id order by is_default desc, created_at asc limit 1),
    'USD'
  ) into v_currency;

  select
    coalesce(sum(case when type = 'income' then amount else 0 end), 0),
    coalesce(sum(case when type = 'expense' then amount else 0 end), 0)
  into v_income, v_expense
  from public.transactions
  where user_id = v_user_id
    and currency = v_currency
    and date >= v_month_start
    and date < v_month_end;

  select coalesce(sum(expected_amount), 0)
  into v_commitments
  from public.plan_items
  where user_id = v_user_id
    and currency = v_currency
    and (due_date is null or (due_date >= v_month_start::date and due_date < v_month_end::date));

  select coalesce(sum(current_amount), 0)
  into v_goal_saved
  from public.goals
  where user_id = v_user_id
    and currency = v_currency;

  v_score := case
    when v_income = 0 and v_expense = 0 then 0
    when v_income = 0 then 25
    else greatest(0, least(100, 100 - round((v_expense::numeric / v_income::numeric) * 100)::int))
  end;

  return json_build_object(
    'currency', v_currency,
    'period_start', v_month_start::date,
    'period_end', (v_month_end::date - 1),
    'discipline_score', v_score,
    'income', v_income,
    'expense', v_expense,
    'committed_spending', v_commitments,
    'goal_saved_total', v_goal_saved,
    'narrative', case
      when v_income = 0 and v_expense = 0 then 'No completed ledger activity was captured for this month yet.'
      when v_income = 0 then 'Spending was recorded without matching income this month.'
      when v_expense > v_income then 'Spending exceeded income this month. Review flexible and recurring commitments before the next cycle.'
      when v_score >= 70 then 'This month stayed within income. Keep the same review rhythm next cycle.'
      else 'This month remained solvent, but spending consumed most captured income.'
    end
  );
end;
$$;

revoke all on function public.get_month_end_report(date) from public;
grant execute on function public.get_month_end_report(date) to authenticated;