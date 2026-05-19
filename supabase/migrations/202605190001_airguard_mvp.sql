create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'homeowner',
  onboarding_complete boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.homes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address_label text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.home_members (
  id uuid primary key default gen_random_uuid(),
  home_id uuid references public.homes(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz default now(),
  unique(home_id, user_id)
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  home_id uuid references public.homes(id) on delete cascade,
  name text not null,
  type text not null,
  status text not null default 'good',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  home_id uuid references public.homes(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete set null,
  name text not null,
  type text not null,
  connection_status text not null default 'online',
  safety_status text not null default 'good',
  battery_level integer,
  power_connected boolean default false,
  last_seen_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.readings (
  id uuid primary key default gen_random_uuid(),
  home_id uuid references public.homes(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete cascade,
  device_id uuid references public.devices(id) on delete cascade,
  type text not null,
  value numeric not null,
  unit text not null,
  status text not null default 'good',
  status_label text,
  created_at timestamptz default now()
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  home_id uuid references public.homes(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete cascade,
  device_id uuid references public.devices(id) on delete set null,
  title text not null,
  message text not null,
  severity text not null default 'active',
  status text not null default 'active',
  recommended_action text,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  home_id uuid references public.homes(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  type text not null,
  title text not null,
  message text,
  created_at timestamptz default now()
);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();

drop trigger if exists set_homes_updated_at on public.homes;
create trigger set_homes_updated_at before update on public.homes for each row execute function public.set_updated_at();

drop trigger if exists set_rooms_updated_at on public.rooms;
create trigger set_rooms_updated_at before update on public.rooms for each row execute function public.set_updated_at();

drop trigger if exists set_devices_updated_at on public.devices;
create trigger set_devices_updated_at before update on public.devices for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'homeowner')
  )
  on conflict (id) do update set
    email = excluded.email,
    name = coalesce(public.profiles.name, excluded.name),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.handle_new_home()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.home_members (home_id, user_id, role)
  values (new.id, new.created_by, 'owner')
  on conflict (home_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_home_created on public.homes;
create trigger on_home_created
  after insert on public.homes
  for each row execute function public.handle_new_home();

alter table public.profiles enable row level security;
alter table public.homes enable row level security;
alter table public.home_members enable row level security;
alter table public.rooms enable row level security;
alter table public.devices enable row level security;
alter table public.readings enable row level security;
alter table public.alerts enable row level security;
alter table public.activity_logs enable row level security;

create or replace function public.is_home_member(target_home_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.home_members
    where home_id = target_home_id
      and user_id = auth.uid()
  );
$$;

drop policy if exists "profiles_read_own" on public.profiles;
create policy "profiles_read_own" on public.profiles
  for select using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());

drop policy if exists "homes_read_member" on public.homes;
create policy "homes_read_member" on public.homes
  for select using (public.is_home_member(id));

drop policy if exists "homes_create" on public.homes;
create policy "homes_create" on public.homes
  for insert with check (created_by = auth.uid());

drop policy if exists "homes_update_member" on public.homes;
create policy "homes_update_member" on public.homes
  for update using (public.is_home_member(id)) with check (public.is_home_member(id));

drop policy if exists "home_members_read_current_users_homes" on public.home_members;
create policy "home_members_read_current_users_homes" on public.home_members
  for select using (user_id = auth.uid() or public.is_home_member(home_id));

drop policy if exists "home_members_create_own_membership" on public.home_members;
create policy "home_members_create_own_membership" on public.home_members
  for insert with check (user_id = auth.uid() and public.is_home_member(home_id));

drop policy if exists "home_members_update_member" on public.home_members;
create policy "home_members_update_member" on public.home_members
  for update using (public.is_home_member(home_id)) with check (public.is_home_member(home_id));

drop policy if exists "home_members_delete_member" on public.home_members;
create policy "home_members_delete_member" on public.home_members
  for delete using (public.is_home_member(home_id));

drop policy if exists "rooms_read_member" on public.rooms;
create policy "rooms_read_member" on public.rooms
  for select using (public.is_home_member(home_id));

drop policy if exists "rooms_create_member" on public.rooms;
create policy "rooms_create_member" on public.rooms
  for insert with check (public.is_home_member(home_id));

drop policy if exists "rooms_update_member" on public.rooms;
create policy "rooms_update_member" on public.rooms
  for update using (public.is_home_member(home_id)) with check (public.is_home_member(home_id));

drop policy if exists "rooms_delete_member" on public.rooms;
create policy "rooms_delete_member" on public.rooms
  for delete using (public.is_home_member(home_id));

drop policy if exists "devices_read_member" on public.devices;
create policy "devices_read_member" on public.devices
  for select using (public.is_home_member(home_id));

drop policy if exists "devices_create_member" on public.devices;
create policy "devices_create_member" on public.devices
  for insert with check (public.is_home_member(home_id));

drop policy if exists "devices_update_member" on public.devices;
create policy "devices_update_member" on public.devices
  for update using (public.is_home_member(home_id)) with check (public.is_home_member(home_id));

drop policy if exists "devices_delete_member" on public.devices;
create policy "devices_delete_member" on public.devices
  for delete using (public.is_home_member(home_id));

drop policy if exists "readings_read_member" on public.readings;
create policy "readings_read_member" on public.readings
  for select using (public.is_home_member(home_id));

drop policy if exists "readings_create_member" on public.readings;
create policy "readings_create_member" on public.readings
  for insert with check (public.is_home_member(home_id));

drop policy if exists "alerts_read_member" on public.alerts;
create policy "alerts_read_member" on public.alerts
  for select using (public.is_home_member(home_id));

drop policy if exists "alerts_create_member" on public.alerts;
create policy "alerts_create_member" on public.alerts
  for insert with check (public.is_home_member(home_id));

drop policy if exists "alerts_update_member" on public.alerts;
create policy "alerts_update_member" on public.alerts
  for update using (public.is_home_member(home_id)) with check (public.is_home_member(home_id));

drop policy if exists "activity_logs_read_member" on public.activity_logs;
create policy "activity_logs_read_member" on public.activity_logs
  for select using (public.is_home_member(home_id));

drop policy if exists "activity_logs_create_member" on public.activity_logs;
create policy "activity_logs_create_member" on public.activity_logs
  for insert with check (public.is_home_member(home_id));
