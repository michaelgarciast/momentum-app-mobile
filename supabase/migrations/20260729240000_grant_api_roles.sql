-- Grant API access to anon/authenticated on custom schemas.
-- The migrations that created `profiles`, `exercises` and `routines` enabled RLS
-- with owner-scoped policies, but never granted USAGE on the schemas nor
-- table privileges to the Data API roles (`anon`, `authenticated`). Without
-- these grants PostgREST returns 42501 "permission denied for schema <name>".
-- RLS still filters rows by auth.uid(), so exposing the tables is safe.

grant usage on schema profiles to anon, authenticated;
grant usage on schema exercises to anon, authenticated;
grant usage on schema routines to anon, authenticated;

-- Tables: full DML to anon/authenticated; RLS enforces row-level ownership.
grant select, insert, update, delete
  on profiles.profiles
  to anon, authenticated;

grant select, insert, update, delete
  on exercises.exercises
  to anon, authenticated;

grant select, insert, update, delete
  on routines.routines,
       routines.routine_exercises,
       routines.routine_exercise_sets
  to anon, authenticated;

-- Allow sequences used for defaults (none use serial currently, but keep this
-- future-proof for any serial/identity columns added later).
grant usage, select on all sequences in schema profiles, exercises, routines
  to anon, authenticated;
