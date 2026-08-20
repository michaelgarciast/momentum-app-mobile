import type { ExerciseInput } from "@/features/exercises/schema/schemas";

export type Exercise = {
  id: string;
  name: string;
  muscleGroup: string | null;
  equipment: string | null;
  notes: string | null;
};

export type ExercisesState = {
  exercises: Exercise[];
  loading: boolean;
  error: string | null;
  fetchedAt: number | null;
  fetchAll: (force?: boolean) => Promise<void>;
  create: (input: ExerciseInput) => Promise<boolean>;
  update: (id: string, input: ExerciseInput) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  clearError: () => void;
};
