import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Check, Loader2 } from "lucide-react";
import {
  listOfficers,
  createOfficer,
  updateOfficer,
  deleteOfficer,
} from "../../api/endpoints/admin";
import type { OfficerOut, OfficerCreate, OfficerUpdate } from "../../api/types";

const emptyForm: OfficerCreate = { uid: "", name: "", role: "officer", ward_id: null };

export default function Officers() {
  const [items, setItems] = useState<OfficerOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<OfficerCreate>({ ...emptyForm });

  async function fetchItems() {
    setLoading(true);
    setError(null);
    try {
      const data = await listOfficers();
      setItems(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
  }, []);

  function resetForm() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setAdding(false);
  }

  function startEdit(o: OfficerOut) {
    setForm({
      uid: o.uid,
      name: o.name,
      role: o.role,
      ward_id: o.ward_id ?? null,
    });
    setEditingId(o.uid);
    setAdding(false);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      if (editingId) {
        const payload: OfficerUpdate = {
          name: form.name,
          role: form.role,
          ward_id: form.ward_id || null,
        };
        await updateOfficer(editingId, payload);
      } else {
        await createOfficer(form);
      }
      resetForm();
      await fetchItems();
    } catch {
      // handled
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(uid: string) {
    if (!window.confirm("Delete this officer?")) return;
    try {
      await deleteOfficer(uid);
      await fetchItems();
    } catch {
      // handled
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
        <h1 className="text-lg font-black font-mono tracking-tight">Officers</h1>
        <button
          onClick={() => {
            resetForm();
            setAdding(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold font-mono bg-amber-50 text-stone-900 border-2 border-stone-900 rounded-2xl shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] hover:bg-amber-100 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Officer
        </button>
      </div>

      {adding || editingId ? (
        <div className="mb-6 bg-white border-2 border-stone-900 rounded-2xl p-4 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] font-mono font-bold text-stone-600 mb-1">UID</label>
            <input
              value={form.uid}
              onChange={(e) => setForm({ ...form, uid: e.target.value })}
              placeholder="Firebase UID"
              disabled={!!editingId}
              className="w-full px-3 py-2 text-sm border-2 border-stone-900 rounded-xl bg-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:bg-stone-100 disabled:text-stone-400"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] font-mono font-bold text-stone-600 mb-1">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full name"
              className="w-full px-3 py-2 text-sm border-2 border-stone-900 rounded-xl bg-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div className="flex-1 min-w-[100px]">
            <label className="block text-[10px] font-mono font-bold text-stone-600 mb-1">Role</label>
            <input
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="officer"
              className="w-full px-3 py-2 text-sm border-2 border-stone-900 rounded-xl bg-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] font-mono font-bold text-stone-600 mb-1">Ward ID</label>
            <input
              value={form.ward_id ?? ""}
              onChange={(e) => setForm({ ...form, ward_id: e.target.value || null })}
              placeholder="Optional ward"
              className="w-full px-3 py-2 text-sm border-2 border-stone-900 rounded-xl bg-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div className="flex gap-2 pt-5">
            <button
              onClick={handleSubmit}
              disabled={submitting || !form.uid.trim() || !form.name.trim()}
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
                <th className="px-4 py-3 text-xs font-mono font-bold text-stone-600 uppercase tracking-wider">UID</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-stone-600 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-stone-600 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-stone-600 uppercase tracking-wider">Ward ID</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-stone-600 uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-stone-600 uppercase tracking-wider w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-stone-400" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-red-600 text-xs font-mono font-bold">
                    {error}
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-stone-400 text-xs font-mono">
                    No officers found.
                  </td>
                </tr>
              ) : (
                items.map((o) => (
                  <tr key={o.uid} className="border-b border-stone-200 last:border-b-0 hover:bg-stone-50 transition">
                    <td className="px-4 py-3 text-sm font-mono text-stone-700 max-w-[140px] truncate">{o.uid}</td>
                    <td className="px-4 py-3 text-sm font-bold font-mono">{o.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-50 border-2 border-stone-900 rounded-lg uppercase">
                        {o.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-stone-500">{o.ward_id ?? "—"}</td>
                    <td className="px-4 py-3 text-xs font-mono text-stone-500">{formatDate(o.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(o)}
                          className="p-1.5 border-2 border-stone-900 rounded-xl hover:bg-amber-50 transition cursor-pointer"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(o.uid)}
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
