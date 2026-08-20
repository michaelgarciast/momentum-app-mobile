import type {
  CreateExerciseAndAddInput,
  RoutineExerciseInput,
  RoutineExerciseSetInput,
  RoutineExerciseSetUpdateInput,
  RoutineExerciseUpdateInput,
  RoutineInput,
  RoutineUpdateInput,
} from "@/features/routines/schema/schemas";
import type {
  RoutineDetail,
  RoutineExerciseDetail,
  RoutineExerciseSet,
  RoutineStats,
  RoutineSummary,
} from "@/features/routines/types/routine";
import { exercisesDb, routinesDb, supabase } from "@/shared/lib/supabase";

type RoutineRow = { id: string; name: string; description: string | null };

type RoutineExerciseRow = {
  id: string;
  exercise_id: string;
  order_index: number;
  frequency_days: number[];
  default_rest_seconds: number;
  notes: string | null;
};

type RoutineExerciseSetRow = {
  id: string;
  routine_exercise_id: string;
  set_number: number;
  set_type: "approximation" | "effective";
  target_reps: number;
  target_weight: number | null;
  weight_unit: "kg" | "lb";
  rest_seconds: number | null;
};

function mapRoutine(row: RoutineRow): RoutineSummary {
  return { id: row.id, name: row.name, description: row.description };
}

function mapSet(row: RoutineExerciseSetRow): RoutineExerciseSet {
  return {
    id: row.id,
    setNumber: row.set_number,
    setType: row.set_type,
    targetReps: row.target_reps,
    targetWeight: row.target_weight,
    weightUnit: row.weight_unit,
    restSeconds: row.rest_seconds,
  };
}

export async function listRoutines(): Promise<{ routines: RoutineSummary[]; error: Error | null }> {
  const { data, error } = await routinesDb()
    .from("routines")
    .select("id, name, description")
    .order("created_at", { ascending: false });

  if (error) return { routines: [], error: new Error(error.message) };
  return { routines: (data ?? []).map(mapRoutine), error: null };
}

