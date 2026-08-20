-- Domain: exercises
-- User-owned exercise catalog.

create schema if not exists exercises;

create table exercises.exercises (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  muscle_group text,
  equipment text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index exercises_user_id_idx on exercises.exercises (user_id);

alter table exercises.exercises enable row level security;

create policy "exercises_owner_all" on exercises.exercises for all using (auth.uid () = user_id)
with
  check (auth.uid () = user_id);

create or replace function exercises.set_updated_at ()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger exercises_set_updated_at before update on exercises.exercises for each row
execute function exercises.set_updated_at ();
