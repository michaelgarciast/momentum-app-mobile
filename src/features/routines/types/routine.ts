import type {
  CreateExerciseAndAddInput,
  RoutineExerciseInput,
  RoutineExerciseSetInput,
  RoutineExerciseSetUpdateInput,
  RoutineExerciseUpdateInput,
  RoutineInput,
  RoutineUpdateInput,
} from "@/features/routines/schema/schemas";
import type { WeightUnit } from "@/shared/lib/units";

export type SetType = "approximation" | "effective";

export type RoutineSummary = {
  id: string;
  name: string;
  description: string | null;
};

export type RoutineExerciseSet = {
  id: string;
  setNumber: number;
  setType: SetType;
  targetReps: number;
  targetWeight: number | null;
  weightUnit: WeightUnit;
  restSeconds: number | null;
};

export type RoutineExerciseDetail = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  orderIndex: number;
  frequencyDays: number[];
  defaultRestSeconds: number;
  notes: string | null;
  sets: RoutineExerciseSet[];
};

export type RoutineDetail = RoutineSummary & {
  exercises: RoutineExerciseDetail[];
};

export type RoutineStats = {
  exerciseCount: number;
  setCount: number;
  frequencyDays: number[];
};

export type RoutinesState = {
  routines: RoutineSummary[];
  currentRoutine: RoutineDetail | null;
  loading: boolean;
  error: string | null;
  fetchedAt: number | null;

  fetchAll: (force?: boolean) => Promise<void>;
  fetchDetail: (routineId: string) => Promise<void>;
  createRoutine: (input: RoutineInput) => Promise<string | null>;
  updateRoutine: (routineId: string, input: RoutineUpdateInput) => Promise<boolean>;
  deleteRoutine: (routineId: string) => Promise<boolean>;

  addExercise: (routineId: string, input: RoutineExerciseInput) => Promise<boolean>;
  createExerciseAndAdd: (routineId: string, input: CreateExerciseAndAddInput) => Promise<boolean>;
  updateExercise: (routineExerciseId: string, input: RoutineExerciseUpdateInput) => Promise<boolean>;
  removeExercise: (routineExerciseId: string) => Promise<boolean>;

  addSet: (routineExerciseId: string, input: RoutineExerciseSetInput) => Promise<boolean>;
  updateSet: (setId: string, input: RoutineExerciseSetUpdateInput) => Promise<boolean>;
  removeSet: (setId: string) => Promise<boolean>;

  clearError: () => void;
};
