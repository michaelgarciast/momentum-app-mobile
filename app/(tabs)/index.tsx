import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  CalendarDays,
  ChevronRight,
  Dumbbell,
  Flame,
  Layers,
  ListChecks,
  Plus,
  Sparkles,
  type LucideIcon,
} from "lucide-react-native";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

import { useExercisesStore } from "@/features/exercises/store/exercises.store";
import { useProfileStore } from "@/features/profiles/store/profiles.store";
import { listRoutineStats } from "@/features/routines/services/routines.service";
import { useRoutinesStore } from "@/features/routines/store/routines.store";
import type { RoutineStats } from "@/features/routines/types/routine";
import { ErrorBanner, ScreenLayout } from "@/shared/components";

const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

type DashboardStat = {
  label: string;
  value: number;
  icon: LucideIcon;
  gradient: [string, string];
  iconColor: string;
};

function StatCard({ stat }: Readonly<{ stat: DashboardStat }>) {
  const Icon = stat.icon;
  return (
    <View className="flex-1 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <LinearGradient
        colors={stat.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="h-10 w-10 items-center justify-center rounded-xl"
      >
        <Icon size={20} color="#ffffff" strokeWidth={2.5} />
      </LinearGradient>
      <Text className="mt-3 text-2xl font-bold text-gray-900">
        {stat.value}
      </Text>
      <Text className="mt-0.5 text-sm text-gray-500">{stat.label}</Text>
    </View>
  );
}

function QuickAction({
  label,
  icon: Icon,
  gradient,
  onPress,
}: Readonly<{
  label: string;
  icon: LucideIcon;
  gradient: [string, string];
  onPress: () => void;
}>) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 flex-row items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm active:opacity-70"
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="h-9 w-9 items-center justify-center rounded-xl"
      >
        <Icon size={17} color="#ffffff" strokeWidth={2.5} />
      </LinearGradient>
      <Text className="flex-1 text-sm font-semibold text-gray-900">
        {label}
      </Text>
      <ChevronRight size={16} color="#d1d5db" strokeWidth={2} />
    </Pressable>
  );
}

