import { router, useLocalSearchParams } from "expo-router";
import { Dumbbell } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { routineExerciseUpdateSchema } from "@/features/routines/schema/schemas";
import { useRoutinesStore } from "@/features/routines/store/routines.store";
import { Button, ErrorBanner, Input, ScreenHeader, ScreenLayout } from "@/shared/components";

const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

export default function EditRoutineExerciseScreen() {
  const { routineExerciseId } = useLocalSearchParams<{
    id: string;
    routineExerciseId: string;
  }>();
  const { currentRoutine, loading, error, updateExercise } = useRoutinesStore();

  const routineExercise = currentRoutine?.exercises.find(
    (e) => e.id === routineExerciseId,
  );

  const [frequencyDays, setFrequencyDays] = useState<number[]>(
    routineExercise?.frequencyDays ?? [],
  );
  const [defaultRestSeconds, setDefaultRestSeconds] = useState(
    String(routineExercise?.defaultRestSeconds ?? 60),
  );
  const [notes, setNotes] = useState(routineExercise?.notes ?? "");
  const [fieldError, setFieldError] = useState<string | null>(null);

  function toggleDay(day: number) {
    setFrequencyDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day].sort((a, b) => a - b),
    );
  }

  async function handleSubmit() {
    const result = routineExerciseUpdateSchema.safeParse({
      frequencyDays,
      defaultRestSeconds: Number(defaultRestSeconds) || 0,
      notes: notes || undefined,
    });
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }
    setFieldError(null);
    const ok = await updateExercise(routineExerciseId, result.data);
    if (ok) router.back();
  }

  return (
    <ScreenLayout
      header={
        <ScreenHeader
          title={`Editar · ${routineExercise?.exerciseName ?? "Ejercicio"}`}
          onBack={() => router.back()}
        />
      }
    >
      <View className="mt-6 gap-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50">
            <Dumbbell size={20} color="#4f46e5" strokeWidth={2} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">
              {routineExercise?.exerciseName}
            </Text>
            <Text className="text-sm text-gray-500">
              Ajusta la configuración del ejercicio en esta rutina.
            </Text>
          </View>
        </View>

        <View>
          <Text className="mb-2 text-sm font-medium text-gray-700">
            Frecuencia (días)
          </Text>
          <View className="flex-row gap-2">
            {DAY_LABELS.map((label, index) => {
              const day = index + 1;
              const selected = frequencyDays.includes(day);
              return (
                <Pressable
                  key={day}
                  onPress={() => toggleDay(day)}
                  className={`h-11 flex-1 items-center justify-center rounded-xl ${
                    selected
                      ? "bg-indigo-600 shadow-sm"
                      : "bg-gray-100 active:bg-gray-200"
                  }`}
                >
                  <Text
                    className={
                      selected
                        ? "font-semibold text-white"
                        : "font-medium text-gray-600"
                    }
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Input
          label="Descanso por defecto (segundos)"
          value={defaultRestSeconds}
          onChangeText={setDefaultRestSeconds}
          keyboardType="numeric"
          placeholder="60"
        />

        <Input
          label="Notas (opcional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Notas internas sobre este ejercicio en la rutina"
          multiline
          numberOfLines={3}
        />

        {(fieldError ?? error) ? (
          <ErrorBanner message={(fieldError ?? error)!} />
        ) : null}

        <Button
          label="Guardar cambios"
          onPress={handleSubmit}
          loading={loading}
        />
      </View>
    </ScreenLayout>
  );
}
