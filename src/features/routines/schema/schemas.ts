import { z } from "zod";

export const routineSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  description: z.string().optional(),
});

export const routineExerciseSchema = z.object({
  exerciseId: z.uuid("Selecciona un ejercicio"),
  frequencyDays: z.array(z.number().int().min(1).max(7)).default([]),
  defaultRestSeconds: z.number().int().min(0).default(60),
  notes: z.string().optional(),
});

export const createExerciseAndAddSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  muscleGroup: z.string().nullish(),
  equipment: z.string().nullish(),
  exerciseNotes: z.string().nullish(),
  frequencyDays: z.array(z.number().int().min(1).max(7)).default([]),
  defaultRestSeconds: z.number().int().min(0).default(60),
  routineNotes: z.string().optional(),
});

export const routineExerciseSetSchema = z.object({
  setNumber: z.number().int().min(1),
  setType: z.enum(["approximation", "effective"]),
  targetReps: z.number().int().min(1, "Debe ser al menos 1"),
  targetWeight: z.number().min(0).optional(),
  weightUnit: z.enum(["kg", "lb"]),
  restSeconds: z.number().int().min(0).optional(),
});

// Update schemas: same shape as their create counterparts but all fields
// optional (the id is passed separately to the service). Used when editing
// an existing routine / routine_exercise / routine_exercise_set in place.
export const routineUpdateSchema = routineSchema.partial();
export const routineExerciseUpdateSchema = routineExerciseSchema.partial();
export const routineExerciseSetUpdateSchema = routineExerciseSetSchema.partial();

export type RoutineInput = z.infer<typeof routineSchema>;
export type RoutineExerciseInput = z.infer<typeof routineExerciseSchema>;
export type CreateExerciseAndAddInput = z.infer<typeof createExerciseAndAddSchema>;
export type RoutineExerciseSetInput = z.infer<typeof routineExerciseSetSchema>;
export type RoutineUpdateInput = z.infer<typeof routineUpdateSchema>;
export type RoutineExerciseUpdateInput = z.infer<typeof routineExerciseUpdateSchema>;
export type RoutineExerciseSetUpdateInput = z.infer<typeof routineExerciseSetUpdateSchema>;
