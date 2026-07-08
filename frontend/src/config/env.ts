function getEnv(key: string): string {
  const val = (import.meta as any).env?.[key];
  if (!val) console.warn(`[env] Missing ${key} — using empty fallback`);
  return val || "";
}

export const API_BASE_URL = getEnv("VITE_API_BASE_URL");

export function getWsUrl(): string {
  if (API_BASE_URL) {
    const base = API_BASE_URL.replace(/^http/, "ws");
    return `${base}/api/chatbot`;
  }
  const proto = location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${location.host}/api/chatbot`;
}

export const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID") || undefined,
  appId: getEnv("VITE_FIREBASE_APP_ID") || undefined,
};
