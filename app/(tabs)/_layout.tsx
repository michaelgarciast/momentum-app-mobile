import { LinearGradient } from "expo-linear-gradient";
import { Redirect, Tabs } from "expo-router";
import {
  Dumbbell,
  Home,
  ListChecks,
  Settings,
  type LucideIcon,
} from "lucide-react-native";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Platform,
  type ColorValue,
  View,
} from "react-native";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { useProfileStore } from "@/features/profiles/store/profiles.store";

type TabIconProps = Readonly<{
  icon: LucideIcon;
  color: ColorValue;
  size: number;
  focused: boolean;
}>;

function TabIcon({ icon: Icon, color, size, focused }: TabIconProps) {
  if (focused) {
    return (
      <LinearGradient
        colors={["#4f46e5", "#7c3aed"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="h-10 w-10 items-center justify-center rounded-2xl"
      >
        <Icon color="#ffffff" size={size} strokeWidth={2.5} />
      </LinearGradient>
    );
  }
  return <Icon color={color as string} size={size} strokeWidth={1.8} />;
}

function renderHomeTabIcon({
  color,
  size,
  focused,
}: {
  color: ColorValue;
  size: number;
  focused: boolean;
}) {
  return <TabIcon icon={Home} color={color} size={size} focused={focused} />;
}

function renderExercisesTabIcon({
  color,
  size,
  focused,
}: {
  color: ColorValue;
  size: number;
  focused: boolean;
}) {
  return <TabIcon icon={Dumbbell} color={color} size={size} focused={focused} />;
}

function renderRoutinesTabIcon({
  color,
  size,
  focused,
}: {
  color: ColorValue;
  size: number;
  focused: boolean;
}) {
  return <TabIcon icon={ListChecks} color={color} size={size} focused={focused} />;
}

function renderSettingsTabIcon({
  color,
  size,
  focused,
}: {
  color: ColorValue;
  size: number;
  focused: boolean;
}) {
  return <TabIcon icon={Settings} color={color} size={size} focused={focused} />;
}

export default function TabsLayout() {
  const { session, initialized } = useAuthStore();
  const loadProfile = useProfileStore((s) => s.load);

  useEffect(() => {
    if (session) loadProfile();
  }, [session, loadProfile]);

  if (!initialized) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/welcome" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#4f46e5",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: 4,
        },
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 0,
          elevation: 15,
          height: Platform.OS === "ios" ? 92 : 70,
          paddingBottom: Platform.OS === "ios" ? 24 : 10,
          paddingTop: 8,
          boxShadow: "0 -4px 16px rgba(79, 70, 229, 0.12)",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: renderHomeTabIcon,
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: "Ejercicios",
          tabBarIcon: renderExercisesTabIcon,
        }}
      />
      <Tabs.Screen
        name="routines"
        options={{
          title: "Rutinas",
          tabBarIcon: renderRoutinesTabIcon,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Ajustes",
          tabBarIcon: renderSettingsTabIcon,
        }}
      />
    </Tabs>
  );
}
