import { router, useLocalSearchParams } from "expo-router";
import { Pencil } from "lucide-react-native";
import { useState } from "react";
import { Alert, Text, View } from "react-native";

import { routineSchema } from "@/features/routines/schema/schemas";
import { useRoutinesStore } from "@/features/routines/store/routines.store";
import { Button, ErrorBanner, Input, ScreenHeader, ScreenLayout } from "@/shared/components";

export default function EditRoutineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentRoutine, loading, error, updateRoutine, deleteRoutine } =
    useRoutinesStore();

  const [name, setName] = useState(currentRoutine?.name ?? "");
  const [description, setDescription] = useState(
    currentRoutine?.description ?? "",
  );
  const [fieldError, setFieldError] = useState<string | null>(null);

  async function handleSubmit() {
    const result = routineSchema.safeParse({ name, description });
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }
    setFieldError(null);
    const ok = await updateRoutine(id, result.data);
    if (ok) router.back();
  }

  function handleDelete() {
    Alert.alert(
      "Eliminar rutina",
      "¿Seguro que quieres eliminar esta rutina? Se borrarán también sus ejercicios y series.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const ok = await deleteRoutine(id);
            if (ok) router.replace("/(tabs)/routines");
          },
        },
      ],
    );
  }

  return (
    <ScreenLayout
      header={
        <ScreenHeader title="Editar rutina" onBack={() => router.back()} />
      }
    >
      <View className="mt-6 gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <View className="mb-1 flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
            <Pencil size={22} color="#4f46e5" strokeWidth={2} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">
              Información de la rutina
            </Text>
            <Text className="text-sm text-gray-500">
              Actualiza el nombre y la descripción.
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

        <Button
          label="Guardar cambios"
          onPress={handleSubmit}
          loading={loading}
        />
        <Button
          label="Eliminar rutina"
          variant="danger"
          onPress={handleDelete}
          loading={loading}
        />
      </View>
    </ScreenLayout>
  );
}
