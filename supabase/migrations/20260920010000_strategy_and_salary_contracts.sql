create or replace function public.get_goal_strategy(goal_id uuid, target_date date default current_date)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_goal public.goals%rowtype;
  v_month_start timestamptz := date_trunc('month', target_date::timestamptz);
  v_month_end timestamptz := date_trunc('month', target_date::timestamptz) + interval '1 month';
  v_recent_start timestamptz := date_trunc('month', target_date::timestamptz) - interval '2 months';
  v_remaining bigint;
  v_funded_percent int;
  v_months_to_deadline int;
  v_required_monthly bigint;
  v_recent_income bigint := 0;
  v_recent_expense bigint := 0;
  v_open_commitments bigint := 0;
  v_monthly_capacity bigint := 0;
  v_recommended_monthly bigint := 0;
  v_projected_months int;
  v_projected_completion date;
  v_status text;
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  select * into v_goal
  from public.goals
  where id = goal_id
    and user_id = v_user_id;

  if not found then
    raise exception 'Goal not found';
  end if;

  v_remaining := greatest(v_goal.target_amount - v_goal.current_amount, 0);
  v_funded_percent := case
    when v_goal.target_amount <= 0 then 0
    else least(100, round((v_goal.current_amount::numeric / v_goal.target_amount::numeric) * 100))::int
  end;

  v_months_to_deadline := case
    when v_goal.deadline is null then null
    else greatest(1, ((date_part('year', age(v_goal.deadline, target_date))::int * 12) + date_part('month', age(v_goal.deadline, target_date))::int + 1))
  end;
  v_required_monthly := case
    when v_remaining = 0 then 0
    when v_months_to_deadline is null then 0
    else ceil(v_remaining::numeric / v_months_to_deadline::numeric)::bigint
  end;

  select
    coalesce(sum(case when type = 'income' then amount else 0 end), 0),
    coalesce(sum(case when type = 'expense' then amount else 0 end), 0)
  into v_recent_income, v_recent_expense
  from public.transactions
  where user_id = v_user_id
    and currency = v_goal.currency
    and date >= v_recent_start
    and date < v_month_end;

  select coalesce(sum(expected_amount), 0)
  into v_open_commitments
  from public.plan_items
  where user_id = v_user_id
    and currency = v_goal.currency
    and is_done = false
    and (due_date is null or (due_date >= target_date and due_date < (target_date + interval '31 days')::date));

  v_monthly_capacity := greatest(0, ((v_recent_income - v_recent_expense) / 3) - v_open_commitments);
  v_recommended_monthly := case
    when v_remaining = 0 then 0
    when v_required_monthly > 0 then least(v_remaining, greatest(v_required_monthly, least(v_monthly_capacity, v_remaining)))
    else least(v_remaining, v_monthly_capacity)
  end;
  v_projected_months := case
    when v_remaining = 0 then 0
    when v_recommended_monthly <= 0 then null
    else ceil(v_remaining::numeric / v_recommended_monthly::numeric)::int
  end;
  v_projected_completion := case
    when v_projected_months is null then null
    else (target_date + (v_projected_months || ' months')::interval)::date
  end;
  v_status := case
    when v_remaining = 0 then 'funded'
    when v_months_to_deadline is null then 'no_deadline'
    when v_recommended_monthly >= v_required_monthly then 'on_track'
    when v_recommended_monthly > 0 then 'behind'
    else 'blocked'
  end;

  return json_build_object(
    'goal_id', v_goal.id,
    'name', v_goal.name,
    'currency', v_goal.currency,
    'target_amount', v_goal.target_amount,
    'current_amount', v_goal.current_amount,
    'remaining_amount', v_remaining,
    'funded_percent', v_funded_percent,
    'deadline', v_goal.deadline,
    'months_to_deadline', v_months_to_deadline,
    'required_monthly', v_required_monthly,
    'recommended_monthly', v_recommended_monthly,
    'monthly_capacity', v_monthly_capacity,
    'projected_months', v_projected_months,
    'projected_completion', v_projected_completion,
    'status', v_status,
    'explanation', case
      when v_remaining = 0 then 'This goal is fully funded.'
      when v_recommended_monthly <= 0 then 'Budgetify cannot recommend a contribution until income exceeds open commitments and recent spending.'
      else 'Recommendation uses recent income, spending, open commitments, and the goal deadline.'
    end
  );
