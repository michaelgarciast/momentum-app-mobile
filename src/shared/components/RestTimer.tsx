import { LinearGradient } from "expo-linear-gradient";
import {
  Check,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Timer as TimerIcon,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View, Vibration } from "react-native";

type RestTimerProps = Readonly<{
  restSeconds: number;
}>;

type TimerState = "idle" | "running" | "paused" | "done";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${s.toString().padStart(2, "0")}` : `${s}s`;
}

export function RestTimer({ restSeconds }: RestTimerProps) {
  const [remaining, setRemaining] = useState(restSeconds);
  const [state, setState] = useState<TimerState>("idle");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function clearTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function startTimer() {
    clearTimer();
    setState("running");
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          setState("done");
          Vibration.vibrate([400, 200, 400]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function handleStart() {
    if (remaining === 0) setRemaining(restSeconds);
    startTimer();
  }

  function handlePause() {
    clearTimer();
    setState("paused");
  }

  function handleSkip() {
    clearTimer();
    setState("done");
    setRemaining(0);
    Vibration.vibrate(200);
  }

  function handleReset() {
    clearTimer();
    setState("idle");
    setRemaining(restSeconds);
  }

  const progress = restSeconds > 0 ? remaining / restSeconds : 0;
  const isPaused = state === "paused";
  const accentColor = isPaused ? "#f59e0b" : "#4f46e5";

  if (state === "idle") {
    return (
      <Pressable
        onPress={handleStart}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Iniciar descanso de ${restSeconds} segundos`}
        className="flex-row items-center gap-1.5 self-start rounded-full bg-indigo-50 px-2.5 py-1 active:opacity-70"
      >
        <TimerIcon size={13} color="#4f46e5" strokeWidth={2.5} />
        <Text className="text-xs font-semibold text-indigo-600">
          Descanso {formatTime(restSeconds)}
        </Text>
      </Pressable>
    );
  }

  if (state === "done") {
    return (
      <Pressable
        onPress={handleReset}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Reiniciar descanso"
        className="flex-row items-center gap-1.5 self-start rounded-full bg-emerald-50 px-2.5 py-1 active:opacity-70"
      >
        <View className="h-4 w-4 items-center justify-center rounded-full bg-emerald-500">
          <Check size={10} color="#ffffff" strokeWidth={3} />
        </View>
        <Text className="text-xs font-semibold text-emerald-600">
          ¡Listo! Toca para reiniciar
        </Text>
      </Pressable>
    );
  }

  return (
    <View className="flex-row items-center gap-2">
      <View className="relative h-7 flex-1 overflow-hidden rounded-full bg-gray-100">
        <LinearGradient
          colors={isPaused ? ["#fbbf24", "#f59e0b"] : ["#6366f1", "#4f46e5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${progress * 100}%` }}
        />
        <View className="absolute inset-0 items-center justify-center">
          <Text
            className="text-xs font-bold tabular-nums"
            style={{ color: progress > 0.3 ? "#ffffff" : accentColor }}
          >
            {formatTime(remaining)}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={isPaused ? handleStart : handlePause}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={isPaused ? "Reanudar descanso" : "Pausar descanso"}
        className="h-7 w-7 items-center justify-center rounded-full active:opacity-70"
        style={{ backgroundColor: isPaused ? "#fef3c7" : "#e0e7ff" }}
      >
        {isPaused ? (
          <Play size={14} color="#f59e0b" strokeWidth={2.5} fill="#f59e0b" />
        ) : (
          <Pause size={14} color="#4f46e5" strokeWidth={2.5} fill="#4f46e5" />
        )}
      </Pressable>

      <Pressable
        onPress={handleSkip}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Saltar descanso"
        className="h-7 w-7 items-center justify-center rounded-full bg-gray-100 active:opacity-70"
      >
        <SkipForward size={13} color="#6b7280" strokeWidth={2.5} />
      </Pressable>

      {isPaused ? (
        <Pressable
          onPress={handleReset}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Reiniciar descanso"
          className="h-7 w-7 items-center justify-center rounded-full bg-gray-100 active:opacity-70"
        >
          <RotateCcw size={13} color="#6b7280" strokeWidth={2.5} />
        </Pressable>
      ) : null}
    </View>
  );
}
