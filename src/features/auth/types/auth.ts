import type { Session } from "@supabase/supabase-js";

import type { LoginInput, RegisterInput } from "@/features/auth/schema/schemas";

export type AuthState = {
  session: Session | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;
  login: (input: LoginInput) => Promise<boolean>;
  register: (input: RegisterInput) => Promise<boolean>;
  logout: () => Promise<boolean>;
  initialize: () => void;
  clearError: () => void;
};
