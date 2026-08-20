-- Domain: routines
-- Routines -> routine_exercises (exercise placed in a routine, with frequency) ->
-- routine_exercise_sets (individual planned sets: type, reps, weight, rest).

create schema if not exists routines;

create type routines.set_type as enum ('approximation', 'effective');

create type routines.weight_unit as enum ('kg', 'lb');

create table routines.routines (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table routines.routine_exercises (
  id uuid primary key default gen_random_uuid (),
  routine_id uuid not null references routines.routines (id) on delete cascade,
  exercise_id uuid not null references exercises.exercises (id) on delete restrict,
  order_index int not null default 0,
  -- Days of week this exercise is meant to be executed on: 1=Monday ... 7=Sunday.
  frequency_days smallint[] not null default '{}',
  default_rest_seconds int not null default 60,
  notes text,
  created_at timestamptz not null default now()
);

create table routines.routine_exercise_sets (
  id uuid primary key default gen_random_uuid (),
  routine_exercise_id uuid not null references routines.routine_exercises (id) on delete cascade,
  set_number int not null,
  set_type routines.set_type not null default 'effective',
  target_reps int not null,
  target_weight numeric(6, 2),
  weight_unit routines.weight_unit not null default 'kg',
  -- If null, inherits routine_exercises.default_rest_seconds.
  rest_seconds int,
  created_at timestamptz not null default now(),
  unique (routine_exercise_id, set_number)
);

create index routine_exercises_routine_id_idx on routines.routine_exercises (routine_id);

create index routine_exercises_exercise_id_idx on routines.routine_exercises (exercise_id);

create index routine_exercise_sets_re_id_idx on routines.routine_exercise_sets (routine_exercise_id);

alter table routines.routines enable row level security;

alter table routines.routine_exercises enable row level security;

alter table routines.routine_exercise_sets enable row level security;

create policy "routines_owner_all" on routines.routines for all using (auth.uid () = user_id)
with
  check (auth.uid () = user_id);

create policy "routine_exercises_owner_all" on routines.routine_exercises for all using (
  exists (
    select 1
    from routines.routines r
    where
      r.id = routine_id
      and r.user_id = auth.uid ()
  )
)
with
  check (
    exists (
      select 1
      from routines.routines r
      where
        r.id = routine_id
        and r.user_id = auth.uid ()
    )
  );

create policy "routine_exercise_sets_owner_all" on routines.routine_exercise_sets for all using (
  exists (
    select 1
    from
      routines.routine_exercises re
      join routines.routines r on r.id = re.routine_id
    where
      re.id = routine_exercise_id
      and r.user_id = auth.uid ()
  )
)
with
  check (
    exists (
      select 1
      from
        routines.routine_exercises re
        join routines.routines r on r.id = re.routine_id
      where
        re.id = routine_exercise_id
        and r.user_id = auth.uid ()
    )
  );

create or replace function routines.set_updated_at ()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger routines_set_updated_at before update on routines.routines for each row
execute function routines.set_updated_at ();
