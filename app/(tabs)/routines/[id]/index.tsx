import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Dumbbell,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react-native";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";

import { useProfileStore } from "@/features/profiles/store/profiles.store";
import { useRoutinesStore } from "@/features/routines/store/routines.store";
import type {
  RoutineExerciseDetail,
  RoutineExerciseSet,
} from "@/features/routines/types/routine";
import { Button, EmptyState, ErrorBanner, RestTimer, ScreenLayout } from "@/shared/components";
import { confirmDelete } from "@/shared/lib/confirm";
import { formatWeight, type WeightUnit } from "@/shared/lib/units";

const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];
const SET_TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  approximation: { bg: "bg-amber-100", text: "text-amber-700", label: "Aprox." },
  effective: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Efectiva" },
};

function formatSetWeight(
  set: RoutineExerciseSet,
  preferred: WeightUnit,
): string {
  if (set.targetWeight == null) return "";
  const formatted = formatWeight(set.targetWeight, set.weightUnit, preferred);
  return set.weightUnit === preferred
    ? ` · ${formatted}`
    : ` · ${formatted} (${set.targetWeight} ${set.weightUnit})`;
}

type RoutineExerciseCardProps = Readonly<{
  routineId: string;
  item: RoutineExerciseDetail;
  preferredWeightUnit: WeightUnit;
  onRemoveExercise: (id: string) => void;
  onRemoveSet: (id: string) => void;
}>;

