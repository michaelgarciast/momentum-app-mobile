import { router } from "expo-router";
import { Text, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuthStore } from "@/features/auth/store/auth.store";

export default function Home() {
  const logout = useAuthStore((s) => s.logout);

  async function handleLogout() {
    const ok = await logout();
    if (ok) router.replace("/(auth)/welcome");
  }

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white px-6">
      <View className="w-full max-w-md items-center">
        <Text className="text-2xl font-bold text-gray-900">
          ¡Bienvenido a Momentum!
        </Text>
        <Pressable
          onPress={handleLogout}
          className="mt-8 rounded-xl border border-gray-300 px-6 py-3 active:opacity-70"
        >
          <Text className="text-base font-semibold text-gray-900">
            Cerrar sesión
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
