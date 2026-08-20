import { create } from "zustand";

import * as exercisesService from "@/features/exercises/services/exercises.service";
import type { ExercisesState } from "@/features/exercises/types/exercise";

const FRESH_MS = 60_000;

export const useExercisesStore = create<ExercisesState>((set, get) => ({
  exercises: [],
  loading: false,
  error: null,
  fetchedAt: null,

  async fetchAll(force = false) {
    const { fetchedAt } = get();
    if (!force && fetchedAt && Date.now() - fetchedAt < FRESH_MS) return;
    set({ loading: true, error: null });
    const { exercises, error } = await exercisesService.listExercises();
    set({
      loading: false,
      exercises,
      error: error?.message ?? null,
      fetchedAt: error ? null : Date.now(),
    });
  },

  async create(input) {
    set({ loading: true, error: null });
    const { exercise, error } = await exercisesService.createExercise(input);
    if (error) {
      set({ loading: false, error: error.message });
      return false;
    }
    set({ loading: false, exercises: [exercise!, ...get().exercises] });
    return true;
  },

  async update(id, input) {
    set({ loading: true, error: null });
    const { exercise, error } = await exercisesService.updateExercise(id, input);
    if (error) {
      set({ loading: false, error: error.message });
      return false;
    }
    set({
      loading: false,
      exercises: get().exercises.map((e) => (e.id === id ? exercise! : e)),
    });
    return true;
  },

  async remove(id) {
    set({ loading: true, error: null });
    const error = await exercisesService.deleteExercise(id);
    if (error) {
      set({ loading: false, error: error.message });
      return false;
    }
    set({ loading: false, exercises: get().exercises.filter((e) => e.id !== id) });
    return true;
  },

  clearError() {
    set({ error: null });
  },
}));
