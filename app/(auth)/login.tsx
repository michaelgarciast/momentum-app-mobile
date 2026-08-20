import { Link, router } from "expo-router";
import { Lock, Mail } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { loginSchema } from "@/features/auth/schema/schemas";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { Input, Button, AuthScreenLayout, ErrorBanner } from "@/shared/components";

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  function handleEmailChange(text: string) {
    setEmail(text);
    if (error) clearError();
    if (fieldError) setFieldError(null);
  }

  function handlePasswordChange(text: string) {
    setPassword(text);
    if (error) clearError();
    if (fieldError) setFieldError(null);
  }

  async function handleSubmit() {
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }
    setFieldError(null);
    const ok = await login(result.data);
    if (ok) router.replace("/(tabs)");
  }

  return (
    <AuthScreenLayout
      title="Bienvenido de nuevo"
      subtitle="Inicia sesión para continuar"
      onBack={() => router.back()}
      footer={
        <>
          <Text className="text-gray-500">¿No tienes cuenta? </Text>
          <Link href="/(auth)/register">
            <Text className="font-semibold text-indigo-600">Regístrate</Text>
          </Link>
        </>
      }
    >
      <Input
        label="Correo"
        value={email}
        onChangeText={handleEmailChange}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="tucorreo@ejemplo.com"
        icon={Mail}
      />

      <Input
        label="Contraseña"
        value={password}
        onChangeText={handlePasswordChange}
        secureTextEntry
        placeholder="••••••••"
        icon={Lock}
      />

      <View className="-mt-1 flex-row justify-end">
        <Pressable onPress={() => {}}>
          <Text className="text-sm font-medium text-indigo-600">
            ¿Olvidaste tu contraseña?
          </Text>
        </Pressable>
      </View>

      {(fieldError ?? error) ? (
        <ErrorBanner message={(fieldError ?? error)!} />
      ) : null}

      <Button label="Ingresar" onPress={handleSubmit} loading={loading} />
    </AuthScreenLayout>
  );
}
