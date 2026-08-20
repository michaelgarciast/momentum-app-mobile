import { z } from "zod";

export const exerciseSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  muscleGroup: z.string().nullish(),
  equipment: z.string().nullish(),
  notes: z.string().nullish(),
});

export type ExerciseInput = z.infer<typeof exerciseSchema>;
