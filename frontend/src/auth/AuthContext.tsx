import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "./firebase";
import { setTokenGetter } from "../api/client";
import { apiRequest } from "../api/client";
import type { DashboardMeResponse } from "../api/types";

export type UserRole = "rsk_officer" | "admin" | null;

interface AuthState {
  user: User | null;
  idToken: string | null;
  role: UserRole;
  officerName: string | null;
  loading: boolean;
  loginRedirect: string | null;
  setLoginRedirect: (path: string | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [officerName, setOfficerName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginRedirect, setLoginRedirect] = useState<string | null>(null);

  const fetchRole = useCallback(async (token: string) => {
    try {
      const me = await apiRequest<DashboardMeResponse>("/dashboard/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      setRole((me.role as UserRole) || null);
      setOfficerName(me.name || null);
    } catch {
      setRole(null);
      setOfficerName(null);
    }
  }, []);

  useEffect(() => {
    setTokenGetter(async () => {
      if (!auth?.currentUser) return null;
      try {
        return await auth.currentUser.getIdToken();
      } catch {
        return null;
      }
    });
  }, []);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        setIdToken(token);
        await fetchRole(token);
      } else {
        setIdToken(null);
        setRole(null);
        setOfficerName(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [fetchRole]);

  const logout = useCallback(async () => {
    if (auth) await signOut(auth);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        idToken,
        role,
        officerName,
        loading,
        loginRedirect,
        setLoginRedirect,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
