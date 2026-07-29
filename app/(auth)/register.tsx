import { Link, router } from "expo-router";
import { AlertCircle, Lock, Mail, User } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";

import { registerSchema } from "@/features/auth/schema/schemas";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { Input, Button, AuthScreenLayout } from "@/shared/components";

function getPasswordStrength(password: string): {
  level: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const levels = [
    { level: 0, label: "", color: "bg-gray-200" },
    { level: 1, label: "Débil", color: "bg-red-400" },
    { level: 2, label: "Regular", color: "bg-orange-400" },
    { level: 3, label: "Buena", color: "bg-yellow-400" },
    { level: 4, label: "Fuerte", color: "bg-green-500" },
  ];

  return levels[score]!;
}

export default function Register() {
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  function handleInputChange(text: string, setter: (v: string) => void) {
    setter(text);
    if (error) clearError();
    if (fieldError) setFieldError(null);
  }

  const strength = getPasswordStrength(password);

  async function handleSubmit() {
    const result = registerSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }
    setFieldError(null);
    const ok = await register(result.data);
    if (ok) router.replace("/(tabs)");
  }

  return (
    <AuthScreenLayout
      title="Crea tu cuenta"
      subtitle="Empieza a construir tu momentum"
      onBack={() => router.back()}
      footer={
        <>
          <Text className="text-gray-500">¿Ya tienes cuenta? </Text>
          <Link href="/(auth)/login">
            <Text className="font-semibold text-indigo-600">Ingresa</Text>
          </Link>
        </>
      }
    >
      <Input
        label="Nombre"
        value={name}
        onChangeText={(t) => handleInputChange(t, setName)}
        placeholder="Tu nombre"
        icon={User}
      />

      <Input
        label="Correo"
        value={email}
        onChangeText={(t) => handleInputChange(t, setEmail)}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="tucorreo@ejemplo.com"
        icon={Mail}
      />

      <View>
        <Input
          label="Contraseña"
          value={password}
          onChangeText={(t) => handleInputChange(t, setPassword)}
          secureTextEntry
          placeholder="••••••••"
          icon={Lock}
        />
        {password.length > 0 ? (
          <View className="mt-2">
            <View className="h-1.5 flex-row gap-1">
              {[1, 2, 3, 4].map((bar) => (
                <View
                  key={bar}
                  className={`h-full flex-1 rounded-full ${
                    bar <= strength.level ? strength.color : "bg-gray-200"
                  }`}
                />
              ))}
            </View>
            <Text className="mt-1 text-xs text-gray-500">{strength.label}</Text>
          </View>
        ) : null}
      </View>

      <Input
        label="Confirmar contraseña"
        value={confirmPassword}
        onChangeText={(t) => handleInputChange(t, setConfirmPassword)}
        secureTextEntry
        placeholder="••••••••"
        icon={Lock}
      />

      {(fieldError ?? error) ? (
        <View className="flex-row items-center gap-2 rounded-xl bg-red-50 px-4 py-3">
          <AlertCircle size={18} color="#ef4444" strokeWidth={2} />
          <Text className="flex-1 text-sm text-red-600">
            {fieldError ?? error}
          </Text>
        </View>
      ) : null}

      <Button
        label="Crear cuenta"
        onPress={handleSubmit}
        loading={loading}
      />
    </AuthScreenLayout>
  );
}
