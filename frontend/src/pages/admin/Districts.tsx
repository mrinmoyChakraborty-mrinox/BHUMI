import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Check, Loader2 } from "lucide-react";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import {
  listDistricts,
  createDistrict,
  updateDistrict,
  deleteDistrict,
} from "../../api/endpoints/districts";
import type { DistrictOut, DistrictCreate, DistrictUpdate } from "../../api/types";

export default function Districts() {
  const { items, loading, error, load } = usePaginatedList<DistrictOut>();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<DistrictCreate>({ name: "", state: "", notes: "" });

  useEffect(() => {
    load("/districts");
  }, [load]);

  function resetForm() {
    setForm({ name: "", state: "", notes: "" });
    setEditingId(null);
    setAdding(false);
  }

  function startEdit(d: DistrictOut) {
    setForm({ name: d.name, state: d.state ?? "", notes: d.notes ?? "" });
    setEditingId(d.id);
    setAdding(false);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      if (editingId) {
        const payload: DistrictUpdate = {};
        if (form.name !== "") payload.name = form.name;
        if (form.state !== "") payload.state = form.state;
        payload.notes = form.notes || null;
        await updateDistrict(editingId, payload);
      } else {
        await createDistrict(form);
      }
      resetForm();
      await load("/districts");
    } catch {
      // error handled by hook
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this district?")) return;
    try {
      await deleteDistrict(id);
      await load("/districts");
    } catch {
      // error handled by hook
    }
  }

  function formatDate(d: string | null | undefined) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-black font-mono tracking-tight">Districts</h1>
        <button
          onClick={() => {
            resetForm();
            setAdding(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold font-mono bg-amber-50 text-stone-900 border-2 border-stone-900 rounded-2xl shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] hover:bg-amber-100 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add District
        </button>
      </div>

      {adding || editingId ? (
        <div className="mb-6 bg-white border-2 border-stone-900 rounded-2xl p-4 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] font-mono font-bold text-stone-600 mb-1">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="District name"
              className="w-full px-3 py-2 text-sm border-2 border-stone-900 rounded-xl bg-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div className="flex-1 min-w-[100px]">
            <label className="block text-[10px] font-mono font-bold text-stone-600 mb-1">State</label>
            <input
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              placeholder="State"
              className="w-full px-3 py-2 text-sm border-2 border-stone-900 rounded-xl bg-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div className="flex-[2] min-w-[160px]">
            <label className="block text-[10px] font-mono font-bold text-stone-600 mb-1">Notes</label>
            <input
              value={form.notes ?? ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional notes"
              className="w-full px-3 py-2 text-sm border-2 border-stone-900 rounded-xl bg-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div className="flex gap-2 pt-5">
            <button
              onClick={handleSubmit}
              disabled={submitting || !form.name.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold font-mono bg-emerald-600 text-white border-2 border-stone-900 rounded-2xl shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] hover:bg-emerald-700 disabled:opacity-40 transition cursor-pointer"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              {editingId ? "Update" : "Create"}
            </button>
            <button
              onClick={resetForm}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold font-mono bg-white text-stone-900 border-2 border-stone-900 rounded-2xl shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] hover:bg-stone-100 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div className="bg-white border-2 border-stone-900 rounded-2xl overflow-hidden shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-amber-50 border-b-2 border-stone-900">
                <th className="px-4 py-3 text-xs font-mono font-bold text-stone-600 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-stone-600 uppercase tracking-wider">State</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-stone-600 uppercase tracking-wider">Notes</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-stone-600 uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-stone-600 uppercase tracking-wider w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-stone-400" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-red-600 text-xs font-mono font-bold">
                    {error}
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-stone-400 text-xs font-mono">
                    No districts found.
                  </td>
                </tr>
              ) : (
                items.map((d) => (
                  <tr key={d.id} className="border-b border-stone-200 last:border-b-0 hover:bg-stone-50 transition">
                    <td className="px-4 py-3 text-sm font-bold font-mono">{d.name}</td>
                    <td className="px-4 py-3 text-sm font-mono text-stone-700">{d.state || "—"}</td>
                    <td className="px-4 py-3 text-sm font-mono text-stone-500 max-w-[200px] truncate">{d.notes || "—"}</td>
                    <td className="px-4 py-3 text-xs font-mono text-stone-500">{formatDate(d.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(d)}
                          className="p-1.5 border-2 border-stone-900 rounded-xl hover:bg-amber-50 transition cursor-pointer"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="p-1.5 border-2 border-stone-900 rounded-xl hover:bg-red-50 transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
