import "../global.css";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import { cssInterop } from "nativewind";
import { useEffect } from "react";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { ErrorBoundary } from "@/shared/components";

cssInterop(LinearGradient, { className: { target: "style" } });

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ErrorBoundary>
  );
}
