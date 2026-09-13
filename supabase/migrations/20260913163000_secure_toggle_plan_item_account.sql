create or replace function public.toggle_plan_item(
  p_item_id uuid,
  p_account_id uuid default null
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_item record;
  v_new_is_done boolean;
  v_tx_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  select * into v_item
  from public.plan_items
  where id = p_item_id and user_id = v_user_id;

  if not found then
    raise exception 'Plan item not found';
  end if;

  if p_account_id is not null and not exists (
    select 1
    from public.accounts
    where id = p_account_id and user_id = v_user_id
  ) then
    raise exception 'Account not found';
  end if;

  v_new_is_done := not v_item.is_done;

  if v_new_is_done then
    if v_item.transaction_id is null and v_item.expected_amount > 0 then
      insert into public.transactions (
        user_id,
        account_id,
        category_id,
        category_name,
        amount,
        currency,
        type,
        description,
        is_planned,
        planned_item_id,
        date
      )
      values (
        v_user_id,
        p_account_id,
        v_item.category_id,
        v_item.category_name,
        v_item.expected_amount,
        v_item.currency,
        'expense',
        v_item.title,
        true,
        v_item.id,
        now()
      )
      returning id into v_tx_id;
    else
      v_tx_id := v_item.transaction_id;
    end if;

    update public.plan_items
    set is_done = true,
        done_at = now(),
        transaction_id = v_tx_id
    where id = p_item_id;
  else
    if v_item.transaction_id is not null then
      delete from public.transactions
      where id = v_item.transaction_id and user_id = v_user_id;
    end if;

    update public.plan_items
    set is_done = false,
        done_at = null,
        transaction_id = null
    where id = p_item_id;
  end if;

  return json_build_object(
    'id', p_item_id,
    'is_done', v_new_is_done,
    'transaction_id', v_tx_id
  );
end;
$$;