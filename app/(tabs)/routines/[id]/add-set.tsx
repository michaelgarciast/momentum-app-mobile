import { router, useLocalSearchParams } from "expo-router";
import { Repeat } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";

import { routineExerciseSetSchema } from "@/features/routines/schema/schemas";
import { useRoutinesStore } from "@/features/routines/store/routines.store";
import type { SetType } from "@/features/routines/types/routine";
import {
  Button,
  ErrorBanner,
  Input,
  ScreenHeader,
  ScreenLayout,
  Segmented,
} from "@/shared/components";
import type { WeightUnit } from "@/shared/lib/units";

export default function AddSetScreen() {
  const { routineExerciseId, setId } = useLocalSearchParams<{
    routineExerciseId: string;
    setId?: string;
  }>();
  const { loading, error, addSet, updateSet, currentRoutine } =
    useRoutinesStore();

  const routineExercise = currentRoutine?.exercises.find(
    (e) => e.id === routineExerciseId,
  );
  const editingSet = routineExercise?.sets.find((s) => s.id === setId) ?? null;
  const isEditMode = Boolean(editingSet);

  const nextSetNumber = (routineExercise?.sets.length ?? 0) + 1;

  const [setType, setSetType] = useState<SetType>(
    editingSet?.setType ?? "effective",
  );
  const [targetReps, setTargetReps] = useState(
    editingSet ? String(editingSet.targetReps) : "",
  );
  const [targetWeight, setTargetWeight] = useState(
    editingSet?.targetWeight != null ? String(editingSet.targetWeight) : "",
  );
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(
    editingSet?.weightUnit ?? "kg",
  );
  const [restSeconds, setRestSeconds] = useState(
    editingSet?.restSeconds != null ? String(editingSet.restSeconds) : "",
  );
  const [fieldError, setFieldError] = useState<string | null>(null);

  async function handleSubmit() {
    const setNumber = editingSet?.setNumber ?? nextSetNumber;
    const result = routineExerciseSetSchema.safeParse({
      setNumber,
      setType,
      targetReps: Number(targetReps),
      targetWeight: targetWeight ? Number(targetWeight) : undefined,
      weightUnit,
      restSeconds: restSeconds ? Number(restSeconds) : undefined,
    });
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }
    setFieldError(null);

    if (isEditMode && editingSet) {
      const ok = await updateSet(editingSet.id, result.data);
      if (ok) router.back();
      return;
    }
    const ok = await addSet(routineExerciseId, result.data);
    if (ok) router.back();
  }

  const title = isEditMode
    ? `Editar serie ${editingSet?.setNumber}`
    : `Serie ${nextSetNumber}`;

  return (
    <ScreenLayout
      header={
        <ScreenHeader
          title={title}
          subtitle={routineExercise?.exerciseName}
          onBack={() => router.back()}
        />
      }
    >
      <View className="mt-6 gap-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50">
            <Repeat size={20} color="#4f46e5" strokeWidth={2} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">
              Configura la serie
            </Text>
            <Text className="text-sm text-gray-500">
              Define repeticiones, peso y descanso.
            </Text>
          </View>
        </View>

        <View>
          <Text className="mb-2 text-sm font-medium text-gray-700">
            Tipo de serie
          </Text>
          <Segmented<SetType>
            options={[
              { value: "approximation", label: "Aproximación" },
              { value: "effective", label: "Efectiva" },
            ]}
            value={setType}
            onChange={setSetType}
          />
        </View>

        <Input
          label="Repeticiones"
          value={targetReps}
          onChangeText={setTargetReps}
          keyboardType="numeric"
          placeholder="10"
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              label="Peso"
              value={targetWeight}
              onChangeText={setTargetWeight}
              keyboardType="numeric"
              placeholder="Opcional"
            />
          </View>
          <View className="w-32">
            <Text className="mb-1.5 text-sm font-medium text-gray-700">
              Unidad
            </Text>
            <Segmented<WeightUnit>
              options={[
                { value: "kg", label: "kg" },
                { value: "lb", label: "lb" },
              ]}
              value={weightUnit}
              onChange={setWeightUnit}
            />
          </View>
        </View>

        <Input
          label="Descanso (segundos, opcional)"
          value={restSeconds}
          onChangeText={setRestSeconds}
          keyboardType="numeric"
          placeholder={`Por defecto: ${routineExercise?.defaultRestSeconds ?? 60}s`}
        />

        {(fieldError ?? error) ? (
          <ErrorBanner message={(fieldError ?? error)!} />
        ) : null}

        <Button
          label={isEditMode ? "Guardar cambios" : "Agregar serie"}
          onPress={handleSubmit}
          loading={loading}
        />
      </View>
    </ScreenLayout>
  );
}