end;
$$;

revoke all on function public.get_goal_strategy(uuid, date) from public;
grant execute on function public.get_goal_strategy(uuid, date) to authenticated;

create or replace function public.get_salary_allocation(target_date date default current_date)
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
  v_account_balance bigint := 0;
  v_source_amount bigint := 0;
  v_source_label text;
  v_fixed_bills bigint := 0;
  v_goal_need bigint := 0;
  v_goal_allocation bigint := 0;
  v_reserve bigint := 0;
  v_safety_buffer bigint := 0;
  v_safe_to_spend bigint := 0;
  v_goal_names text;
  v_bill_names text;
  v_after_bills bigint;
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  select coalesce(
    (select currency from public.profiles where id = v_user_id),
    (select currency from public.accounts where user_id = v_user_id order by is_default desc, created_at asc limit 1),
    'USD'
  ) into v_currency;

  select coalesce(sum(amount), 0)
  into v_income
  from public.transactions
  where user_id = v_user_id
    and currency = v_currency
    and type = 'income'
    and date >= v_month_start
    and date < v_month_end;

  select coalesce(sum(current_balance), 0)
  into v_account_balance
  from public.accounts
  where user_id = v_user_id
    and currency = v_currency;

  v_source_amount := case when v_income > 0 then v_income else v_account_balance end;
  v_source_label := case when v_income > 0 then 'Current month income' else 'Available account balance' end;

  select coalesce(sum(expected_amount), 0), string_agg(title, ' · ' order by due_date nulls last, created_at)
  into v_fixed_bills, v_bill_names
  from public.plan_items
  where user_id = v_user_id
    and currency = v_currency
    and is_done = false
    and (due_date is null or (due_date >= target_date and due_date < v_month_end::date));

  select coalesce(sum(greatest(target_amount - current_amount, 0)), 0), string_agg(name, ' · ' order by deadline nulls last, created_at)
  into v_goal_need, v_goal_names
  from public.goals
  where user_id = v_user_id
    and currency = v_currency
    and current_amount < target_amount;

  v_after_bills := greatest(0, v_source_amount - v_fixed_bills);
  v_goal_allocation := least(v_goal_need, floor(v_after_bills * 0.3)::bigint);
  v_reserve := floor(greatest(0, v_after_bills - v_goal_allocation) * 0.2)::bigint;
  v_safety_buffer := floor(greatest(0, v_after_bills - v_goal_allocation - v_reserve) * 0.15)::bigint;
  v_safe_to_spend := greatest(0, v_source_amount - v_fixed_bills - v_goal_allocation - v_reserve - v_safety_buffer);

  return json_build_object(
    'currency', v_currency,
    'source_amount', v_source_amount,
    'source_label', v_source_label,
    'fixed_bills', v_fixed_bills,
    'goals', v_goal_allocation,
    'reserve', v_reserve,
    'safety_buffer', v_safety_buffer,
    'safe_to_spend', v_safe_to_spend,
    'goal_names', coalesce(v_goal_names, 'No active goals'),
    'bill_names', coalesce(v_bill_names, 'No upcoming commitments'),
    'status', case when v_source_amount = 0 then 'empty' else 'ready' end,
    'explanation', 'Recommendation uses current month income when available, otherwise same-currency account balances.'
  );
end;
$$;

revoke all on function public.get_salary_allocation(date) from public;
grant execute on function public.get_salary_allocation(date) to authenticated;