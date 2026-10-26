import { Image, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import AppButton from "../components/AppButton";
import TechItem from "../components/TechItem";
import { APP_STACK, COURSE, SYSTEM_STACK, TEAM } from "../data/team";
import { styles } from "../styles";
import { spacing } from "../theme";

export default function Creditos() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={{ alignItems: "center", gap: spacing.xs }}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={{ width: 88, height: 88 }}
          accessibilityLabel="Logotipo de CacaoPass"
        />
        <Text style={styles.title}>CacaoPass</Text>
        <Text style={styles.subtitle}>Credencial digital de acceso a planta chocolatera</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Equipo de desarrollo</Text>
        {TEAM.map((p) => (
          <View key={p.id}>
            <Text style={styles.body}>{p.name}</Text>
            <Text style={styles.muted}>Matrícula {p.id}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Curso</Text>
        <Text style={styles.body}>
          {COURSE.subject} · Grupo {COURSE.group}
        </Text>
        <Text style={styles.muted}>Sistema de acceso físico con NFC, Arduino y Android</Text>
        <Text style={styles.muted}>Docente: {COURSE.teacher}</Text>
        <Text style={styles.muted}>Facultad de Ingeniería · Universidad La Salle México</Text>
        <Text style={styles.muted}>{COURSE.date}</Text>
      </View>

      <View style={[styles.card, { gap: spacing.md }]}>
        <Text style={styles.heading}>Tecnologías de la app</Text>
        {APP_STACK.map((t) => (
          <TechItem key={t.name} {...t} />
        ))}
      </View>

      <View style={[styles.card, { gap: spacing.md }]}>
        <Text style={styles.heading}>Sistema de acceso</Text>
        {SYSTEM_STACK.map((t) => (
          <TechItem key={t.name} {...t} />
        ))}
        <Text style={styles.muted}>Logotipos oficiales tomados de Simple Icons (CC0).</Text>
      </View>

      <View style={{ alignItems: "center", paddingBottom: spacing.lg }}>
        <AppButton label="Regresar" onPress={() => router.back()} />
      </View>
    </ScrollView>
  );
}
