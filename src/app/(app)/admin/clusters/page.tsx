"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { isAdminRole } from "@/lib/rbac";
import { useI18n } from "@/components/i18n/I18nProvider";
import { clsx } from "clsx";
import { Search, Plus, ArrowUpDown, Pencil, Trash2, Loader2, Filter, ChevronDown, LayoutGrid, Save, X, ArrowLeft } from "lucide-react";
import Link from "next/link";

type ClusterRecord = {
  id: string;
  name: string;
  description: string;
  updated_at: string;
};

export default function AdminClustersPage() {
  const { t, formatDate } = useI18n();
  const { data: session, status } = useSession();
  const isAdmin = useMemo(() => isAdminRole(session?.user?.roles), [session?.user?.roles]);

  // Data states
  const [clusters, setClusters] = useState<ClusterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Interaction states
  const [isAddingCluster, setIsAddingCluster] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createId, setCreateId] = useState("");
  const [createDescription, setCreateDescription] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const loadData = async () => {
    try {
      const res = await fetch("/api/admin/clusters");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setClusters(data.clusters || []);
    } catch (err: any) {
      setError("Error al cargar los clusters.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && isAdmin) {
      void loadData();
    }
  }, [status, isAdmin]);

  const handleCreateCluster = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/clusters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: createId || createName.toLowerCase().replace(/\s+/g, '-'),
          name: createName,
          description: createDescription
        }),
      });
      if (!response.ok) throw new Error("Failed to create");
      setCreateName("");
      setCreateId("");
      setCreateDescription("");
      setIsAddingCluster(false);
      await loadData();
    } catch (err: any) {
      setError("No se pudo crear el cluster.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCluster = async (id: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/clusters/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editValue, description: editDesc }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setEditingId(null);
      await loadData();
    } catch (err) {
      setError("No se pudo actualizar el cluster.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCluster = async (id: string, name: string) => {
    if (name === "General") {
        alert("El cluster 'General' es un sistema central y no puede ser eliminado.");
        return;
    }
    if (!window.confirm(`¿Estás seguro de eliminar el cluster "${name}"? Todas las personas asociadas se moverán a "General".`)) return;
    try {
      await fetch(`/api/admin/clusters/${id}`, { method: "DELETE" });
      await loadData();
    } catch (err: any) {
      setError("No se pudo eliminar.");
    }
  };

  if (status === "loading") {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-sm text-zinc-500 animate-pulse font-medium tracking-widest uppercase text-center">IntelAgent Systems Loading...</p>
        </div>
    );
  }

  if (!session?.user || !isAdmin) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center backdrop-blur-md mt-10">
        <h1 className="text-2xl font-bold text-red-200">Acceso Restringido</h1>
        <p className="mt-2 text-zinc-400">Esta terminal está reservada para el protocolo de administración.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4">
      {/* High-Performance Header */}
      <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
                <Link href="/admin/personas" className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-zinc-500 hover:text-white">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <h1 className="text-2xl font-black text-white tracking-tighter uppercase">Cluster Management</h1>
            </div>
            <div className="flex items-center gap-2 ml-8">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <p className="text-[10px] text-zinc-500 font-black tracking-[0.2em] uppercase">Relational Hierarchy Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
                onClick={() => setIsAddingCluster(true)}
                className="rounded-xl h-10 px-6 font-bold shadow-lg shadow-indigo-500/20"
            >
                <Plus className="w-4 h-4 mr-2" />
                Add Cluster
            </Button>
          </div>
        </div>
      </div>

      {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400 text-sm">
              <X className="w-4 h-4" />
              {error}
              <button onClick={() => setError(null)} className="ml-auto text-red-400/50 hover:text-red-400">Close</button>
          </div>
      )}

      {/* Modern High-Density Table */}
      <section className="bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-white/[0.03] border-b border-white/10">
                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">ID (System)</th>
                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Display Name</th>
                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Description</th>
                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {loading ? (
                        [1,2,3].map(i => (
                            <tr key={i} className="animate-pulse">
                                <td colSpan={4} className="px-6 py-8"><div className="h-4 bg-white/5 rounded-full w-full" /></td>
                            </tr>
                        ))
                    ) : clusters.map((c) => (
                        <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-6 py-4">
                                <span className="text-xs font-mono text-zinc-500">{c.id}</span>
                            </td>
                            <td className="px-6 py-4">
                                {editingId === c.id ? (
                                    <input 
                                        autoFocus
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="bg-indigo-500/10 border-b border-indigo-500/50 text-sm font-bold text-white outline-none w-full py-0.5"
                                    />
                                ) : (
                                    <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">{c.name}</span>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                {editingId === c.id ? (
                                    <input 
                                        value={editDesc}
                                        onChange={(e) => setEditDesc(e.target.value)}
                                        className="bg-white/5 border-b border-white/20 text-xs text-zinc-400 outline-none w-full py-0.5"
                                    />
                                ) : (
                                    <span className="text-xs text-zinc-500">{c.description || "No description provided."}</span>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex justify-end gap-1">
                                    {editingId === c.id ? (
                                        <>
                                            <button onClick={() => handleUpdateCluster(c.id)} title="Save" className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all">
                                                <Save className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setEditingId(null)} title="Cancel" className="p-2 text-zinc-500 hover:bg-white/10 rounded-xl transition-all">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => { setEditingId(c.id); setEditValue(c.name); setEditDesc(c.description || ""); }} title="Edit" className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteCluster(c.id, c.name)} 
                                                title="Delete" 
                                                disabled={c.name === 'General'}
                                                className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-20 disabled:hover:bg-transparent"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </section>

      {/* Add Cluster Modal */}
      {isAddingCluster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#09090b] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-8 space-y-6">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Initialize Cluster</h2>
                    <p className="text-sm text-zinc-500">Group personas by strategic industry or goal.</p>
                </div>
                <form onSubmit={handleCreateCluster} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Display Name</label>
                        <input 
                            type="text" 
                            required
                            value={createName} 
                            onChange={(e) => setCreateName(e.target.value)} 
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 transition-colors" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">System ID (Optional)</label>
                        <input 
                            type="text" 
                            value={createId} 
                            onChange={(e) => setCreateId(e.target.value.toLowerCase().replace(/\s+/g, '-'))} 
                            placeholder="e.g. real-estate"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-400 font-mono outline-none focus:border-indigo-500/50 transition-colors" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Description</label>
                        <textarea 
                            value={createDescription} 
                            onChange={(e) => setCreateDescription(e.target.value)} 
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 transition-colors resize-none" 
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button type="button" onClick={() => setIsAddingCluster(false)} className="flex-1 h-12 rounded-xl border border-white/10 bg-transparent hover:bg-white/5 text-white shadow-none">Cancel</Button>
                        <Button type="submit" disabled={submitting} className="flex-1 h-12 rounded-xl shadow-indigo-500/20 shadow-lg">Create Cluster</Button>
                    </div>
                </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
