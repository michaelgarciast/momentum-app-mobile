import type { ExerciseInput } from "@/features/exercises/schema/schemas";
import type { Exercise } from "@/features/exercises/types/exercise";
import { exercisesDb, supabase } from "@/shared/lib/supabase";

type ExerciseRow = {
  id: string;
  name: string;
  muscle_group: string | null;
  equipment: string | null;
  notes: string | null;
};

const SELECT_COLUMNS = "id, name, muscle_group, equipment, notes";

function mapRow(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    name: row.name,
    muscleGroup: row.muscle_group,
    equipment: row.equipment,
    notes: row.notes,
  };
}

export async function listExercises(): Promise<{ exercises: Exercise[]; error: Error | null }> {
  const { data, error } = await exercisesDb()
    .from("exercises")
    .select(SELECT_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) return { exercises: [], error: new Error(error.message) };
  return { exercises: (data ?? []).map(mapRow), error: null };
}

export async function createExercise(input: ExerciseInput): Promise<{ exercise: Exercise | null; error: Error | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { exercise: null, error: new Error("No hay sesión activa") };

  const { data, error } = await exercisesDb()
    .from("exercises")
    .insert({
      user_id: user.id,
      name: input.name,
      muscle_group: input.muscleGroup || null,
      equipment: input.equipment || null,
      notes: input.notes || null,
    })
    .select(SELECT_COLUMNS)
    .single();

  if (error) return { exercise: null, error: new Error(error.message) };
  return { exercise: mapRow(data), error: null };
}

export async function updateExercise(
  id: string,
  input: ExerciseInput,
): Promise<{ exercise: Exercise | null; error: Error | null }> {
  const { data, error } = await exercisesDb()
    .from("exercises")
    .update({
      name: input.name,
      muscle_group: input.muscleGroup || null,
      equipment: input.equipment || null,
      notes: input.notes || null,
    })
    .eq("id", id)
    .select(SELECT_COLUMNS)
    .single();

  if (error) return { exercise: null, error: new Error(error.message) };
  return { exercise: mapRow(data), error: null };
}

export async function deleteExercise(id: string): Promise<Error | null> {
  const { error } = await exercisesDb().from("exercises").delete().eq("id", id);
  return error ? new Error(error.message) : null;
}
