import { ChevronLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onBack?: () => void;
};

export function ScreenHeader({
  title,
  subtitle,
  right,
  onBack,
}: Readonly<ScreenHeaderProps>) {
  return (
    <View className="mt-2 flex-row items-center justify-between">
      <View className="min-w-0 flex-1 flex-row items-center">
        {onBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            className="mr-3 h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm active:opacity-70"
          >
            <ChevronLeft size={22} color="#4f46e5" strokeWidth={2.5} />
          </Pressable>
        ) : null}
        <View className="min-w-0 flex-1">
          <Text className="text-xl font-bold text-gray-900" numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="mt-0.5 text-sm text-gray-500" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {right}
    </View>
  );
}
