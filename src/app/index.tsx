import { useRef, useState } from "react";
import { Image, KeyboardAvoidingView, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, router } from "expo-router";
import AppButton from "../components/AppButton";
import Notice from "../components/Notice";
import { login, LoginError } from "../api/monsterball";
import { useSession } from "../session";
import { styles } from "../styles";
import { colors, spacing } from "../theme";

type FieldErrors = { username?: string; password?: string };

export default function Login() {
  const { user, ready, signIn } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<LoginError | null>(null);
  const passwordRef = useRef<TextInput>(null);

  if (!ready) return <View style={styles.screen} />;
  if (user) return <Redirect href="/credencial" />;

  const submit = async () => {
    // Se valida antes de llamar al servidor para no gastar una petición en un campo vacío.
    const errors: FieldErrors = {
      username: username.trim() ? undefined : "Escribe tu nombre de usuario",
      password: password ? undefined : "Escribe tu contraseña",
    };
    setFieldErrors(errors);
    setError(null);
    if (errors.username || errors.password) return;

    setLoading(true);
    try {
      await signIn(await login(username, password));
      setPassword("");
      router.replace("/credencial");
    } catch (e) {
      setError(e instanceof LoginError ? e : new LoginError("format"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView contentContainerStyle={[styles.content, { flexGrow: 1, justifyContent: "center" }]}>
          <View style={{ alignItems: "center", gap: spacing.sm }}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={{ width: 128, height: 128 }}
              accessibilityLabel="Logotipo de CacaoPass"
            />
            <Text style={styles.title}>CacaoPass</Text>
            <Text style={styles.subtitle}>Credencial digital de acceso a planta chocolatera</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Usuario</Text>
            <TextInput
              style={[styles.input, fieldErrors.username && styles.inputError]}
              value={username}
              onChangeText={setUsername}
              placeholder="Tu usuario de Monsterball Go"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              textContentType="username"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              editable={!loading}
            />
            {fieldErrors.username ? <Text style={styles.fieldError}>{fieldErrors.username}</Text> : null}

            <Text style={[styles.label, { marginTop: spacing.sm }]}>Contraseña</Text>
            <View style={styles.row}>
              <TextInput
                ref={passwordRef}
                style={[styles.input, { flex: 1 }, fieldErrors.password && styles.inputError]}
                value={password}
                onChangeText={setPassword}
                placeholder="Contraseña"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={submit}
                editable={!loading}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={8}
              >
                <Text style={[styles.muted, { color: colors.accent, fontWeight: "700" }]}>
                  {showPassword ? "Ocultar" : "Mostrar"}
                </Text>
              </Pressable>
            </View>
            {fieldErrors.password ? <Text style={styles.fieldError}>{fieldErrors.password}</Text> : null}
          </View>

          {error ? <Notice tone="error" title={error.message} detail={error.detail} /> : null}

          <View style={{ alignItems: "center", gap: spacing.sm }}>
            <AppButton label="Entrar" onPress={submit} loading={loading} />
            <AppButton label="Créditos" variant="secondary" onPress={() => router.push("/creditos")} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
