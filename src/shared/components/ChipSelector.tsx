import { Pressable, Text, View } from "react-native";

type ChipSelectorProps = Readonly<{
  options: readonly string[];
  value: string | null;
  onChange: (value: string | null) => void;
  label?: string;
}>;

export function ChipSelector({
  options,
  value,
  onChange,
  label,
}: ChipSelectorProps) {
  return (
    <View>
      {label ? (
        <Text className="mb-2 text-sm font-semibold text-gray-700">
          {label}
        </Text>
      ) : null}
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(selected ? null : option)}
              hitSlop={4}
              accessibilityRole="button"
              accessibilityLabel={option}
              accessibilityState={{ selected }}
              className={`rounded-full px-3.5 py-2 active:opacity-70 ${
                selected
                  ? "bg-indigo-600"
                  : "border border-gray-200 bg-white"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selected ? "text-white" : "text-gray-600"
                }`}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
