import { router, useLocalSearchParams } from "expo-router";
import { Dumbbell } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { exerciseSchema } from "@/features/exercises/schema/schemas";
import { useExercisesStore } from "@/features/exercises/store/exercises.store";
import {
  Button,
  ChipSelector,
  ErrorBanner,
  Input,
  ScreenHeader,
  ScreenLayout,
} from "@/shared/components";

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

export default function ExerciseFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === "new";

  const { exercises, loading, error, create, update, clearError } =
    useExercisesStore();
  const existing = !isNew ? exercises.find((e) => e.id === id) : undefined;

  const [name, setName] = useState(existing?.name ?? "");
  const [muscleGroup, setMuscleGroup] = useState<string | null>(
    existing?.muscleGroup ?? null,
  );
  const [equipment, setEquipment] = useState(existing?.equipment ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => clearError, [clearError]);

  async function handleSubmit() {
    const result = exerciseSchema.safeParse({
      name,
      muscleGroup,
      equipment,
      notes,
    });
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }
    setFieldError(null);
    const ok = isNew
      ? await create(result.data)
      : await update(id, result.data);
    if (ok) router.back();
  }

  return (
    <ScreenLayout
      header={
        <ScreenHeader
          title={isNew ? "Nuevo ejercicio" : "Editar ejercicio"}
          onBack={() => router.back()}
        />
      }
    >
      <View className="mt-6 gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <View className="mb-1 flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
            <Dumbbell size={22} color="#4f46e5" strokeWidth={2} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">
              {isNew ? "Detalles del ejercicio" : "Actualiza la información"}
            </Text>
            <Text className="text-sm text-gray-500">
              Los ejercicios se usan dentro de tus rutinas.
            </Text>
          </View>
        </View>

        <Input
          label="Nombre"
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
          label="Notas"
          value={notes}
          onChangeText={setNotes}
          placeholder="Opcional"
          multiline
          numberOfLines={3}
        />

        {(fieldError ?? error) ? (
          <ErrorBanner message={(fieldError ?? error)!} />
        ) : null}

        <Button label="Guardar" onPress={handleSubmit} loading={loading} />
      </View>
    </ScreenLayout>
  );
}
