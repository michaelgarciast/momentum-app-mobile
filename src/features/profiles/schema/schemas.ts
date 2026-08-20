import { z } from "zod";

export const updateProfileSchema = z.object({
  displayName: z.string().min(2, "Mínimo 2 caracteres"),
  preferredWeightUnit: z.enum(["kg", "lb"]),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
