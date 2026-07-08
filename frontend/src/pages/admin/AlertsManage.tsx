import { useEffect, useState } from "react";
import { Loader2, Check, X, Bell, BellOff, AlertTriangle } from "lucide-react";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import { listAlerts, updateAlert, deleteAlert } from "../../api/endpoints/alerts";
import type { AlertOut } from "../../api/types";

const statusOptions = ["sent", "acknowledged", "no_response"];

export default function AlertsManage() {
  const { items, loading, error, load, loadMore, hasMore } = usePaginatedList<AlertOut>();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<Record<string, string>>({});

  useEffect(() => {
    load("/alerts");
  }, [load]);

  async function handleStatusUpdate(id: string, status: string) {
    setUpdatingId(id);
    setActionFeedback({});
    try {
      await updateAlert(id, { status });
      await load("/alerts");
      setActionFeedback({ [id]: `→ ${status}` });
    } catch {
      setActionFeedback({ [id]: "Failed" });
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this alert?")) return;
    setUpdatingId(id);
    try {
      await deleteAlert(id);
      await load("/alerts");
    } catch {
      setActionFeedback({ [id]: "Delete failed" });
    } finally {
      setUpdatingId(null);
    }
  }

  function formatDate(d: string | null | undefined) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function statusBadge(status: string) {
    const map: Record<string, string> = {
      sent: "bg-blue-100 text-blue-800",
      acknowledged: "bg-emerald-100 text-emerald-800",
      no_response: "bg-red-100 text-red-800",
    };
    return map[status] || "bg-stone-100 text-stone-600";
  }

  function alertIcon(alertType: string) {
    switch (alertType) {
      case "critical":
        return <AlertTriangle className="w-3.5 h-3.5 text-red-600" />;
      case "warning":
        return <Bell className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <BellOff className="w-3.5 h-3.5 text-stone-400" />;
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-black font-mono tracking-tight">Alert Management</h1>
        <span className="text-[10px] font-mono font-bold text-stone-500 bg-white border-2 border-stone-900 rounded-xl px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]">
          {items.length} alert{items.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="bg-white border-2 border-stone-900 rounded-2xl overflow-hidden shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-amber-50 border-b-2 border-stone-900">
                <th className="px-4 py-3 text-xs font-mono font-bold text-stone-600 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-stone-600 uppercase tracking-wider">Farmer</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-stone-600 uppercase tracking-wider">Plot</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-stone-600 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-stone-600 uppercase tracking-wider">Message</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-stone-600 uppercase tracking-wider">Channel</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-stone-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-stone-600 uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-stone-600 uppercase tracking-wider w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-stone-400" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-red-600 text-xs font-mono font-bold">
                    {error}
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-stone-400 text-xs font-mono">
                    No alerts found.
                  </td>
                </tr>
              ) : (
                items.map((a) => (
                  <tr key={a.id} className="border-b border-stone-200 last:border-b-0 hover:bg-stone-50 transition">
                    <td className="px-4 py-3 text-xs font-mono text-stone-500 max-w-[80px] truncate">{a.id}</td>
                    <td className="px-4 py-3 text-sm font-mono text-stone-700 max-w-[100px] truncate">{a.farmer_id}</td>
                    <td className="px-4 py-3 text-sm font-mono text-stone-700 max-w-[100px] truncate">{a.plot_id}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-sm font-mono font-bold">
                        {alertIcon(a.alert_type)}
                        {a.alert_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-stone-600 max-w-[200px] truncate">{a.message_text}</td>
                    <td className="px-4 py-3 text-xs font-mono uppercase font-bold">{a.channel}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-mono font-bold rounded-lg uppercase ${statusBadge(a.status)}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-stone-500 whitespace-nowrap">{formatDate(a.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {statusOptions.map((s) => (
                          <button
                            key={s}
                            onClick={() => handleStatusUpdate(a.id, s)}
                            disabled={updatingId === a.id || a.status === s}
                            className={`px-2 py-1 text-[10px] font-mono font-bold border-2 border-stone-900 rounded-lg transition cursor-pointer disabled:opacity-30 ${
                              a.status === s
                                ? "bg-stone-200 text-stone-400"
                                : "bg-white hover:bg-amber-50"
                            }`}
                            title={`Set status to ${s}`}
                          >
                            {s === "acknowledged" ? (
                              <Check className="w-3 h-3 inline-block mr-0.5" />
                            ) : s === "no_response" ? (
                              <X className="w-3 h-3 inline-block mr-0.5" />
                            ) : (
                              <Bell className="w-3 h-3 inline-block mr-0.5" />
                            )}
                            {s.replace("_", " ")}
                          </button>
                        ))}
                        <button
                          onClick={() => handleDelete(a.id)}
                          disabled={updatingId === a.id}
                          className="px-2 py-1 text-[10px] font-mono font-bold border-2 border-red-400 text-red-600 rounded-lg bg-white hover:bg-red-50 transition cursor-pointer disabled:opacity-30"
                          title="Delete"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      {actionFeedback[a.id] && (
                        <div className="mt-1 text-[10px] font-mono font-bold text-stone-500">
                          {actionFeedback[a.id]}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {hasMore && !loading && (
        <div className="mt-4 text-center">
          <button
            onClick={loadMore}
            className="px-6 py-2.5 text-xs font-bold font-mono bg-white text-stone-900 border-2 border-stone-900 rounded-2xl shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] hover:bg-stone-100 transition cursor-pointer"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
