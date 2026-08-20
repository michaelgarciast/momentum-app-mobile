import { create } from "zustand";

import * as profilesService from "@/features/profiles/services/profiles.service";
import type { ProfileState } from "@/features/profiles/types/profile";
import { supabase } from "@/shared/lib/supabase";

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  loading: false,
  error: null,

  async load() {
    set({ loading: true, error: null });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      set({ loading: false });
      return;
    }
    const { profile, error } = await profilesService.getProfile(user.id);
    set({ loading: false, profile, error: error?.message ?? null });
  },

  async update(input) {
    set({ loading: true, error: null });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      set({ loading: false, error: "No hay sesión activa" });
      return false;
    }
    const { profile, error } = await profilesService.updateProfile(user.id, input);
    if (error) {
      set({ loading: false, error: error.message });
      return false;
    }
    set({ loading: false, profile });
    return true;
  },

  reset() {
    set({ profile: null, loading: false, error: null });
  },
}));
