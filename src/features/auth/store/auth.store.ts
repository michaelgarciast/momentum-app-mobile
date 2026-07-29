import { create } from "zustand";

import * as authService from "@/features/auth/services/auth.service";
import type { AuthState } from "@/features/auth/types/auth";

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  initialized: false,
  loading: false,
  error: null,

  initialize() {
    authService.getSession().then((session) => {
      set({ session, initialized: true });
    });

    authService.onAuthStateChange((session) => {
      set({ session });
    });
  },

  async login(input) {
    set({ loading: true, error: null });
    const error = await authService.login(input);
    set({ loading: false });
    if (error) {
      set({ error: error.message });
      return false;
    }
    return true;
  },

  async register(input) {
    set({ loading: true, error: null });
    const error = await authService.register(input);
    set({ loading: false });
    if (error) {
      set({ error: error.message });
      return false;
    }
    return true;
  },

  async logout() {
    set({ loading: true, error: null });
    const error = await authService.logout();
    set({ loading: false });
    if (error) {
      set({ error: error.message });
      return false;
    }
    set({ session: null });
    return true;
  },

  clearError() {
    set({ error: null });
  },
}));
