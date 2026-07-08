import { useState, useEffect, useCallback } from "react";
import {
  HeartPulse,
  Loader2,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  FileText,
  Send,
} from "lucide-react";
import { getDashboardHealthLogs } from "../../api/endpoints/dashboard";
import { resolveHealthLog } from "../../api/endpoints/healthLogs";
import type { HealthLogOut } from "../../api/types";

export default function HealthLogsList() {
  const [logs, setLogs] = useState<HealthLogOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardHealthLogs("flagged_for_rsk");
      setLogs(data);
    } catch (err: any) {
      setError(err?.detail || err?.message || "Failed to load health logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleResolve = async (id: string) => {
    const notes = notesMap[id]?.trim();
    if (!notes) return;
    setResolvingId(id);
    try {
      const updated = await resolveHealthLog(id, {
        rsk_notes: notes,
        status: "resolved",
      });
      setLogs((prev) =>
        prev.map((log) => (log.id === id ? { ...log, ...updated } : log))
      );
      setExpandedId(null);
      setNotesMap((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err: any) {
      setError(err?.detail || err?.message || "Failed to resolve health log");
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-black text-stone-900 flex items-center gap-2">
            <HeartPulse className="w-7 h-7 text-red-600" />
            <span>Flagged Health Cases</span>
          </h2>
          <p className="text-stone-500 font-medium text-xs mt-1">
            Health logs flagged for RSK review
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="bg-white border-2 border-stone-900 rounded-xl px-4 py-2 text-xs font-display font-black text-stone-900 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] flex items-center gap-2 hover:bg-stone-50 transition cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-4 text-red-800 text-sm font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="bg-stone-50 border-2 border-dashed border-stone-900 rounded-3xl p-16 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-3" />
          <p className="text-stone-500 font-bold text-sm">Loading health logs...</p>
        </div>
      )}

      {!loading && !error && logs.length === 0 && (
        <div className="bg-stone-50 border-2 border-dashed border-stone-900 rounded-3xl p-16 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <p className="text-stone-500 font-bold text-sm">
            No flagged health cases. All clear.
          </p>
        </div>
      )}

      {!loading && logs.length > 0 && (
        <div className="space-y-3">
          {logs.map((log) => {
            const isExpanded = expandedId === log.id;
            return (
              <div
                key={log.id}
                className="bg-white border-2 border-stone-900 rounded-2xl shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]"
              >
                <button
                  onClick={() => toggleExpand(log.id)}
                  className="w-full flex items-start gap-4 p-5 text-left cursor-pointer hover:bg-stone-50 transition rounded-2xl"
                >
                  <span className="w-8 h-8 rounded-xl border-2 border-stone-900 bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                    <HeartPulse className="w-4 h-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-black text-stone-500 uppercase">
                        Farmer: {log.farmer_id}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-bold border-2 border-stone-900 ${
                          log.status === "resolved"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {log.status}
                      </span>
                      <span className="text-xs font-mono text-stone-400">
                        {log.confidence}
                      </span>
                    </div>
                    <p className="text-sm text-stone-800 font-bold mt-1 leading-relaxed">
                      {log.diagnosis.length > 100
                        ? `${log.diagnosis.slice(0, 100)}...`
                        : log.diagnosis}
                    </p>
                  </div>

                  <div className="shrink-0 mt-1">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-stone-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-stone-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t-2 border-stone-900 px-5 pb-5 pt-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="bg-stone-50 border-2 border-stone-900 rounded-xl p-3">
                        <span className="text-xs font-mono font-black text-stone-500 uppercase tracking-wide">
                          Confidence
                        </span>
                        <p className="font-bold text-stone-900 mt-0.5">{log.confidence}</p>
                      </div>
                      <div className="bg-stone-50 border-2 border-stone-900 rounded-xl p-3">
                        <span className="text-xs font-mono font-black text-stone-500 uppercase tracking-wide">
                          Plot ID
                        </span>
                        <p className="font-mono text-stone-900 mt-0.5 text-xs">{log.plot_id}</p>
                      </div>
                      <div className="sm:col-span-2 bg-stone-50 border-2 border-stone-900 rounded-xl p-3">
                        <span className="text-xs font-mono font-black text-stone-500 uppercase tracking-wide">
                          Recommended Action
                        </span>
                        <p className="text-stone-900 mt-0.5 font-bold">{log.recommended_action}</p>
                      </div>
                      <div className="sm:col-span-2 bg-stone-50 border-2 border-stone-900 rounded-xl p-3">
                        <span className="text-xs font-mono font-black text-stone-500 uppercase tracking-wide">
                          Full Diagnosis
                        </span>
                        <p className="text-stone-700 mt-0.5">{log.diagnosis}</p>
                      </div>
                      {log.rsk_notes && (
                        <div className="sm:col-span-2 bg-amber-50 border-2 border-stone-900 rounded-xl p-3">
                          <span className="text-xs font-mono font-black text-stone-500 uppercase tracking-wide">
                            RSK Notes
                          </span>
                          <p className="text-stone-800 mt-0.5">{log.rsk_notes}</p>
                        </div>
                      )}
                    </div>

                    {log.status !== "resolved" && (
                      <div className="bg-stone-50 border-2 border-stone-900 rounded-2xl p-4 space-y-3">
                        <label className="flex items-center gap-2 text-xs font-mono font-black text-stone-700 uppercase tracking-wide">
                          <FileText className="w-4 h-4 text-stone-500" />
                          Resolve with notes
                        </label>
                        <textarea
                          value={notesMap[log.id] || ""}
                          onChange={(e) =>
                            setNotesMap((prev) => ({
                              ...prev,
                              [log.id]: e.target.value,
                            }))
                          }
                          placeholder="Enter RSK resolution notes..."
                          rows={3}
                          className="w-full bg-white border-2 border-stone-900 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                        />
                        <button
                          onClick={() => handleResolve(log.id)}
                          disabled={
                            resolvingId === log.id || !notesMap[log.id]?.trim()
                          }
                          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-display font-black text-xs px-4 py-2.5 rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] flex items-center gap-2 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {resolvingId === log.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Resolving...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Resolve & Send</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
