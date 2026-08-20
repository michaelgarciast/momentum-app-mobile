import { Pressable, Text, View } from "react-native";

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  return (
    <View className="flex-row overflow-hidden rounded-xl border border-gray-200 bg-gray-50/50">
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={`flex-1 items-center py-3.5 ${
              selected ? "bg-indigo-600" : "active:bg-gray-100"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                selected ? "text-white" : "text-gray-600"
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
