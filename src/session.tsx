import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import CacaoHce from "../modules/cacao-hce";
import type { User } from "./api/monsterball";

const STORAGE_KEY = "cacaopass.user";

type Session = {
  user: User | null;
  ready: boolean;
  signIn: (user: User) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<Session | null>(null);

// La sesión se recuerda (sin la contraseña) para que la credencial esté lista al llegar al lector.
// El número de usuario se entrega al servicio HCE, que lo guarda de su lado en SharedPreferences.
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEY)
      .then((saved) => {
        if (!saved) return;
        const restored = JSON.parse(saved) as User;
        CacaoHce?.setCredential(restored.id);
        setUser(restored);
      })
      .catch(() => SecureStore.deleteItemAsync(STORAGE_KEY))
      .finally(() => setReady(true));
  }, []);

  const signIn = async (next: User) => {
    CacaoHce?.setCredential(next.id);
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(next));
    setUser(next);
  };

  const signOut = async () => {
    CacaoHce?.clearCredential();
    await SecureStore.deleteItemAsync(STORAGE_KEY);
    setUser(null);
  };

  return (
    <SessionContext.Provider value={{ user, ready, signIn, signOut }}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession debe usarse dentro de SessionProvider");
  return session;
}
