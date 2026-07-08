import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import { firebaseConfig } from "../config/env";

let auth: Auth | null = null;

try {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  if (import.meta.env.VITE_FIREBASE_EMULATOR_HOST) {
    connectAuthEmulator(auth, import.meta.env.VITE_FIREBASE_EMULATOR_HOST);
  }
} catch {
  // Firebase credentials not configured — auth features are unavailable
}

export { auth };
