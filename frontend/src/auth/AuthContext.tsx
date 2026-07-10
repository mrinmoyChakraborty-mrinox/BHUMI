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
import type { DashboardMeResponse, FarmerOut } from "../api/types";
import { API_BASE_URL } from "../config/env";

export type UserRole = "rsk_officer" | "admin" | "farmer" | null;

interface AuthState {
  user: User | null;
  idToken: string | null;
  role: UserRole;
  officerName: string | null;
  farmerId: string | null;
  farmerProfile: FarmerOut | null;
  loading: boolean;
  loginRedirect: string | null;
  setLoginRedirect: (path: string | null) => void;
  setFarmerProfile: (profile: FarmerOut | null) => void;
  setRole: (role: UserRole) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [officerName, setOfficerName] = useState<string | null>(null);
  const [farmerId, setFarmerId] = useState<string | null>(null);
  const [farmerProfile, setFarmerProfile] = useState<FarmerOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginRedirect, setLoginRedirect] = useState<string | null>(null);

  const fetchRole = useCallback(async (token: string): Promise<UserRole> => {
    try {
      const me = await apiRequest<DashboardMeResponse>("/dashboard/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const r = (me.role as UserRole) || null;
      setRole(r);
      setOfficerName(me.name || null);
      return r;
    } catch {
      setRole(null);
      setOfficerName(null);
      return null;
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
        const detectedRole = await fetchRole(token);
        if (!detectedRole) {
          let profile: FarmerOut | null = null;
          // Try phone lookup first
          if (firebaseUser.phoneNumber) {
            try {
              const phone = encodeURIComponent(firebaseUser.phoneNumber);
              const res = await fetch(`${API_BASE_URL}/farmers/by-phone/${phone}`);
              if (res.ok) {
                profile = await res.json();
              }
            } catch {
              // ignore
            }
          }
          // Fall back to email lookup (handles Google-auth farmers)
          if (!profile && firebaseUser.email) {
            try {
              const email = encodeURIComponent(firebaseUser.email);
              const res = await fetch(`${API_BASE_URL}/farmers/by-email/${email}`);
              if (res.ok) {
                profile = await res.json();
              }
            } catch {
              // ignore
            }
          }
          if (profile) {
            setFarmerId(profile.id);
            setFarmerProfile(profile);
            setRole("farmer");
          }
        }
      } else {
        setIdToken(null);
        setRole(null);
        setOfficerName(null);
        setFarmerId(null);
        setFarmerProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [fetchRole]);

  const logout = useCallback(async () => {
    if (auth) await signOut(auth);
    setRole(null);
    setOfficerName(null);
    setFarmerId(null);
    setFarmerProfile(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        idToken,
        role,
        officerName,
        farmerId,
        farmerProfile,
        loading,
        loginRedirect,
        setLoginRedirect,
        setFarmerProfile,
        setRole,
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
