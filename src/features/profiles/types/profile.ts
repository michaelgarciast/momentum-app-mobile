import type { UpdateProfileInput } from "@/features/profiles/schema/schemas";
import type { WeightUnit } from "@/shared/lib/units";

export type Profile = {
  id: string;
  displayName: string;
  preferredWeightUnit: WeightUnit;
};

export type ProfileState = {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  update: (input: UpdateProfileInput) => Promise<boolean>;
  reset: () => void;
};
