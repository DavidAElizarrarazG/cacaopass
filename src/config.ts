// API de Monsterball Go (la misma de la práctica 2).
export const API_BASE_URL = "https://monsterballgo.com/api";

// El token se proporciona en clase. Se guarda en .env.local (ignorado por git) para no publicarlo:
// EXPO_PUBLIC_MONSTERBALL_TOKEN=...
export const API_TOKEN = process.env.EXPO_PUBLIC_MONSTERBALL_TOKEN ?? "";
