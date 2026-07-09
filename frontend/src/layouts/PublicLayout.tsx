import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LOGO from "../LOGO_BHUMI.png";

export default function PublicLayout() {
  const { farmerProfile } = useAuth();
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans antialiased">
      <header className="bg-white border-b-4 border-stone-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <img
              src={LOGO}
              alt="BHUMI"
              className="w-10 h-10 rounded-xl border-2 border-stone-900 object-cover"
            />
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-emerald-800 font-mono">
                BHUMI
              </span>
              <h1 className="text-lg font-black text-stone-900 leading-tight">
                Krishi AI Portal
              </h1>
            </div>
          </Link>
          <nav className="flex gap-2">
            {farmerProfile && (
              <Link
                to="/farmer"
                className="px-4 py-2 text-xs font-bold font-mono bg-emerald-600 text-white border-2 border-stone-900 rounded-xl hover:bg-emerald-700 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]"
              >
                My Dashboard
              </Link>
            )}
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-bold font-mono bg-white border-2 border-stone-900 rounded-xl hover:bg-stone-50 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]"
            >
              RSK Login
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <footer className="bg-stone-100 border-t-4 border-stone-900 text-stone-600 py-6 mt-8 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-mono text-stone-500">
            BHUMI Agri-Advisory Platform &mdash; National AgriTech Initiative
          </p>
        </div>
      </footer>
    </div>
  );
}
