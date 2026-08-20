-- Performance: wrap auth.uid() in (select ...) inside RLS policies.
-- Postgres caches the subquery result once per query (initPlan) instead of
-- re-evaluating auth.uid() for every row checked.

drop policy "profiles_select_own" on profiles.profiles;

create policy "profiles_select_own" on profiles.profiles
  for select using ((select auth.uid ()) = id);

drop policy "profiles_insert_own" on profiles.profiles;

create policy "profiles_insert_own" on profiles.profiles
  for insert
  with
    check ((select auth.uid ()) = id);

drop policy "profiles_update_own" on profiles.profiles;

create policy "profiles_update_own" on profiles.profiles
  for update using ((select auth.uid ()) = id)
  with
    check ((select auth.uid ()) = id);

drop policy "exercises_owner_all" on exercises.exercises;

create policy "exercises_owner_all" on exercises.exercises for all using ((select auth.uid ()) = user_id)
with
  check ((select auth.uid ()) = user_id);

drop policy "routines_owner_all" on routines.routines;

create policy "routines_owner_all" on routines.routines for all using ((select auth.uid ()) = user_id)
with
  check ((select auth.uid ()) = user_id);

drop policy "routine_exercises_owner_all" on routines.routine_exercises;

create policy "routine_exercises_owner_all" on routines.routine_exercises for all using (
  exists (
    select 1
    from routines.routines r
    where
      r.id = routine_id
      and r.user_id = (select auth.uid ())
  )
)
with
  check (
    exists (
      select 1
      from routines.routines r
      where
        r.id = routine_id
        and r.user_id = (select auth.uid ())
    )
  );

drop policy "routine_exercise_sets_owner_all" on routines.routine_exercise_sets;

create policy "routine_exercise_sets_owner_all" on routines.routine_exercise_sets for all using (
  exists (
    select 1
    from
      routines.routine_exercises re
      join routines.routines r on r.id = re.routine_id
    where
      re.id = routine_exercise_id
      and r.user_id = (select auth.uid ())
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
        and r.user_id = (select auth.uid ())
    )
  );
