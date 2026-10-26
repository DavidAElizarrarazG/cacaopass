import { Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { TECH_LOGOS, type TechLogoKey } from "../data/tech-logos";
import { styles } from "../styles";
import { colors, radius, spacing } from "../theme";

type Props = { logo: TechLogoKey | null; name: string; role: string };

const SIZE = 44;

// Fila del tech stack: logotipo oficial sobre fondo crema (varios son negros y no se verían sobre cacao).
export default function TechItem({ logo, name, role }: Props) {
  const icon = logo ? TECH_LOGOS[logo] : null;
  return (
    <View style={[styles.row, { gap: spacing.md }]}>
      <View
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: radius.sm,
          backgroundColor: colors.cream,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon ? (
          <Svg width={SIZE - 14} height={SIZE - 14} viewBox="0 0 24 24" accessibilityLabel={`Logotipo de ${icon.title}`}>
            <Path d={icon.path} fill={icon.hex} />
          </Svg>
        ) : (
          <Text style={{ fontSize: 13, fontWeight: "900", color: colors.bg }}>NFC</Text>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.body, { fontWeight: "700" }]}>{name}</Text>
        <Text style={styles.muted}>{role}</Text>
      </View>
    </View>
  );
}
