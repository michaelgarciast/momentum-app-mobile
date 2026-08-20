import { router } from "expo-router";
import { ChevronLeft, ChevronRight, ClipboardList, Plus, Trash2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, RefreshControl, Text, View } from "react-native";

import { listRoutineStats } from "@/features/routines/services/routines.service";
import { useRoutinesStore } from "@/features/routines/store/routines.store";
import type { RoutineStats, RoutineSummary } from "@/features/routines/types/routine";
import { Button, EmptyState, ErrorBanner, ScreenLayout } from "@/shared/components";
import { confirmDelete } from "@/shared/lib/confirm";

const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

type RoutineListItemProps = Readonly<{
  item: RoutineSummary;
  stats?: RoutineStats;
  onDelete: (id: string) => void;
}>;

function RoutineListItem({ item, stats, onDelete }: RoutineListItemProps) {
  const freqDays = stats?.frequencyDays ?? [];
  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/routines/${item.id}`)}
      className="mb-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm active:opacity-70"
    >
      <View className="flex-row items-center">
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-indigo-50">
          <ClipboardList size={20} color="#4f46e5" strokeWidth={2} />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-base font-semibold text-gray-900">
            {item.name}
          </Text>
          <Text className="mt-0.5 text-sm text-gray-500">
            {stats?.exerciseCount ?? 0} ejercicios · {stats?.setCount ?? 0} series
          </Text>
        </View>
        <Pressable
          onPress={() =>
            confirmDelete({
              title: "Eliminar rutina",
              message: `¿Seguro que quieres eliminar "${item.name}"? Se borrarán también sus ejercicios y series.`,
              onConfirm: () => onDelete(item.id),
            })
          }
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Eliminar ${item.name}`}
          className="rounded-lg border border-gray-200 p-2 active:opacity-70"
        >
          <Trash2 size={15} color="#ef4444" strokeWidth={2} />
        </Pressable>
        <ChevronRight size={18} color="#d1d5db" strokeWidth={2} className="ml-1.5" />
      </View>
      {freqDays.length > 0 ? (
        <View className="mt-3 flex-row gap-1.5">
          {DAY_LABELS.map((label, index) => {
            const day = index + 1;
            const active = freqDays.includes(day);
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
    </Pressable>
  );
}

export default function RoutinesScreen() {
  const { routines, loading, error, fetchAll, deleteRoutine } =
    useRoutinesStore();
  const [statsByRoutine, setStatsByRoutine] = useState<Record<string, RoutineStats>>({});

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    let active = true;
    void listRoutineStats(routines.map((r) => r.id)).then(({ stats, error }) => {
      if (!active || error) return;
      setStatsByRoutine(stats);
    });
    return () => { active = false; };
  }, [routines]);

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
              <Text className="text-2xl font-bold text-gray-900">Rutinas</Text>
              <Text className="mt-0.5 text-sm text-gray-500">
                {routines.length} {routines.length === 1 ? "rutina" : "rutinas"}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push("/(tabs)/routines/new")}
            className="flex-row items-center rounded-xl bg-indigo-600 px-4 py-2.5 shadow-lg shadow-indigo-600/25 active:opacity-80"
          >
            <Plus size={18} color="#ffffff" strokeWidth={2} />
            <Text className="ml-1.5 font-semibold text-white">Nueva</Text>
          </Pressable>
        </View>
      }
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={() => fetchAll(true)} />
      }
    >
      {error ? <ErrorBanner message={error} onRetry={fetchAll} /> : null}
      {routines.map((routine) => (
        <RoutineListItem
          key={routine.id}
          item={routine}
          stats={statsByRoutine[routine.id]}
          onDelete={deleteRoutine}
        />
      ))}
      {!loading && routines.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Aún no tienes rutinas"
          subtitle="Organiza tus ejercicios en rutinas para mantener el momentum."
          action={
            <Button
              label="Crear rutina"
              icon={Plus}
              onPress={() => router.push("/(tabs)/routines/new")}
            />
          }
        />
      ) : null}
    </ScreenLayout>
  );
}
