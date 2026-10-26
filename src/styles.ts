import { StyleSheet } from "react-native";
import { colors, radius, spacing } from "./theme";

// Estilos reutilizables en todas las pantallas.
export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: colors.accent,
    textAlign: "center",
    letterSpacing: 1,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.muted,
    textAlign: "center",
  },
  body: {
    fontSize: 16,
    lineHeight: 23,
    color: colors.text,
  },
  muted: {
    fontSize: 14,
    color: colors.muted,
  },
  label: {
    fontSize: 12,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontWeight: "700",
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 17,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: colors.warn,
  },
  fieldError: {
    fontSize: 13,
    color: colors.warn,
  },
  mono: {
    fontFamily: "monospace",
    fontSize: 14,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
    minWidth: 200,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.bg,
  },
  buttonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.accent,
  },
  buttonSecondaryText: {
    color: colors.accent,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
});