function RoutineExerciseCard({
  routineId,
  item,
  preferredWeightUnit,
  onRemoveExercise,
  onRemoveSet,
}: RoutineExerciseCardProps) {
  return (
    <View className="mb-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <View className="flex-row items-center">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
          <Dumbbell size={18} color="#4f46e5" strokeWidth={2} />
        </View>
        <Text className="ml-3 flex-1 text-base font-semibold text-gray-900">
          {item.exerciseName}
        </Text>
        <View className="flex-row items-center gap-1">
          <Pressable
            onPress={() =>
              router.push(
                `/(tabs)/routines/${routineId}/edit-exercise?routineExerciseId=${item.id}`,
              )
            }
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Editar ${item.exerciseName}`}
            className="rounded-lg border border-gray-200 p-2 active:opacity-70"
          >
            <Pencil size={14} color="#4f46e5" strokeWidth={2} />
          </Pressable>
          <Pressable
            onPress={() => onRemoveExercise(item.id)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Quitar ${item.exerciseName} de la rutina`}
            className="rounded-lg border border-gray-200 p-2 active:opacity-70"
          >
            <Trash2 size={15} color="#ef4444" strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      {item.frequencyDays.length > 0 ? (
        <View className="mt-3 flex-row gap-1.5">
          {DAY_LABELS.map((label, index) => {
            const day = index + 1;
            const active = item.frequencyDays.includes(day);
            return (
              <View
                key={day}
                className={`h-6 w-6 items-center justify-center rounded-full ${
                  active ? "bg-indigo-600" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    active ? "text-white" : "text-gray-400"
                  }`}
                >
                  {label}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      <View className="mt-3 gap-2">
        {item.sets.map((set) => {
          const typeStyle = SET_TYPE_STYLES[set.setType] ?? {
            bg: "bg-gray-100",
            text: "text-gray-600",
            label: set.setType,
          };
          return (
          <View
            key={set.id}
            className="flex-row items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5"
          >
            <Pressable
              onPress={() =>
                router.push(
                  `/(tabs)/routines/${routineId}/add-set?routineExerciseId=${item.id}&setId=${set.id}`,
                )
              }
              className="flex-1"
            >
              <View className="flex-row items-center gap-2">
                <View className="h-6 w-6 items-center justify-center rounded-full bg-indigo-600">
                  <Text className="text-xs font-bold text-white">
                    {set.setNumber}
                  </Text>
                </View>
                <View className={`rounded-full px-2 py-0.5 ${typeStyle.bg}`}>
                  <Text className={`text-xs font-semibold ${typeStyle.text}`}>
                    {typeStyle.label}
                  </Text>
                </View>
                <Text className="flex-1 text-sm text-gray-700">
                  {set.targetReps} reps{formatSetWeight(set, preferredWeightUnit)}
                </Text>
              </View>
              <View className="ml-8 mt-1">
                <RestTimer restSeconds={set.restSeconds ?? item.defaultRestSeconds} />
              </View>
            </Pressable>
            <Pressable
              onPress={() => onRemoveSet(set.id)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Eliminar serie ${set.setNumber}`}
              className="ml-2 p-1"
            >
              <Trash2 size={14} color="#9ca3af" strokeWidth={2} />
            </Pressable>
          </View>
          );
        })}
        {item.sets.length === 0 ? (
          <Text className="text-sm text-gray-400">Sin series definidas</Text>
        ) : null}
      </View>

      <Pressable
        onPress={() =>
          router.push(
            `/(tabs)/routines/${routineId}/add-set?routineExerciseId=${item.id}`,
          )
        }
        className="mt-3 flex-row items-center justify-center gap-1.5 rounded-xl border border-dashed border-indigo-300 py-2.5 active:opacity-70"
      >
        <Plus size={16} color="#4f46e5" strokeWidth={2} />
        <Text className="text-sm font-semibold text-indigo-600">
          Agregar serie
        </Text>
      </Pressable>
    </View>
  );
}

export default function RoutineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentRoutine, loading, error, fetchDetail, removeExercise, removeSet } =
    useRoutinesStore();
  const profile = useProfileStore((state) => state.profile);
  const preferredWeightUnit: WeightUnit = profile?.preferredWeightUnit ?? "kg";

  useEffect(() => {
    if (id) fetchDetail(id);
  }, [id, fetchDetail]);

  const totalSets =
    currentRoutine?.exercises.reduce((sum, ex) => sum + ex.sets.length, 0) ?? 0;

  function handleRemoveExercise(exerciseId: string, name: string) {
    confirmDelete({
      title: "Eliminar ejercicio",
      message: `¿Quitar "${name}" de la rutina? Se borrarán también sus series.`,
      onConfirm: () => removeExercise(exerciseId),
    });
  }

  function handleRemoveSet(setId: string) {
    confirmDelete({
      title: "Eliminar serie",
      message: "¿Seguro que quieres eliminar esta serie?",
      onConfirm: () => removeSet(setId),
    });
  }

  return (
    <ScreenLayout
      header={
        <View className="flex-row items-center justify-between pb-3">
          <View className="min-w-0 flex-1 flex-row items-center">
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Volver"
              className="mr-3 h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm active:opacity-70"
            >
              <ChevronLeft size={22} color="#4f46e5" strokeWidth={2.5} />
            </Pressable>
            <View className="min-w-0 flex-1">
              <Text
                className="text-xl font-bold text-gray-900"
                numberOfLines={1}
              >
                {currentRoutine?.name ?? "Rutina"}
              </Text>
              <Text className="mt-0.5 text-sm text-gray-500">
                {currentRoutine?.exercises.length ?? 0} ejercicios · {totalSets}{" "}
                series
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => router.push(`/(tabs)/routines/${id}/edit`)}
              accessibilityRole="button"
              accessibilityLabel="Editar rutina"
              className="rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm active:opacity-70"
              hitSlop={8}
            >
              <Pencil size={18} color="#4f46e5" strokeWidth={2} />
            </Pressable>
            <Pressable
              onPress={() => router.push(`/(tabs)/routines/${id}/add-exercise`)}
              className="flex-row items-center rounded-xl bg-indigo-600 px-3.5 py-2.5 shadow-lg shadow-indigo-600/25 active:opacity-80"
            >
              <Plus size={16} color="#ffffff" strokeWidth={2} />
              <Text className="ml-1.5 font-semibold text-white">Ejercicio</Text>
            </Pressable>
          </View>
        </View>
      }
    >
      {error ? (
        <ErrorBanner message={error} onRetry={() => fetchDetail(id)} />
      ) : null}
      {currentRoutine?.exercises.map((item) => (
        <RoutineExerciseCard
          key={item.id}
          routineId={id}
          item={item}
          preferredWeightUnit={preferredWeightUnit}
          onRemoveExercise={(exerciseId) =>
            handleRemoveExercise(exerciseId, item.exerciseName)
          }
          onRemoveSet={handleRemoveSet}
        />
      ))}
      {!loading && currentRoutine?.exercises.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="Esta rutina está vacía"
          subtitle="Agrega ejercicios y define series para empezar a entrenar."
          action={
            <Button
              label="Agregar ejercicio"
              icon={Plus}
              onPress={() => router.push(`/(tabs)/routines/${id}/add-exercise`)}
            />
          }
        />
      ) : null}
    </ScreenLayout>
  );
}
