import { useState, type FormEvent } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../../auth/firebase";
import { useAuthContext } from "../../auth/AuthContext";
import { Sprout, Loader2, Mail, Lock, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { user, loading: authLoading, loginRedirect, setLoginRedirect } = useAuthContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (user) {
    const redirect = loginRedirect || "/dashboard";
    setLoginRedirect(null);
    return <Navigate to={redirect} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
        navigate("/dashboard");
      } else if (mode === "register") {
        await createUserWithEmailAndPassword(auth, email, password);
        navigate("/dashboard");
      } else {
        await sendPasswordResetEmail(auth, email);
        setError("Password reset email sent. Check your inbox.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white border-2 border-stone-900 rounded-3xl p-8 shadow-[6px_6px_0px_0px_rgba(28,25,23,1)]">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-emerald-600 border-2 border-stone-900 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Sprout className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-black text-stone-900">
            {mode === "login" ? "RSK Officer Login" : mode === "register" ? "Create Account" : "Reset Password"}
          </h2>
          <p className="text-xs text-stone-500 font-mono mt-1">
            {mode === "login"
              ? "Sign in to access the RSK dashboard"
              : mode === "register"
              ? "Register a new Firebase account"
              : "Enter your email to receive a reset link"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-500 rounded-xl px-4 py-3 mb-4 flex items-start gap-2 text-xs font-bold text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1 font-mono">Email</label>
            <div className="flex items-center gap-2 bg-stone-50 border-2 border-stone-900 rounded-xl px-3">
              <Mail className="w-4 h-4 text-stone-400 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-2.5 text-sm bg-transparent focus:outline-none font-bold"
                required
              />
            </div>
          </div>

          {mode !== "reset" && (
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1 font-mono">Password</label>
              <div className="flex items-center gap-2 bg-stone-50 border-2 border-stone-900 rounded-xl px-3">
                <Lock className="w-4 h-4 text-stone-400 shrink-0" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-2.5 text-sm bg-transparent focus:outline-none font-bold"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-display font-black text-sm px-4 py-3 rounded-2xl border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === "login" ? (
              "Sign In"
            ) : mode === "register" ? (
              "Create Account"
            ) : (
              "Send Reset Email"
            )}
          </button>
        </form>

        <div className="mt-4 text-center space-y-1 text-xs font-mono font-bold">
          {mode === "login" && (
            <>
              <button onClick={() => setMode("register")} className="text-emerald-700 hover:underline cursor-pointer">
                No account? Register
              </button>
              <br />
              <button onClick={() => setMode("reset")} className="text-stone-500 hover:underline cursor-pointer">
                Forgot password?
              </button>
            </>
          )}
          {mode === "register" && (
            <button onClick={() => setMode("login")} className="text-emerald-700 hover:underline cursor-pointer">
              Already have an account? Sign in
            </button>
          )}
          {mode === "reset" && (
            <button onClick={() => setMode("login")} className="text-emerald-700 hover:underline cursor-pointer">
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
