import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="bg-white border-2 border-stone-900 rounded-3xl p-8 shadow-[6px_6px_0px_0px_rgba(28,25,23,1)] text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 border-2 border-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-black text-stone-900 mb-2">Access Denied</h2>
        <p className="text-sm text-stone-500 mb-6">
          You do not have the required role to view this page. Admin privileges are needed.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/dashboard"
            className="px-5 py-2.5 text-xs font-bold font-mono bg-emerald-600 text-white border-2 border-stone-900 rounded-xl shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] hover:bg-emerald-700"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/"
            className="px-5 py-2.5 text-xs font-bold font-mono bg-white border-2 border-stone-900 rounded-xl shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] hover:bg-stone-50"
          >
            Public Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
