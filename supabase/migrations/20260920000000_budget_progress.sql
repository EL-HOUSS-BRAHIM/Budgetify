create or replace function public.get_budget_progress(target_date date default current_date)
returns json
language sql
security definer
set search_path = ''
as $$
  with current_user_id as (
    select auth.uid() as user_id
  ), scoped_budgets as (
    select b.*
    from public.budgets b
    cross join current_user_id u
    where u.user_id is not null
      and b.user_id = u.user_id
      and b.start_date <= target_date
      and b.end_date >= target_date
  ), budget_spend as (
    select
      b.id,
      b.category_name,
      b.amount as limit_amount,
      b.currency,
      b.period,
      b.start_date,
      b.end_date,
      coalesce(sum(t.amount) filter (where t.type = 'expense'), 0)::bigint as spent_amount
    from scoped_budgets b
    left join public.transactions t
      on t.user_id = b.user_id
     and t.currency = b.currency
     and t.type = 'expense'
     and t.date >= b.start_date::timestamptz
     and t.date < (b.end_date + 1)::timestamptz
     and (
       (b.category_id is not null and t.category_id = b.category_id)
       or (b.category_id is null and t.category_name = b.category_name)
     )
    group by b.id, b.category_name, b.amount, b.currency, b.period, b.start_date, b.end_date
  )
  select coalesce(
    json_agg(
      json_build_object(
        'id', id,
        'category_name', category_name,
        'limit', limit_amount,
        'spent', spent_amount,
        'remaining', limit_amount - spent_amount,
        'currency', currency,
        'period', period,
        'start_date', start_date,
        'end_date', end_date,
        'percent_spent', case
          when limit_amount = 0 and spent_amount > 0 then 100
          when limit_amount = 0 then 0
          else least(100, round((spent_amount::numeric / limit_amount::numeric) * 100))::int
        end,
        'status', case
          when spent_amount > limit_amount then 'over'
          when limit_amount > 0 and spent_amount >= (limit_amount * 0.8) then 'warning'
          else 'on_track'
        end
      )
      order by category_name
    ),
    '[]'::json
  )
  from budget_spend;
$$;

revoke all on function public.get_budget_progress(date) from public;
grant execute on function public.get_budget_progress(date) to authenticated;