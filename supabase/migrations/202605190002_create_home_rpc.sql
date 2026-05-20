create or replace function public.create_home_for_current_user(
  home_name text,
  address_label text default null
)
returns public.homes
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  inserted_home public.homes;
begin
  if current_user_id is null then
    raise exception 'No authenticated user.' using errcode = '28000';
  end if;

  if not exists (select 1 from public.profiles where id = current_user_id) then
    raise exception 'Current user profile does not exist.' using errcode = '23503';
  end if;

  insert into public.homes (name, address_label, created_by)
  values (nullif(btrim(home_name), ''), nullif(btrim(address_label), ''), current_user_id)
  returning * into inserted_home;

  insert into public.home_members (home_id, user_id, role)
  values (inserted_home.id, current_user_id, 'owner')
  on conflict (home_id, user_id) do nothing;

  return inserted_home;
end;
$$;

revoke all on function public.create_home_for_current_user(text, text) from public;
grant execute on function public.create_home_for_current_user(text, text) to authenticated;
