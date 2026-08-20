import { router } from "expo-router";
import { ChevronLeft, Dumbbell, Pencil, Trash2 } from "lucide-react-native";
import { useEffect } from "react";
import { Pressable, RefreshControl, Text, View } from "react-native";

import { useExercisesStore } from "@/features/exercises/store/exercises.store";
import type { Exercise } from "@/features/exercises/types/exercise";
import { EmptyState, ErrorBanner, ScreenLayout } from "@/shared/components";
import { confirmDelete } from "@/shared/lib/confirm";

const MUSCLE_GROUP_COLORS: Record<string, { bg: string; text: string }> = {
  Pecho: { bg: "bg-rose-100", text: "text-rose-700" },
  Espalda: { bg: "bg-blue-100", text: "text-blue-700" },
  Hombros: { bg: "bg-amber-100", text: "text-amber-700" },
  Bíceps: { bg: "bg-purple-100", text: "text-purple-700" },
  Tríceps: { bg: "bg-indigo-100", text: "text-indigo-700" },
  Trapecio: { bg: "bg-teal-100", text: "text-teal-700" },
  Abdominales: { bg: "bg-orange-100", text: "text-orange-700" },
  Cuádriceps: { bg: "bg-emerald-100", text: "text-emerald-700" },
  Isquiotibiales: { bg: "bg-cyan-100", text: "text-cyan-700" },
  Glúteos: { bg: "bg-pink-100", text: "text-pink-700" },
  Pantorrillas: { bg: "bg-lime-100", text: "text-lime-700" },
  Antebrazos: { bg: "bg-sky-100", text: "text-sky-700" },
};

function MuscleGroupChip({ group }: Readonly<{ group: string }>) {
  const colors = MUSCLE_GROUP_COLORS[group] ?? {
    bg: "bg-gray-100",
    text: "text-gray-600",
  };
  return (
    <View className={`rounded-full px-2.5 py-0.5 ${colors.bg}`}>
      <Text className={`text-xs font-semibold ${colors.text}`}>{group}</Text>
    </View>
  );
}

type ExerciseListItemProps = Readonly<{
  item: Exercise;
  onRemove: (id: string) => void;
}>;

function ExerciseListItem({ item, onRemove }: ExerciseListItemProps) {
  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/exercises/${item.id}`)}
      className="mb-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm active:opacity-70"
    >
      <View className="flex-row items-center">
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-indigo-50">
          <Dumbbell size={20} color="#4f46e5" strokeWidth={2} />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-base font-semibold text-gray-900">
            {item.name}
          </Text>
          <View className="mt-1.5 flex-row items-center gap-2">
            {item.muscleGroup ? <MuscleGroupChip group={item.muscleGroup} /> : null}
            {item.equipment ? (
              <Text className="text-xs text-gray-400" numberOfLines={1}>
                {item.equipment}
              </Text>
            ) : null}
          </View>
        </View>
        <Pressable
          onPress={() => router.push(`/(tabs)/exercises/${item.id}`)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Editar ${item.name}`}
          className="rounded-lg border border-gray-200 p-2 active:opacity-70"
        >
          <Pencil size={15} color="#4f46e5" strokeWidth={2} />
        </Pressable>
        <Pressable
          onPress={() =>
            confirmDelete({
              title: "Eliminar ejercicio",
              message: `¿Seguro que quieres eliminar "${item.name}"? Se quitará también de tus rutinas.`,
              onConfirm: () => onRemove(item.id),
            })
          }
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Eliminar ${item.name}`}
          className="ml-1.5 rounded-lg border border-gray-200 p-2 active:opacity-70"
        >
          <Trash2 size={15} color="#ef4444" strokeWidth={2} />
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function ExercisesScreen() {
  const { exercises, loading, error, fetchAll, remove } = useExercisesStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <ScreenLayout
      header={
        <View className="flex-row items-center pb-3">
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
            <Text className="text-2xl font-bold text-gray-900">Ejercicios</Text>
            <Text className="mt-0.5 text-sm text-gray-500">
              {exercises.length} {exercises.length === 1 ? "movimiento" : "movimientos"}
            </Text>
          </View>
        </View>
      }
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={() => fetchAll(true)} />
      }
    >
      {error ? <ErrorBanner message={error} onRetry={fetchAll} /> : null}
      {exercises.map((exercise) => (
        <ExerciseListItem key={exercise.id} item={exercise} onRemove={remove} />
      ))}
      {!loading && exercises.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="Aún no tienes ejercicios"
          subtitle="Los ejercicios se crean dentro de una rutina. Ve a Rutinas y agrega un ejercicio nuevo."
        />
      ) : null}
    </ScreenLayout>
  );
}
