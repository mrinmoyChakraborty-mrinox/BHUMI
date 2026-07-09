import { useState, useEffect, useCallback } from "react";
import { Leaf, Loader2, AlertCircle, ShieldAlert, ArrowUpRight } from "lucide-react";
import { useAuthContext } from "../../auth/AuthContext";
import { listHealthLogs } from "../../api/endpoints/healthLogs";
import type { HealthLogOut } from "../../api/types";

function formatDate(d?: string | null) {
  if (!d) return "";
  try { return new Date(d).toLocaleString(); } catch { return ""; }
}

export default function FarmerHealthLogs() {
  const { farmerProfile } = useAuthContext();
  const farmerId = farmerProfile?.id;

  const [logs, setLogs] = useState<HealthLogOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!farmerId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await listHealthLogs({ farmer_id: farmerId, limit: 100 });
      setLogs(res.items);
    } catch (err: any) {
      setError(err?.detail || err?.message || "Failed to load health logs");
    } finally {
      setLoading(false);
    }
  }, [farmerId]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-black text-stone-900 flex items-center gap-2">
          <Leaf className="w-7 h-7 text-emerald-600" />
          <span>Health Logs</span>
        </h2>
        <p className="text-stone-500 font-medium text-xs mt-1">
          Your leaf disease diagnoses and recommended actions
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 text-rose-700 text-sm font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-stone-50 border-2 border-dashed border-stone-900 rounded-3xl p-16 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-3" />
          <p className="text-stone-500 font-bold text-sm">Loading health logs…</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white border-2 border-stone-900 rounded-3xl p-10 text-center shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
          <div className="w-14 h-14 mx-auto rounded-2xl border-2 border-stone-900 bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
            <Leaf className="w-7 h-7" />
          </div>
          <p className="font-display font-black text-stone-900">No health logs yet</p>
          <p className="text-sm text-stone-500 mt-1">Use Leaf Disease Diagnosis from Home to check a crop photo.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const flagged = log.escalate_to_rsk;
            return (
              <div key={log.id} className="bg-white border-2 border-stone-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-mono font-black uppercase tracking-wide px-2 py-1 rounded-lg border-2 ${
                      log.status === "resolved" ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-amber-100 text-amber-800 border-amber-300"
                    }`}>
                      {log.status}
                    </span>
                    {flagged && (
                      <span className="text-[10px] font-mono font-black uppercase tracking-wide px-2 py-1 rounded-lg border-2 bg-rose-100 text-rose-700 border-rose-300 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> Escalated to RSK
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-stone-400 shrink-0">{formatDate(log.created_at)}</span>
                </div>
                <div className="mt-3 flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-2xl border-2 border-stone-900 flex items-center justify-center shrink-0 ${flagged ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"}`}>
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-black text-stone-900">{log.diagnosis}</p>
                    <p className="text-xs text-stone-400 font-mono mt-0.5">Confidence: {log.confidence}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm font-semibold text-stone-800 leading-relaxed">
                  <span className="text-emerald-700 font-bold">Recommended: </span>
                  {log.recommended_action}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
