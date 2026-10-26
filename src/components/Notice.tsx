import { Text, View } from "react-native";
import { styles } from "../styles";
import { colors, radius, spacing } from "../theme";

type Props = {
  title: string;
  detail?: string;
  tone?: "error" | "ok" | "info";
};

const TONES = { error: colors.warn, ok: colors.success, info: colors.accent };

// Aviso con título y explicación; se anuncia solo con TalkBack (liveRegion).
export default function Notice({ title, detail, tone = "info" }: Props) {
  const color = TONES[tone];
  return (
    <View
      accessibilityLiveRegion="polite"
      style={{
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: color,
        borderLeftWidth: 6,
        backgroundColor: colors.surfaceAlt,
        padding: spacing.md,
        gap: spacing.xs,
      }}
    >
      <Text style={[styles.body, { color, fontWeight: "800" }]}>{title}</Text>
      {detail ? <Text style={styles.muted}>{detail}</Text> : null}
    </View>
  );
}
