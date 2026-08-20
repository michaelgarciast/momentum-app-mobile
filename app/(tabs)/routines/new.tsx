import { router } from "expo-router";
import { ListChecks } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";

import { routineSchema } from "@/features/routines/schema/schemas";
import { useRoutinesStore } from "@/features/routines/store/routines.store";
import { Button, ErrorBanner, Input, ScreenHeader, ScreenLayout } from "@/shared/components";

export default function NewRoutineScreen() {
  const { loading, error, createRoutine } = useRoutinesStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  async function handleSubmit() {
    const result = routineSchema.safeParse({ name, description });
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }
    setFieldError(null);
    const id = await createRoutine(result.data);
    if (id) router.replace(`/(tabs)/routines/${id}`);
  }

  return (
    <ScreenLayout
      header={
        <ScreenHeader title="Nueva rutina" onBack={() => router.back()} />
      }
    >
      <View className="mt-6 gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <View className="mb-1 flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
            <ListChecks size={22} color="#4f46e5" strokeWidth={2} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">
              Crea tu rutina
            </Text>
            <Text className="text-sm text-gray-500">
              Después podrás agregar ejercicios y series.
            </Text>
          </View>
        </View>

        <Input
          label="Nombre"
          value={name}
          onChangeText={setName}
          placeholder="Push day"
        />
        <Input
          label="Descripción"
          value={description}
          onChangeText={setDescription}
          placeholder="Opcional"
        />

        {(fieldError ?? error) ? (
          <ErrorBanner message={(fieldError ?? error)!} />
        ) : null}

        <Button label="Crear rutina" onPress={handleSubmit} loading={loading} />
      </View>
    </ScreenLayout>
  );
}