export async function getRoutineDetail(
  routineId: string,
): Promise<{ routine: RoutineDetail | null; error: Error | null }> {
  const { data: routineRow, error: routineError } = await routinesDb()
    .from("routines")
    .select("id, name, description")
    .eq("id", routineId)
    .single();
  if (routineError) return { routine: null, error: new Error(routineError.message) };

  const { data: reRows, error: reError } = await routinesDb()
    .from("routine_exercises")
    .select("id, exercise_id, order_index, frequency_days, default_rest_seconds, notes")
    .eq("routine_id", routineId)
    .order("order_index", { ascending: true });
  if (reError) return { routine: null, error: new Error(reError.message) };

  const routineExerciseRows = (reRows ?? []) as RoutineExerciseRow[];
  const exerciseIds = [...new Set(routineExerciseRows.map((r) => r.exercise_id))];
  const routineExerciseIds = routineExerciseRows.map((r) => r.id);

  const [{ data: exerciseRows, error: exercisesError }, { data: setRows, error: setsError }] =
    await Promise.all([
      exerciseIds.length
        ? exercisesDb().from("exercises").select("id, name").in("id", exerciseIds)
        : Promise.resolve({ data: [], error: null }),
      routineExerciseIds.length
        ? routinesDb()
            .from("routine_exercise_sets")
            .select("id, routine_exercise_id, set_number, set_type, target_reps, target_weight, weight_unit, rest_seconds")
            .in("routine_exercise_id", routineExerciseIds)
            .order("set_number", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
    ]);
  if (exercisesError) return { routine: null, error: new Error(exercisesError.message) };
  if (setsError) return { routine: null, error: new Error(setsError.message) };

  const exerciseNameById = new Map((exerciseRows ?? []).map((e: { id: string; name: string }) => [e.id, e.name]));
  const setsByRoutineExercise = new Map<string, RoutineExerciseSet[]>();
  for (const row of (setRows ?? []) as RoutineExerciseSetRow[]) {
    const list = setsByRoutineExercise.get(row.routine_exercise_id) ?? [];
    list.push(mapSet(row));
    setsByRoutineExercise.set(row.routine_exercise_id, list);
  }

  const exercises: RoutineExerciseDetail[] = routineExerciseRows.map((row) => ({
    id: row.id,
    exerciseId: row.exercise_id,
    exerciseName: exerciseNameById.get(row.exercise_id) ?? "Ejercicio",
    orderIndex: row.order_index,
    frequencyDays: row.frequency_days,
    defaultRestSeconds: row.default_rest_seconds,
    notes: row.notes,
    sets: setsByRoutineExercise.get(row.id) ?? [],
  }));

  return { routine: { ...mapRoutine(routineRow), exercises }, error: null };
}

// Counts and frequency days for many routines in 2 batched queries
// (used by the home dashboard instead of N x getRoutineDetail).
export async function listRoutineStats(
  routineIds: string[],
): Promise<{ stats: Record<string, RoutineStats>; error: Error | null }> {
  if (routineIds.length === 0) return { stats: {}, error: null };

  const { data: reRows, error: reError } = await routinesDb()
    .from("routine_exercises")
    .select("id, routine_id, frequency_days")
    .in("routine_id", routineIds);
  if (reError) return { stats: {}, error: new Error(reError.message) };

  const routineExerciseRows = (reRows ?? []) as {
    id: string;
    routine_id: string;
    frequency_days: number[];
  }[];
  const routineExerciseIds = routineExerciseRows.map((r) => r.id);

  const { data: setRows, error: setsError } = routineExerciseIds.length
    ? await routinesDb()
        .from("routine_exercise_sets")
        .select("routine_exercise_id")
        .in("routine_exercise_id", routineExerciseIds)
    : { data: [], error: null };
  if (setsError) return { stats: {}, error: new Error(setsError.message) };

  const setCountByRoutineExercise = new Map<string, number>();
  for (const row of (setRows ?? []) as { routine_exercise_id: string }[]) {
    setCountByRoutineExercise.set(
      row.routine_exercise_id,
      (setCountByRoutineExercise.get(row.routine_exercise_id) ?? 0) + 1,
    );
  }

  const stats: Record<string, RoutineStats> = {};
  for (const id of routineIds) {
    stats[id] = { exerciseCount: 0, setCount: 0, frequencyDays: [] };
  }
  for (const row of routineExerciseRows) {
    const entry = stats[row.routine_id];
    if (!entry) continue;
    entry.exerciseCount += 1;
    entry.setCount += setCountByRoutineExercise.get(row.id) ?? 0;
    entry.frequencyDays = [
      ...new Set([...entry.frequencyDays, ...row.frequency_days]),
    ];
  }

  return { stats, error: null };
}

export async function createRoutine(input: RoutineInput): Promise<{ id: string | null; error: Error | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { id: null, error: new Error("No hay sesión activa") };

  const { data, error } = await routinesDb()
    .from("routines")
    .insert({ user_id: user.id, name: input.name, description: input.description || null })
    .select("id")
    .single();

  if (error) return { id: null, error: new Error(error.message) };
  return { id: data.id, error: null };
}

export async function deleteRoutine(routineId: string): Promise<Error | null> {
  const { error } = await routinesDb().from("routines").delete().eq("id", routineId);
  return error ? new Error(error.message) : null;
}

export async function updateRoutine(
  routineId: string,
  input: RoutineUpdateInput,
): Promise<Error | null> {
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.description !== undefined) patch.description = input.description || null;
  if (Object.keys(patch).length === 0) return null;

  const { error } = await routinesDb().from("routines").update(patch).eq("id", routineId);
  return error ? new Error(error.message) : null;
}

