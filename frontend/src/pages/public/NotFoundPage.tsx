import { Link } from "react-router-dom";
import { Sprout, Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
      <div className="max-w-md w-full bg-white border-2 border-stone-900 rounded-3xl p-8 shadow-[6px_6px_0px_0px_rgba(28,25,23,1)] text-center">
        <div className="w-14 h-14 bg-amber-100 border-2 border-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Sprout className="w-7 h-7 text-amber-600" />
        </div>
        <h1 className="text-6xl font-black text-stone-900 mb-2">404</h1>
        <p className="text-stone-500 text-sm font-mono mb-6">
          This page doesn't exist on the farm.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-5 py-2.5 rounded-2xl border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] transition cursor-pointer mx-auto"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
