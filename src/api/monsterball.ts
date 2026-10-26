import * as Crypto from "expo-crypto";
import { API_BASE_URL, API_TOKEN } from "../config";

export type User = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  pfpUrl: string | null;
};

export type LoginErrorKind = "credentials" | "token" | "network" | "timeout" | "server" | "format";

// Mensajes en lenguaje llano que dicen qué pasó y qué hacer (heurística 9 de Nielsen).
const MESSAGES: Record<LoginErrorKind, { title: string; detail: string }> = {
  credentials: {
    title: "Usuario o contraseña incorrectos",
    detail: "Revisa que los escribiste bien; la contraseña distingue mayúsculas y minúsculas.",
  },
  token: {
    title: "La app no está autorizada",
    detail: "No es un problema de tu cuenta: falta o es incorrecto el token de la API. Avisa al equipo de desarrollo.",
  },
  network: {
    title: "Sin conexión con el servidor",
    detail: "Revisa que tengas Wi-Fi o datos móviles y vuelve a intentarlo.",
  },
  timeout: {
    title: "El servidor tardó demasiado",
    detail: "Espera un momento y vuelve a intentarlo.",
  },
  server: {
    title: "El servidor tuvo un problema",
    detail: "Intenta de nuevo en unos minutos.",
  },
  format: {
    title: "Respuesta inesperada del servidor",
    detail: "Intenta de nuevo; si continúa, avisa al equipo de desarrollo.",
  },
};

export class LoginError extends Error {
  readonly kind: LoginErrorKind;
  readonly detail: string;

  constructor(kind: LoginErrorKind) {
    super(MESSAGES[kind].title);
    this.kind = kind;
    this.detail = MESSAGES[kind].detail;
  }
}

const TIMEOUT_MS = 15000;
// El número de usuario viaja en 4 bytes y del lado de Kotlin se guarda como Int con signo.
const MAX_USER_ID = 0x7fffffff;

function formBody(fields: Record<string, string>) {
  return Object.entries(fields)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
}

// La API entrega las fotos con http://, que Android bloquea; el servidor también las sirve por https.
function secureUrl(url: unknown): string | null {
  if (typeof url !== "string" || url.length === 0) return null;
  return url.replace(/^http:\/\//i, "https://");
}

export async function login(username: string, password: string): Promise<User> {
  if (!API_TOKEN) throw new LoginError("token");

  // La API pide la contraseña como resumen SHA-256 en hexadecimal.
  const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: formBody({ user: username.trim(), pass: hash, token: API_TOKEN }),
      signal: controller.signal,
    });
  } catch {
    throw new LoginError(controller.signal.aborted ? "timeout" : "network");
  } finally {
    clearTimeout(timer);
  }

  if (res.status >= 500) throw new LoginError("server");

  let data: Record<string, unknown>;
  try {
    data = await res.json();
  } catch {
    throw new LoginError("format");
  }

  // El servidor contesta HTTP 200 aun cuando el acceso falla: el resultado real está en "error".
  // Nunca se muestra su texto porque puede incluir la consulta SQL.
  if (data.error) throw new LoginError(data.error === "Unauthorized" ? "token" : "credentials");

  const id = Number(data.id);
  if (!Number.isInteger(id) || id < 0 || id > MAX_USER_ID || typeof data.username !== "string") {
    throw new LoginError("format");
  }

  return {
    id,
    username: data.username,
    firstName: String(data.first_name ?? data.firstname ?? ""),
    lastName: String(data.last_name ?? data.lastname ?? ""),
    email: String(data.email ?? ""),
    pfpUrl: secureUrl(data.pfp_url),
  };
}

export function fullName(user: User) {
  const name = `${user.firstName} ${user.lastName}`.trim();
  return name.length > 0 ? name : user.username;
}
