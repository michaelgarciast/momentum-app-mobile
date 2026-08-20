import { type LucideIcon } from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type PressableProps,
} from "react-native";

type ButtonProps = PressableProps & {
  label: string;
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  icon?: LucideIcon;
};

export function Button({
  label,
  variant = "primary",
  loading = false,
  icon: Icon,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "flex-row items-center justify-center rounded-2xl py-4 active:opacity-80";
  const variants = {
    primary: "bg-indigo-600 shadow-lg shadow-indigo-600/30",
    secondary: "border border-gray-200 bg-white active:opacity-70",
    danger: "border border-red-100 bg-red-50 active:opacity-70",
  };
  const textVariants = {
    primary: "text-white",
    secondary: "text-gray-900",
    danger: "text-red-600",
  };

  const isDisabled = disabled || loading;
  const accentColor =
    variant === "primary"
      ? "#ffffff"
      : variant === "danger"
        ? "#ef4444"
        : "#4f46e5";

  return (
    <Pressable
      disabled={isDisabled}
      className={`${base} ${variants[variant]} ${isDisabled ? "opacity-50" : ""}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={accentColor} />
      ) : (
        <View className="flex-row items-center">
          {Icon ? <Icon size={20} color={accentColor} strokeWidth={2} /> : null}
          <Text
            className={`text-base font-semibold ${textVariants[variant]} ${Icon ? "ml-2" : ""}`}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
