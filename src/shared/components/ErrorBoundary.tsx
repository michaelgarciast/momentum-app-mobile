import { Component, type ErrorInfo, type ReactNode } from "react";
import { Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView className="flex-1 items-center justify-center bg-white px-6">
          <Text className="text-2xl font-bold text-gray-900">
            Algo salió mal
          </Text>
          <Text className="mt-2 text-center text-base text-gray-500">
            {this.state.error?.message ?? "Error inesperado"}
          </Text>
          <Pressable
            onPress={this.handleReset}
            className="mt-8 rounded-xl bg-indigo-600 px-6 py-3 active:opacity-80"
          >
            <Text className="text-base font-semibold text-white">
              Reintentar
            </Text>
          </Pressable>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}
