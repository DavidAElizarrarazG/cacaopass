import { useCallback, useEffect, useState } from "react";
import { Alert, Animated, AppState, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { Image } from "expo-image";
import { Redirect, router } from "expo-router";
import CacaoHce, { type NfcStatus } from "../../modules/cacao-hce";
import AppButton from "../components/AppButton";
import Notice from "../components/Notice";
import { fullName } from "../api/monsterball";
import { useSession } from "../session";
import { styles } from "../styles";
import { colors, radius, spacing } from "../theme";

const PHOTO = 168;
const AID_HEX = "F0 12 34 56 78";

type Detection = { at: number; credentialSent: boolean };

// Los mismos 4 bytes que arma ApduProtocol.kt, para mostrarlos en "Detalles técnicos".
function idBytes(id: number, littleEndian: boolean) {
  const bytes = [24, 16, 8, 0].map((shift) => (id >>> shift) & 0xff);
  if (littleEndian) bytes.reverse();
  return bytes.map((b) => b.toString(16).toUpperCase().padStart(2, "0")).join(" ");
}

function nfcNotice(status: NfcStatus | null) {
  if (!CacaoHce) {
    return {
      tone: "error" as const,
      title: "Credencial NFC no disponible en esta versión",
      detail: "Instala la app compilada (no Expo Go) en un teléfono Android con NFC.",
    };
  }
  if (!status?.hasNfc) {
    return {
      tone: "error" as const,
      title: "Este dispositivo no tiene NFC",
      detail: "Usa un teléfono Android con NFC para presentar tu credencial en el lector.",
    };
  }
  if (!status.hasHce) {
    return {
      tone: "error" as const,
      title: "Tu teléfono no puede emular tarjetas",
      detail: "Su NFC no admite Host Card Emulation (HCE), que es lo que usa el lector.",
    };
  }
  if (!status.nfcEnabled) {
    return {
      tone: "error" as const,
      title: "El NFC está apagado",
      detail: "Actívalo para que el lector pueda leer tu credencial.",
      action: true,
    };
  }
  return {
    tone: "ok" as const,
    title: "Credencial lista",
    detail: "Desbloquea el teléfono y acerca la parte trasera al lector de la puerta.",
  };
}

export default function Credencial() {
  const { user, ready, signOut } = useSession();
  const [status, setStatus] = useState<NfcStatus | null>(() => CacaoHce?.getStatus() ?? null);
  const [detection, setDetection] = useState<Detection | null>(null);
  const [littleEndian, setLittleEndian] = useState(() => CacaoHce?.isLittleEndian() ?? true);
  const [apdu, setApdu] = useState<{ command: string; response: string } | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);
  const [pulse] = useState(() => new Animated.Value(0));

  const refreshStatus = useCallback(() => setStatus(CacaoHce?.getStatus() ?? null), []);

  // Al volver de los ajustes de NFC (o de segundo plano) se revisa otra vez el estado.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") refreshStatus();
    });
    return () => sub.remove();
  }, [refreshStatus]);

  // Retroalimentación de que el lector se detectó: el servicio nativo ya vibró; aquí se anima la
  // credencial y se muestra la hora. La app no sabe (ni dice) si el lector concedió el acceso.
  useEffect(() => {
    if (!CacaoHce) return;
    const sub = CacaoHce.addListener("onReaderDetected", (event) => {
      setDetection({ at: event.timestamp, credentialSent: event.credentialSent });
      pulse.setValue(1);
      Animated.timing(pulse, { toValue: 0, duration: 1600, useNativeDriver: true }).start();
    });
    return () => sub.remove();
  }, [pulse]);

  if (!ready) return <View style={styles.screen} />;
  if (!user) return <Redirect href="/" />;

  const notice = nfcNotice(status);

  const changeByteOrder = (value: boolean) => {
    CacaoHce?.setLittleEndian(value);
    setLittleEndian(value);
    setApdu(null);
  };

  const confirmSignOut = () =>
    Alert.alert("Cerrar sesión", "Tu credencial dejará de responder al lector hasta que vuelvas a entrar.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/");
        },
      },
    ]);

  const initials = fullName(user)
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={[styles.card, { padding: 0, overflow: "hidden", alignItems: "center", gap: 0 }]}>
        <View style={{ alignSelf: "stretch", backgroundColor: colors.accent, paddingVertical: spacing.sm }}>
          <Text style={{ textAlign: "center", fontWeight: "900", letterSpacing: 3, color: colors.bg }}>
            CACAOPASS · ACCESO A PLANTA
          </Text>
        </View>

        <View style={{ marginTop: spacing.lg, width: PHOTO + 24, height: PHOTO + 24, alignItems: "center", justifyContent: "center" }}>
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              width: PHOTO + 24,
              height: PHOTO + 24,
              borderRadius: radius.lg + 12,
              borderWidth: 4,
              borderColor: colors.success,
              opacity: pulse,
              transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1.15, 1] }) }],
            }}
          />
          {user.pfpUrl && !photoFailed ? (
            <Image
              source={{ uri: user.pfpUrl }}
              style={{ width: PHOTO, height: PHOTO, borderRadius: radius.lg, borderWidth: 3, borderColor: colors.accent }}
              contentFit="cover"
              transition={200}
              onError={() => setPhotoFailed(true)}
              accessibilityLabel={`Foto de ${fullName(user)}`}
            />
          ) : (
            <View
              style={{
                width: PHOTO,
                height: PHOTO,
                borderRadius: radius.lg,
                backgroundColor: colors.surfaceAlt,
                borderWidth: 3,
                borderColor: colors.accent,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 56, fontWeight: "900", color: colors.accent }}>{initials}</Text>
            </View>
          )}
        </View>

        <View style={{ padding: spacing.md, gap: spacing.xs, alignItems: "center" }}>
          <Text style={{ fontSize: 30, fontWeight: "900", color: colors.text, textAlign: "center" }}>
            {fullName(user)}
          </Text>
          <Text style={styles.muted}>@{user.username}</Text>
        </View>

        <View
          style={{
            alignSelf: "stretch",
            borderTopWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surfaceAlt,
            paddingVertical: spacing.md,
            alignItems: "center",
          }}
        >
          <Text style={styles.label}>Número de usuario</Text>
          <Text
            style={{ fontSize: 44, fontWeight: "900", color: colors.accent, letterSpacing: 3, fontVariant: ["tabular-nums"] }}
            accessibilityLabel={`Número de usuario ${user.id}`}
          >
            {user.id}
          </Text>
        </View>
      </View>

      <Notice tone={notice.tone} title={notice.title} detail={notice.detail} />
      {"action" in notice ? (
        <View style={{ alignItems: "center" }}>
          <AppButton label="Abrir ajustes de NFC" variant="secondary" onPress={() => CacaoHce?.openNfcSettings()} />
        </View>
      ) : null}

      {detection ? (
        <Notice
          tone="info"
          title={detection.credentialSent ? "Lector detectado" : "Lector detectado sin credencial"}
          detail={
            detection.credentialSent
              ? `Tu número de usuario se envió a las ${new Date(detection.at).toLocaleTimeString("es-MX")}. El lector decide si abre la puerta.`
              : "No había una credencial cargada. Cierra sesión y vuelve a entrar."
          }
        />
      ) : null}

      <View style={styles.card}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: showDetails }}
          onPress={() => setShowDetails((v) => !v)}
          style={[styles.row, { justifyContent: "space-between" }]}
        >
          <Text style={styles.heading}>Detalles técnicos</Text>
          <Text style={[styles.heading, { color: colors.accent }]}>{showDetails ? "−" : "+"}</Text>
        </Pressable>

        {showDetails ? (
          <View style={{ gap: spacing.sm }}>
            <Text style={styles.muted}>AID registrado</Text>
            <Text style={styles.mono}>{AID_HEX}</Text>
            <Text style={styles.muted}>Número de usuario en 4 bytes ({littleEndian ? "little-endian" : "big-endian"})</Text>
            <Text style={styles.mono}>{idBytes(user.id, littleEndian)} · 0x{user.id.toString(16).toUpperCase().padStart(8, "0")}</Text>

            <View style={[styles.row, { justifyContent: "space-between" }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.body}>Orden little-endian</Text>
                <Text style={styles.muted}>El firmware del ESP32 copia los bytes con memcpy, que los lee al revés.</Text>
              </View>
              <Switch
                value={littleEndian}
                onValueChange={changeByteOrder}
                disabled={!CacaoHce}
                trackColor={{ true: colors.accentDark, false: colors.border }}
                thumbColor={littleEndian ? colors.accent : colors.muted}
              />
            </View>

            {status ? (
              <Text style={styles.muted}>
                Servicio predeterminado para el AID: {status.isDefaultForAid ? "sí" : "no"}
              </Text>
            ) : null}

            {CacaoHce ? (
              <View style={{ alignItems: "center", gap: spacing.sm }}>
                <AppButton label="Probar respuesta APDU" variant="secondary" onPress={() => setApdu(CacaoHce?.simulateSelect() ?? null)} />
              </View>
            ) : null}
            {apdu ? (
              <View style={{ gap: spacing.xs }}>
                <Text style={styles.muted}>Comando del lector (SELECT)</Text>
                <Text style={styles.mono}>{apdu.command}</Text>
                <Text style={styles.muted}>Respuesta de la app</Text>
                <Text style={styles.mono}>{apdu.response}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      <View style={{ alignItems: "center", gap: spacing.sm, paddingBottom: spacing.lg }}>
        <AppButton label="Créditos" variant="secondary" onPress={() => router.push("/creditos")} />
        <AppButton label="Cerrar sesión" variant="secondary" onPress={confirmSignOut} />
      </View>
    </ScrollView>
  );
}