export async function addRoutineExercise(
  routineId: string,
  input: RoutineExerciseInput,
  orderIndex: number,
): Promise<Error | null> {
  const { error } = await routinesDb().from("routine_exercises").insert({
    routine_id: routineId,
    exercise_id: input.exerciseId,
    order_index: orderIndex,
    frequency_days: input.frequencyDays,
    default_rest_seconds: input.defaultRestSeconds,
    notes: input.notes || null,
  });
  return error ? new Error(error.message) : null;
}

export async function createExerciseAndAddToRoutine(
  routineId: string,
  input: CreateExerciseAndAddInput,
  orderIndex: number,
): Promise<Error | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Error("No hay sesión activa");

  const { data: exerciseRow, error: exerciseError } = await exercisesDb()
    .from("exercises")
    .insert({
      user_id: user.id,
      name: input.name,
      muscle_group: input.muscleGroup || null,
      equipment: input.equipment || null,
      notes: input.exerciseNotes || null,
    })
    .select("id")
    .single();

  if (exerciseError) return new Error(exerciseError.message);

  const { error: reError } = await routinesDb().from("routine_exercises").insert({
    routine_id: routineId,
    exercise_id: exerciseRow.id,
    order_index: orderIndex,
    frequency_days: input.frequencyDays,
    default_rest_seconds: input.defaultRestSeconds,
    notes: input.routineNotes || null,
  });

  return reError ? new Error(reError.message) : null;
}

export async function removeRoutineExercise(routineExerciseId: string): Promise<Error | null> {
  const { error } = await routinesDb().from("routine_exercises").delete().eq("id", routineExerciseId);
  return error ? new Error(error.message) : null;
}

export async function updateRoutineExercise(
  routineExerciseId: string,
  input: RoutineExerciseUpdateInput,
): Promise<Error | null> {
  const patch: Record<string, unknown> = {};
  if (input.frequencyDays !== undefined) patch.frequency_days = input.frequencyDays;
  if (input.defaultRestSeconds !== undefined) patch.default_rest_seconds = input.defaultRestSeconds;
  if (input.notes !== undefined) patch.notes = input.notes || null;
  if (Object.keys(patch).length === 0) return null;

  const { error } = await routinesDb()
    .from("routine_exercises")
    .update(patch)
    .eq("id", routineExerciseId);
  return error ? new Error(error.message) : null;
}

export async function addRoutineExerciseSet(
  routineExerciseId: string,
  input: RoutineExerciseSetInput,
): Promise<Error | null> {
  const { error } = await routinesDb().from("routine_exercise_sets").insert({
    routine_exercise_id: routineExerciseId,
    set_number: input.setNumber,
    set_type: input.setType,
    target_reps: input.targetReps,
    target_weight: input.targetWeight ?? null,
    weight_unit: input.weightUnit,
    rest_seconds: input.restSeconds ?? null,
  });
  return error ? new Error(error.message) : null;
}

export async function removeRoutineExerciseSet(setId: string): Promise<Error | null> {
  const { error } = await routinesDb().from("routine_exercise_sets").delete().eq("id", setId);
  return error ? new Error(error.message) : null;
}

export async function updateRoutineExerciseSet(
  setId: string,
  input: RoutineExerciseSetUpdateInput,
): Promise<Error | null> {
  const patch: Record<string, unknown> = {};
  if (input.setType !== undefined) patch.set_type = input.setType;
  if (input.targetReps !== undefined) patch.target_reps = input.targetReps;
  if (input.targetWeight !== undefined) patch.target_weight = input.targetWeight ?? null;
  if (input.weightUnit !== undefined) patch.weight_unit = input.weightUnit;
  if (input.restSeconds !== undefined) patch.rest_seconds = input.restSeconds ?? null;
  if (Object.keys(patch).length === 0) return null;

  const { error } = await routinesDb()
    .from("routine_exercise_sets")
    .update(patch)
    .eq("id", setId);
  return error ? new Error(error.message) : null;
}
