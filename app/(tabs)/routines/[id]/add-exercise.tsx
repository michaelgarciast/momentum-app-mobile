import { router, useLocalSearchParams } from "expo-router";
import { Check, Dumbbell } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { useExercisesStore } from "@/features/exercises/store/exercises.store";
import {
  createExerciseAndAddSchema,
  routineExerciseSchema,
} from "@/features/routines/schema/schemas";
import { useRoutinesStore } from "@/features/routines/store/routines.store";
import {
  Button,
  ChipSelector,
  EmptyState,
  ErrorBanner,
  Input,
  ScreenHeader,
  ScreenLayout,
  Segmented,
} from "@/shared/components";

const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

const MUSCLE_GROUPS = [
  "Pecho",
  "Espalda",
  "Hombros",
  "Bíceps",
  "Tríceps",
  "Trapecio",
  "Abdominales",
  "Cuádriceps",
  "Isquiotibiales",
  "Glúteos",
  "Pantorrillas",
  "Antebrazos",
] as const;

type Mode = "existing" | "new";

export default function AddExerciseScreen() {
  const { id: routineId } = useLocalSearchParams<{ id: string }>();
  const { exercises, fetchAll } = useExercisesStore();
  const { loading, error, addExercise, createExerciseAndAdd } =
    useRoutinesStore();

  const [mode, setMode] = useState<Mode>("new");
  const [exerciseId, setExerciseId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState<string | null>(null);
  const [equipment, setEquipment] = useState("");
  const [exerciseNotes, setExerciseNotes] = useState("");

  const [frequencyDays, setFrequencyDays] = useState<number[]>([]);
  const [defaultRestSeconds, setDefaultRestSeconds] = useState("60");
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  function toggleDay(day: number) {
    setFrequencyDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day].sort((a, b) => a - b),
    );
  }

  async function handleSubmit() {
    if (mode === "existing") {
      const result = routineExerciseSchema.safeParse({
        exerciseId,
        frequencyDays,
        defaultRestSeconds: Number(defaultRestSeconds) || 0,
      });
      if (!result.success) {
        setFieldError(result.error.issues[0]?.message ?? "Datos inválidos");
        return;
      }
      setFieldError(null);
      const ok = await addExercise(routineId, result.data);
      if (ok) router.back();
      return;
    }

    const result = createExerciseAndAddSchema.safeParse({
      name,
      muscleGroup,
      equipment,
      exerciseNotes,
      frequencyDays,
      defaultRestSeconds: Number(defaultRestSeconds) || 0,
    });
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }
    setFieldError(null);
    const ok = await createExerciseAndAdd(routineId, result.data);
    if (ok) router.back();
  }

  const canSubmit =
    mode === "existing" ? exerciseId !== null : name.trim().length >= 2;

  return (
    <ScreenLayout
      header={
        <ScreenHeader title="Agregar ejercicio" onBack={() => router.back()} />
      }
    >
      <View className="gap-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <Segmented<Mode>
          options={[
            { value: "new", label: "Nuevo" },
            { value: "existing", label: "Existente" },
          ]}
          value={mode}
          onChange={(m) => {
            setMode(m);
            setFieldError(null);
          }}
        />

        {mode === "new" ? (
          <View className="gap-4">
            <Input
              label="Nombre del ejercicio"
              value={name}
              onChangeText={setName}
              placeholder="Press banca"
            />
            <ChipSelector
              label="Grupo muscular"
              options={MUSCLE_GROUPS}
              value={muscleGroup}
              onChange={setMuscleGroup}
            />
            <Input
              label="Equipo"
              value={equipment}
              onChangeText={setEquipment}
              placeholder="Barra, mancuernas..."
            />
            <Input
              label="Notas del ejercicio"
              value={exerciseNotes}
              onChangeText={setExerciseNotes}
              placeholder="Opcional"
              multiline
              numberOfLines={2}
            />
          </View>
        ) : (
          <View>
            <Text className="mb-2 text-sm font-medium text-gray-700">
              Ejercicio
            </Text>
            <View className="gap-2">
              {exercises.map((exercise) => {
                const selected = exerciseId === exercise.id;
                return (
                  <Pressable
                    key={exercise.id}
                    onPress={() => setExerciseId(exercise.id)}
                    className={`flex-row items-center rounded-xl border px-4 py-3 ${
                      selected
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 bg-gray-50/50"
                    }`}
                  >
                    <View
                      className={`h-9 w-9 items-center justify-center rounded-lg ${
                        selected ? "bg-indigo-600" : "bg-gray-100"
                      }`}
                    >
                      <Dumbbell
                        size={16}
                        color={selected ? "#ffffff" : "#9ca3af"}
                        strokeWidth={2}
                      />
                    </View>
                    <Text
                      className={`ml-3 flex-1 font-medium ${
                        selected ? "text-indigo-900" : "text-gray-900"
                      }`}
                    >
                      {exercise.name}
                    </Text>
                    {selected ? (
                      <Check size={18} color="#4f46e5" strokeWidth={2.5} />
                    ) : null}
                  </Pressable>
                );
              })}
              {exercises.length === 0 ? (
                <EmptyState
                  icon={Dumbbell}
                  title="Sin ejercicios creados"
                  subtitle="Crea un ejercicio nuevo usando la pestaña de arriba."
                />
              ) : null}
            </View>
          </View>
        )}

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

        {(fieldError ?? error) ? (
          <ErrorBanner message={(fieldError ?? error)!} />
        ) : null}

        <Button
          label={mode === "new" ? "Crear y agregar" : "Agregar a la rutina"}
          onPress={handleSubmit}
          loading={loading}
          disabled={!canSubmit}
        />
      </View>
    </ScreenLayout>
  );
}
