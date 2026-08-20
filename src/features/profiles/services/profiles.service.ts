import type { UpdateProfileInput } from "@/features/profiles/schema/schemas";
import type { Profile } from "@/features/profiles/types/profile";
import { profilesDb } from "@/shared/lib/supabase";

type ProfileRow = {
  id: string;
  display_name: string;
  preferred_weight_unit: "kg" | "lb";
};

function mapRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    preferredWeightUnit: row.preferred_weight_unit,
  };
}

export async function getProfile(userId: string): Promise<{ profile: Profile | null; error: Error | null }> {
  const { data, error } = await profilesDb()
    .from("profiles")
    .select("id, display_name, preferred_weight_unit")
    .eq("id", userId)
    .maybeSingle();

  if (error) return { profile: null, error: new Error(error.message) };
  return { profile: data ? mapRow(data) : null, error: null };
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<{ profile: Profile | null; error: Error | null }> {
  const { data, error } = await profilesDb()
    .from("profiles")
    .update({
      display_name: input.displayName,
      preferred_weight_unit: input.preferredWeightUnit,
    })
    .eq("id", userId)
    .select("id, display_name, preferred_weight_unit")
    .single();

  if (error) return { profile: null, error: new Error(error.message) };
  return { profile: mapRow(data), error: null };
}
