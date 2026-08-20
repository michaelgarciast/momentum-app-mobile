import { AlertCircle, RefreshCw } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

type ErrorBannerProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorBanner({ message, onRetry }: Readonly<ErrorBannerProps>) {
  return (
    <View className="mb-3 flex-row items-center gap-2 rounded-xl bg-red-50 px-4 py-3">
      <AlertCircle size={18} color="#ef4444" strokeWidth={2} />
      <Text className="flex-1 text-sm text-red-600">{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} hitSlop={8} className="flex-row items-center gap-1">
          <RefreshCw size={14} color="#ef4444" strokeWidth={2} />
          <Text className="text-sm font-semibold text-red-600">Reintentar</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
