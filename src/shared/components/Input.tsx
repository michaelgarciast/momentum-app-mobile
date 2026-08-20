import { Eye, EyeOff, type LucideIcon } from "lucide-react-native";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  type TextInputProps,
} from "react-native";

type InputProps = TextInputProps & {
  label: string;
  icon?: LucideIcon;
};

export function Input({
  label,
  icon: Icon,
  secureTextEntry,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = secureTextEntry === true;
  const effectiveSecure = isPassword && !showPassword;

  return (
    <View>
      <Text className="mb-1.5 text-sm font-medium text-gray-700">{label}</Text>
      <View
        className={`flex-row items-center rounded-xl border px-4 ${
          isFocused
            ? "border-indigo-500 bg-indigo-50/30"
            : "border-gray-200 bg-gray-50/50"
        }`}
      >
        {Icon ? (
          <Icon
            size={20}
            color={isFocused ? "#6366f1" : "#9ca3af"}
            strokeWidth={2}
          />
        ) : null}
        <TextInput
          className={`flex-1 py-3.5 text-base text-gray-900 ${Icon ? "ml-3" : ""}`}
          placeholderTextColor="#9ca3af"
          secureTextEntry={effectiveSecure}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            hitSlop={8}
            className="ml-2 p-1"
          >
            {showPassword ? (
              <EyeOff size={20} color="#9ca3af" strokeWidth={2} />
            ) : (
              <Eye size={20} color="#9ca3af" strokeWidth={2} />
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
