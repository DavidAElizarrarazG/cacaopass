import { ActivityIndicator, Pressable, Text } from "react-native";
import { styles } from "../styles";
import { colors } from "../theme";

type Props = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  loading?: boolean;
  disabled?: boolean;
};

// Botón reutilizable con retroalimentación al presionar y estado de carga.
export default function AppButton({ label, onPress, variant = "primary", loading = false, disabled = false }: Props) {
  const secondary = variant === "secondary";
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.buttonSecondary,
        inactive && { opacity: 0.6 },
        pressed && { opacity: 0.75, transform: [{ scale: 0.97 }] },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={secondary ? colors.accent : colors.bg} />
      ) : (
        <Text style={[styles.buttonText, secondary && styles.buttonSecondaryText]}>{label}</Text>
      )}
    </Pressable>
  );
}
