import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { firebaseConfig } from "../config/env";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

if (import.meta.env.VITE_FIREBASE_EMULATOR_HOST) {
  connectAuthEmulator(auth, import.meta.env.VITE_FIREBASE_EMULATOR_HOST);
}