export default function Home() {
  const { profile } = useProfileStore();
  const {
    routines,
    loading: routinesLoading,
    error: routinesError,
    fetchAll: fetchRoutines,
  } = useRoutinesStore();
  const {
    exercises,
    loading: exercisesLoading,
    error: exercisesError,
    fetchAll: fetchExercises,
  } = useExercisesStore();

  const [statsByRoutine, setStatsByRoutine] = useState<
    Record<string, RoutineStats>
  >({});
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoutines();
    fetchExercises();
  }, [fetchExercises, fetchRoutines]);

  useEffect(() => {
    let active = true;
    void listRoutineStats(routines.map((routine) => routine.id)).then(
      ({ stats, error }) => {
        if (!active) return;
        setStatsByRoutine(stats);
        setStatsError(error?.message ?? null);
      },
    );
    return () => {
      active = false;
    };
  }, [routines]);

  const stats = useMemo(() => {
    const weeklyDays = new Set<number>();
    let totalSets = 0;
    for (const entry of Object.values(statsByRoutine)) {
      entry.frequencyDays.forEach((day) => weeklyDays.add(day));
      totalSets += entry.setCount;
    }
    return { weeklyDays: weeklyDays.size, totalSets };
  }, [statsByRoutine]);

  const todayDayNumber = new Date().getDay() === 0 ? 7 : new Date().getDay();

  const todayRoutines = useMemo(
    () =>
      routines.filter((r) =>
        statsByRoutine[r.id]?.frequencyDays.includes(todayDayNumber),
      ),
    [routines, statsByRoutine, todayDayNumber],
  );

  const statCards: DashboardStat[] = [
    {
      label: "Rutinas activas",
      value: routines.length,
      icon: ListChecks,
      gradient: ["#6366f1", "#4f46e5"],
      iconColor: "#4f46e5",
    },
    {
      label: "Ejercicios",
      value: exercises.length,
      icon: Dumbbell,
      gradient: ["#34d399", "#059669"],
      iconColor: "#059669",
    },
    {
      label: "Días / semana",
      value: stats.weeklyDays,
      icon: CalendarDays,
      gradient: ["#fbbf24", "#d97706"],
      iconColor: "#d97706",
    },
    {
      label: "Series totales",
      value: stats.totalSets,
      icon: Layers,
      gradient: ["#fb7185", "#e11d48"],
      iconColor: "#e11d48",
    },
  ];

  const firstName = profile?.displayName?.split(" ")[0] ?? "Atleta";
  const initials = profile?.displayName
    ? profile.displayName
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "M";

  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const todayLabel = today.charAt(0).toUpperCase() + today.slice(1);

  const refreshing = routinesLoading || exercisesLoading;
  const recentRoutines = routines.slice(0, 3);
  const loadError = routinesError ?? exercisesError ?? statsError;

  function handleRetry() {
    fetchRoutines(true);
    fetchExercises(true);
  }

  const todayRoutineLabel =
    todayRoutines.length === 1 ? "rutina" : "rutinas";
  const todaySummary =
    todayRoutines.length > 0
      ? `Hoy tocan ${todayRoutines.length} ${todayRoutineLabel}`
      : "Día de descanso activo";

  let recentContent: ReactNode;
  if (refreshing && routines.length === 0) {
    recentContent = (
      <View className="items-center py-10">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  } else if (recentRoutines.length > 0) {
    recentContent = recentRoutines.map((routine) => {
      const routineStats = statsByRoutine[routine.id];
      const freqDays = routineStats?.frequencyDays ?? [];
      return (
        <Pressable
          key={routine.id}
          onPress={() => router.push(`/(tabs)/routines/${routine.id}`)}
          className="mb-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm active:opacity-70"
        >
          <View className="flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-xl bg-indigo-50">
              <ListChecks size={20} color="#4f46e5" strokeWidth={2} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-base font-semibold text-gray-900">
                {routine.name}
              </Text>
              <Text className="mt-0.5 text-sm text-gray-500">
                {routineStats?.exerciseCount ?? 0} ejercicios ·{" "}
                {routineStats?.setCount ?? 0} series
              </Text>
            </View>
            <ChevronRight size={18} color="#d1d5db" strokeWidth={2} />
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
    });
  } else {
    recentContent = (
      <Pressable
        onPress={() => router.push("/(tabs)/routines/new")}
        className="items-center rounded-2xl border border-dashed border-indigo-300 bg-indigo-50/50 p-6 active:opacity-70"
      >
        <View className="h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
          <Plus size={22} color="#4f46e5" strokeWidth={2.5} />
        </View>
        <Text className="mt-3 text-sm font-semibold text-indigo-600">
          Crea tu primera rutina
        </Text>
        <Text className="mt-0.5 text-xs text-indigo-400">
          Empieza a planificar tus entrenamientos
        </Text>
      </Pressable>
    );
  }

  return (
    <ScreenLayout
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            fetchRoutines(true);
            fetchExercises(true);
          }}
        />
      }
    >
      <LinearGradient
        colors={["#4f46e5", "#7c3aed"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="mt-4 rounded-3xl px-7 pb-6 pt-6"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <View className="flex-row items-center">
              <CalendarDays size={15} color="#c7d2fe" strokeWidth={2} />
              <Text className="ml-2 text-sm font-medium text-indigo-200">
                {todayLabel}
              </Text>
            </View>
            <View className="mt-3 flex-row items-center">
              <Text className="text-2xl font-bold text-white">
                Hola, {firstName}
              </Text>
              <Sparkles
                size={18}
                color="#fbbf24"
                strokeWidth={2}
                className="ml-2"
              />
            </View>
          </View>
          <View className="h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/20">
            <Text className="text-lg font-bold text-white">{initials}</Text>
          </View>
        </View>

        <View className="mt-4 flex-row items-center gap-2 rounded-2xl bg-white/15 px-4 py-3">
          <Flame size={18} color="#fbbf24" strokeWidth={2.5} />
          <Text className="flex-1 text-sm font-medium text-indigo-50">
            {todaySummary}
          </Text>
          {todayRoutines.length > 0 ? (
            <Pressable
              onPress={() =>
                router.push(`/(tabs)/routines/${todayRoutines[0]!.id}`)
              }
              hitSlop={8}
            >
              <Text className="text-sm font-bold text-white">Empezar</Text>
            </Pressable>
          ) : null}
        </View>
      </LinearGradient>

      <View className="mt-6 flex-row gap-3">
        {statCards.slice(0, 2).map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </View>
      <View className="mt-3 flex-row gap-3">
        {statCards.slice(2).map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </View>

      <Text className="mb-3 mt-6 text-lg font-bold text-gray-900">
        Acciones rápidas
      </Text>
      <View className="flex-row gap-3">
        <QuickAction
          label="Nueva rutina"
          icon={Plus}
          gradient={["#6366f1", "#4f46e5"]}
          onPress={() => router.push("/(tabs)/routines/new")}
        />
        <QuickAction
          label="Ver ejercicios"
          icon={Dumbbell}
          gradient={["#34d399", "#059669"]}
          onPress={() => router.push("/(tabs)/exercises")}
        />
      </View>

      <View className="mb-3 mt-6 flex-row items-center justify-between">
        <Text className="text-lg font-bold text-gray-900">Mis rutinas</Text>
        {routines.length > 0 ? (
          <Pressable
            onPress={() => router.push("/(tabs)/routines")}
            hitSlop={8}
            className="flex-row items-center"
          >
            <Text className="text-sm font-semibold text-indigo-600">
              Ver todas
            </Text>
            <ChevronRight size={16} color="#4f46e5" strokeWidth={2} />
          </Pressable>
        ) : null}
      </View>

      {loadError ? <ErrorBanner message={loadError} onRetry={handleRetry} /> : null}

      {recentContent}
    </ScreenLayout>
  );
}
