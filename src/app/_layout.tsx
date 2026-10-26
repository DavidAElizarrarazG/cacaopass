import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SessionProvider } from "../session";
import { colors } from "../theme";

export default function RootLayout() {
  return (
    <SessionProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.accent,
          headerTitleStyle: { color: colors.text, fontWeight: "700" },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="credencial"
          options={{ title: "Mi credencial", headerBackVisible: false, gestureEnabled: false }}
        />
        <Stack.Screen name="creditos" options={{ title: "Créditos" }} />
      </Stack>
    </SessionProvider>
  );
}
