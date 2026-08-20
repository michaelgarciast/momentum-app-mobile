import { type LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { Text, View } from "react-native";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function EmptyState({
  icon: Icon,
  title,
  subtitle,
  action,
}: EmptyStateProps) {
  return (
    <View className="mt-10 items-center px-6">
      <View className="h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50">
        <Icon size={36} color="#6366f1" strokeWidth={1.75} />
      </View>
      <Text className="mt-5 text-lg font-bold text-gray-900">{title}</Text>
      {subtitle ? (
        <Text className="mt-1.5 text-center text-sm text-gray-500">
          {subtitle}
        </Text>
      ) : null}
      {action ? <View className="mt-6 w-full max-w-xs">{action}</View> : null}
    </View>
  );
}
