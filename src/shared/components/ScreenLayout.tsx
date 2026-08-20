import type { ReactElement, ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type RefreshControlProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenLayoutProps = {
  children: ReactNode;
  header?: ReactNode;
  scroll?: boolean;
  refreshControl?: ReactElement<RefreshControlProps>;
  bg?: string;
  maxWidthClassName?: string;
};

export function ScreenLayout({
  children,
  header,
  scroll = true,
  refreshControl,
  bg = "bg-gray-50",
  maxWidthClassName = "max-w-3xl",
}: Readonly<ScreenLayoutProps>) {
  const centered = (
    <View className={`w-full ${maxWidthClassName} self-center px-4`}>
      {children}
    </View>
  );

  return (
    <SafeAreaView className={`flex-1 ${bg}`}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {header ? (
          <View className="w-full items-center">
            <View className={`w-full ${maxWidthClassName} px-4 pt-2`}>
              {header}
            </View>
          </View>
        ) : null}
        {scroll ? (
          <ScrollView
            className="flex-1"
            contentContainerClassName="pb-8"
            keyboardShouldPersistTaps="handled"
            refreshControl={refreshControl}
          >
            {centered}
          </ScrollView>
        ) : (
          centered
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
