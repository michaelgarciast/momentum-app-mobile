import { router } from "expo-router";
import { LogOut, Save } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { updateProfileSchema } from "@/features/profiles/schema/schemas";
import { useProfileStore } from "@/features/profiles/store/profiles.store";
import {
  Button,
  ErrorBanner,
  Input,
  ScreenHeader,
  ScreenLayout,
  Segmented,
} from "@/shared/components";
import type { WeightUnit } from "@/shared/lib/units";

export default function SettingsScreen() {
  const logout = useAuthStore((s) => s.logout);
  const { profile, loading, error, update, reset } = useProfileStore();

  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [preferredWeightUnit, setPreferredWeightUnit] = useState<WeightUnit>(
    profile?.preferredWeightUnit ?? "kg",
  );
  const [profileId, setProfileId] = useState<string | null>(
    profile?.id ?? null,
  );
  const [fieldError, setFieldError] = useState<string | null>(null);

  if (profile && profile.id !== profileId) {
    setProfileId(profile.id);
    setDisplayName(profile.displayName);
    setPreferredWeightUnit(profile.preferredWeightUnit);
  }

  const initials = displayName
    ? displayName
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "M";

  async function handleSave() {
    const result = updateProfileSchema.safeParse({
      displayName,
      preferredWeightUnit,
    });
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }
    setFieldError(null);
    await update(result.data);
  }

  async function handleLogout() {
    const ok = await logout();
    if (ok) {
      reset();
      router.replace("/(auth)/welcome");
    }
  }

  return (
    <ScreenLayout header={<ScreenHeader title="Ajustes" onBack={() => router.back()} />}>
      <View className="mt-4 flex-row items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-indigo-600 shadow-lg shadow-indigo-600/30">
          <Text className="text-xl font-bold text-white">{initials}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900">
            {profile?.displayName ?? "Perfil"}
          </Text>
          <Text className="text-sm text-gray-500">
            Tu información y preferencias
          </Text>
        </View>
      </View>

      <View className="mt-4 gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <Input
          label="Nombre"
          value={displayName}
          onChangeText={setDisplayName}
        />

        <View>
          <Text className="mb-1.5 text-sm font-medium text-gray-700">
            Unidad de peso preferida
          </Text>
          <Segmented<WeightUnit>
            options={[
              { value: "kg", label: "Kilogramos" },
              { value: "lb", label: "Libras" },
            ]}
            value={preferredWeightUnit}
            onChange={setPreferredWeightUnit}
          />
        </View>

        {(fieldError ?? error) ? (
          <ErrorBanner message={(fieldError ?? error)!} />
        ) : null}

        <Button
          label="Guardar cambios"
          icon={Save}
          onPress={handleSave}
          loading={loading}
        />
      </View>

      <View className="mt-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <Button
          label="Cerrar sesión"
          variant="danger"
          icon={LogOut}
          onPress={handleLogout}
        />
      </View>
    </ScreenLayout>
  );
}
