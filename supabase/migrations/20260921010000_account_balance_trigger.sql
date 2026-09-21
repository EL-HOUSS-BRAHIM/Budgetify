-- Keep manual account balances synchronized with the transaction ledger.
-- Transfers move value; they are never included in income or expense totals.

create or replace function public.apply_transaction_balance()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    if old.type = 'expense' then
      update public.accounts
         set current_balance = current_balance + old.amount
       where id = coalesce(old.source_account_id, old.account_id)
         and user_id = old.user_id;
    elsif old.type = 'income' then
      update public.accounts
         set current_balance = current_balance - old.amount
       where id = coalesce(old.destination_account_id, old.account_id)
         and user_id = old.user_id;
    elsif old.type = 'transfer' then
      update public.accounts
         set current_balance = current_balance + old.amount
       where id = old.source_account_id and user_id = old.user_id;
      update public.accounts
         set current_balance = current_balance - old.amount
       where id = old.destination_account_id and user_id = old.user_id;
    end if;
  end if;

  if tg_op in ('INSERT', 'UPDATE') then
    if new.type = 'expense' then
      update public.accounts
         set current_balance = current_balance - new.amount
       where id = coalesce(new.source_account_id, new.account_id)
         and user_id = new.user_id;
    elsif new.type = 'income' then
      update public.accounts
         set current_balance = current_balance + new.amount
       where id = coalesce(new.destination_account_id, new.account_id)
         and user_id = new.user_id;
    elsif new.type = 'transfer' then
      update public.accounts
         set current_balance = current_balance - new.amount
       where id = new.source_account_id and user_id = new.user_id;
      update public.accounts
         set current_balance = current_balance + new.amount
       where id = new.destination_account_id and user_id = new.user_id;
    end if;
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists transactions_apply_account_balance on public.transactions;
create trigger transactions_apply_account_balance
  after insert or update or delete on public.transactions
  for each row execute function public.apply_transaction_balance();
