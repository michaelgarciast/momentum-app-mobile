import { create } from "zustand";

import * as routinesService from "@/features/routines/services/routines.service";
import type { RoutinesState } from "@/features/routines/types/routine";

const FRESH_MS = 60_000;

export const useRoutinesStore = create<RoutinesState>((set, get) => ({
  routines: [],
  currentRoutine: null,
  loading: false,
  error: null,
  fetchedAt: null,

  async fetchAll(force = false) {
    const { fetchedAt } = get();
    if (!force && fetchedAt && Date.now() - fetchedAt < FRESH_MS) return;
    set({ loading: true, error: null });
    const { routines, error } = await routinesService.listRoutines();
    set({
      loading: false,
      routines,
      error: error?.message ?? null,
      fetchedAt: error ? null : Date.now(),
    });
  },

  async fetchDetail(routineId) {
    set({ loading: true, error: null });
    const { routine, error } = await routinesService.getRoutineDetail(routineId);
    set({ loading: false, currentRoutine: routine, error: error?.message ?? null });
  },

  async createRoutine(input) {
    set({ loading: true, error: null });
    const { id, error } = await routinesService.createRoutine(input);
    set({ loading: false, error: error?.message ?? null });
    if (error) return null;
    await get().fetchAll(true);
    return id;
  },

  async deleteRoutine(routineId) {
    set({ loading: true, error: null });
    const error = await routinesService.deleteRoutine(routineId);
    if (error) {
      set({ loading: false, error: error.message });
      return false;
    }
    set({ loading: false, routines: get().routines.filter((r) => r.id !== routineId) });
    return true;
  },

  async updateRoutine(routineId, input) {
    set({ loading: true, error: null });
    const error = await routinesService.updateRoutine(routineId, input);
    if (error) {
      set({ loading: false, error: error.message });
      return false;
    }
    // Refresh both the list and the open detail so headers stay in sync.
    await get().fetchAll(true);
    await get().fetchDetail(routineId);
    return true;
  },

  async addExercise(routineId, input) {
    set({ loading: true, error: null });
    const orderIndex = get().currentRoutine?.exercises.length ?? 0;
    const error = await routinesService.addRoutineExercise(routineId, input, orderIndex);
    if (error) {
      set({ loading: false, error: error.message });
      return false;
    }
    await get().fetchDetail(routineId);
    return true;
  },

  async createExerciseAndAdd(routineId, input) {
    set({ loading: true, error: null });
    const orderIndex = get().currentRoutine?.exercises.length ?? 0;
    const error = await routinesService.createExerciseAndAddToRoutine(routineId, input, orderIndex);
    if (error) {
      set({ loading: false, error: error.message });
      return false;
    }
    await get().fetchDetail(routineId);
    return true;
  },

  async removeExercise(routineExerciseId) {
    set({ loading: true, error: null });
    const error = await routinesService.removeRoutineExercise(routineExerciseId);
    const routineId = get().currentRoutine?.id;
    if (error) {
      set({ loading: false, error: error.message });
      return false;
    }
    if (routineId) await get().fetchDetail(routineId);
    else set({ loading: false });
    return true;
  },

  async updateExercise(routineExerciseId, input) {
    set({ loading: true, error: null });
    const error = await routinesService.updateRoutineExercise(routineExerciseId, input);
    const routineId = get().currentRoutine?.id;
    if (error) {
      set({ loading: false, error: error.message });
      return false;
    }
    if (routineId) await get().fetchDetail(routineId);
    else set({ loading: false });
    return true;
  },

  async addSet(routineExerciseId, input) {
    set({ loading: true, error: null });
    const error = await routinesService.addRoutineExerciseSet(routineExerciseId, input);
    const routineId = get().currentRoutine?.id;
    if (error) {
      set({ loading: false, error: error.message });
      return false;
    }
    if (routineId) await get().fetchDetail(routineId);
    else set({ loading: false });
    return true;
  },

  async removeSet(setId) {
    set({ loading: true, error: null });
    const error = await routinesService.removeRoutineExerciseSet(setId);
    const routineId = get().currentRoutine?.id;
    if (error) {
      set({ loading: false, error: error.message });
      return false;
    }
    if (routineId) await get().fetchDetail(routineId);
    else set({ loading: false });
    return true;
  },

  async updateSet(setId, input) {
    set({ loading: true, error: null });
    const error = await routinesService.updateRoutineExerciseSet(setId, input);
    const routineId = get().currentRoutine?.id;
    if (error) {
      set({ loading: false, error: error.message });
      return false;
    }
    if (routineId) await get().fetchDetail(routineId);
    else set({ loading: false });
    return true;
  },

  clearError() {
    set({ error: null });
  },
}));
