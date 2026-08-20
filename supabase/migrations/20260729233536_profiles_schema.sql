-- Domain: profiles
-- Extended user profile data (auth itself is handled by Supabase's built-in `auth` schema).

create schema if not exists profiles;

create type profiles.weight_unit as enum ('kg', 'lb');

create table profiles.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  preferred_weight_unit profiles.weight_unit not null default 'kg',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles.profiles enable row level security;

create policy "profiles_select_own" on profiles.profiles
  for select using (auth.uid () = id);

create policy "profiles_insert_own" on profiles.profiles
  for insert
  with
    check (auth.uid () = id);

create policy "profiles_update_own" on profiles.profiles
  for update using (auth.uid () = id)
  with
    check (auth.uid () = id);

-- Keep updated_at fresh on every update.
create or replace function profiles.set_updated_at ()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on profiles.profiles for each row
execute function profiles.set_updated_at ();

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function profiles.handle_new_user ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users for each row
execute function profiles.handle_new_user ();
