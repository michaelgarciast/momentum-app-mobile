import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AuthScreenLayoutProps = {
  readonly title: string;
  readonly subtitle: string;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly showLogo?: boolean;
  readonly onBack?: () => void;
};

export function AuthScreenLayout({
  title,
  subtitle,
  children,
  footer,
  showLogo = false,
  onBack,
}: AuthScreenLayoutProps) {
  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={["#eef2ff", "#ffffff", "#ffffff"]}
        style={{ flex: 1 }}
      >
        {onBack ? (
          <View className="px-5 pt-3">
            <Pressable
              onPress={onBack}
              hitSlop={8}
              className="h-11 w-11 items-center justify-center rounded-full bg-white shadow-md shadow-indigo-600/10 active:scale-95 active:opacity-70"
            >
              <ChevronLeft size={24} color="#4f46e5" strokeWidth={2.5} />
            </Pressable>
          </View>
        ) : null}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <ScrollView
            contentContainerClassName="justify-center px-6 py-10"
            keyboardShouldPersistTaps="handled"
            className="flex-1"
          >
            <View className="w-full max-w-md self-center">
              {showLogo ? (
                <View className="mb-8 items-center">
                  <View className="h-20 w-20 items-center justify-center rounded-3xl bg-indigo-600 shadow-lg shadow-indigo-600/30">
                    <Text className="text-3xl font-bold text-white">M</Text>
                  </View>
                </View>
              ) : null}

              <Text className="text-3xl font-bold text-gray-900">{title}</Text>
              <Text className="mt-1.5 text-base text-gray-500">{subtitle}</Text>

              <View className="mt-8 gap-4">{children}</View>

              {footer ? (
                <View className="mt-8 flex-row justify-center">{footer}</View>
              ) : null}
            </View>
          </ScrollView>

          <View
            className="items-center border-t border-gray-100 px-6 py-4"
            style={{ paddingBottom: 12 }}
          >
            <Text className="text-xs text-gray-400">
              Momentum · Construye hábitos, un día a la vez
            </Text>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}
