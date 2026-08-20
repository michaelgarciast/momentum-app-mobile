import { Alert } from "react-native";

type ConfirmDeleteOptions = {
  title: string;
  message: string;
  onConfirm: () => void;
};

export function confirmDelete({ title, message, onConfirm }: ConfirmDeleteOptions) {
  Alert.alert(title, message, [
    { text: "Cancelar", style: "cancel" },
    { text: "Eliminar", style: "destructive", onPress: onConfirm },
  ]);
}
