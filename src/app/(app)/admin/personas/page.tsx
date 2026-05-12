"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { isAdminRole } from "@/lib/rbac";
import { useI18n } from "@/components/i18n/I18nProvider";
import { PersonaDossier } from "@/components/admin/PersonaDossier";
import { IntelligenceDrawer } from "@/components/admin/IntelligenceDrawer";
import { clsx } from "clsx";
import { Search, Plus, ArrowUpDown, Brain, Pencil, Trash2, FileText, Loader2, Filter, ChevronDown, RefreshCcw, Eye, EyeOff, Power, LayoutGrid } from "lucide-react";
import Link from "next/link";

type PersonaRecord = {
  id: number;
  name: string;
  role: string;
  cluster: string;
  is_active: boolean;
  has_rag: boolean;
  metadata: any;
  context: string;
  updated_at: string;
};

type ClusterRecord = {
  id: string;
  name: string;
};

export default function AdminPersonasPage() {
  const { t, formatDate } = useI18n();
  const { data: session, status } = useSession();
  const isAdmin = useMemo(() => isAdminRole(session?.user?.roles), [session?.user?.roles]);

  // Data states
  const [personas, setPersonas] = useState<PersonaRecord[]>([]);
  const [clusters, setClusters] = useState<ClusterRecord[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  // Interaction states
  const [activePersona, setActivePersona] = useState<PersonaRecord | null>(null);
  const [drawerMode, setDrawerMode] = useState<'train' | 'edit' | null>(null);
  const [viewingDossier, setViewingDossier] = useState<PersonaRecord | null>(null);
  const [editingCell, setEditingCell] = useState<{ id: number, field: 'name' | 'role' } | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleStartEdit = (p: PersonaRecord, field: 'name' | 'role') => {
    setEditingCell({ id: p.id, field });
    setEditValue(p[field] || "");
  };

  const handleBlur = async () => {
    if (editingCell) {
      const persona = personas.find(p => p.id === editingCell.id);
      if (persona && editValue !== persona[editingCell.field]) {
        await handleInlineUpdate(editingCell.id, { [editingCell.field]: editValue });
      }
      setEditingCell(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };
  
  // Filter/Sort states
  const [searchQuery, setSearchBar] = useState("");
  const [filterCluster, setFilterCluster] = useState("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"name" | "updated_at">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Create Modal state
  const [isAddingPersona, setIsAddingPersona] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createRole, setCreateRole] = useState("");
  const [createCluster, setCreateCluster] = useState("General");

  // Derive clusters from personas as a fallback
  const availableClusters = useMemo(() => {
    const fromDb = (clusters || []).map(c => c.name);
    const fromPersonas = (personas || []).map(p => p.cluster);
    const unique = Array.from(new Set([...fromDb, ...fromPersonas])).filter(Boolean).sort();
    return unique.length > 0 ? unique : ["General"];
  }, [clusters, personas]);

  const loadData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        fetch("/api/admin/personas"),
        fetch("/api/admin/clusters")
      ]);
      const pData = await pRes.json();
      const cData = await cRes.json();
      
      if (!pRes.ok) throw new Error(pData.error);
      setPersonas(pData.personas);
      setClusters(cData.clusters || []);
    } catch (err: any) {
      setError(t("admin.personas.error.load"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && isAdmin) {
      void loadData();
    }
  }, [status, isAdmin]);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/personas/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(`Sincronización exitosa: ${data.migrated.length} personas actualizadas.`);
      await loadData();
    } catch (err: any) {
      setError("Fallo en la sincronización: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleCreatePersona = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/personas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName,
          role: createRole,
          cluster: createCluster,
          metadata: { pains: [], goals: [], channels: [], quotes: [] }
        }),
      });
      if (!response.ok) throw new Error("Failed to create");
      setCreateName("");
      setCreateRole("");
      setIsAddingPersona(false);
      await loadData();
    } catch (err: any) {
      setError(t("admin.personas.error.create"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async (updatedData: any) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/personas/${updatedData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error("Failed to save");
      setDrawerMode(null);
      await loadData();
    } catch (err) {
      setError("No se pudo guardar los cambios.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePersona = async (id: string | number, name: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar a ${name}?`)) return;
    try {
      await fetch(`/api/admin/personas/${id}`, { method: "DELETE" });
      await loadData();
    } catch (err: any) {
      setError("No se pudo eliminar.");
    }
  };

  const handleToggleStatus = async (id: string | number, currentStatus: boolean) => {
    await handleInlineUpdate(id, { is_active: !currentStatus });
  };

  const handleInlineUpdate = async (id: string | number, updates: any) => {
    // Optimistic update for immediate feedback
    const originalPersonas = [...personas];
    setPersonas(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    
    try {
      const res = await fetch(`/api/admin/personas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }
      
      console.log(`[Admin] Persona ${id} updated successfully:`, updates);
    } catch (err: any) {
      setError(`Error al actualizar: ${err.message}`);
      // Revert on failure
      setPersonas(originalPersonas);
    }
  };

  const filteredPersonas = useMemo(() => {
    let result = [...personas];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || (p.role || "").toLowerCase().includes(q));
    }
    if (filterCluster !== "all") {
      result = result.filter(p => p.cluster === filterCluster);
    }
    if (filterStatus !== "all") {
      result = result.filter(p => filterStatus === "active" ? p.is_active : !p.is_active);
    }
    result.sort((a, b) => {
      const valA = a[sortBy] || "";
      const valB = b[sortBy] || "";
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [personas, searchQuery, filterCluster, sortBy, sortOrder]);

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
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase">Intelligence Factory</h1>
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-zinc-500 font-black tracking-[0.2em] uppercase">Control Center Active</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {/* Sync Button */}
             <Button 
                onClick={handleSync}
                disabled={syncing}
                className="rounded-xl h-10 border-white/10 bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white transition-all shadow-none border"
                title="Sincronizar con archivos del repositorio"
            >
                {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                <span className="ml-2 hidden md:inline">Sincronizar DB</span>
            </Button>

             {/* Search */}
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchBar(e.target.value)}
                    placeholder="Search agents..."
                    className="bg-black/20 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500/40 w-48 md:w-64 transition-all"
                />
            </div>
            
            <div className="relative group">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="bg-black/20 border border-white/10 rounded-xl pl-9 pr-10 py-2.5 text-xs text-zinc-300 outline-none hover:border-white/20 transition-colors appearance-none cursor-pointer w-full md:w-auto"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
            </div>

            <div className="relative group">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <select
                    value={filterCluster}
                    onChange={(e) => setFilterCluster(e.target.value)}
                    className="bg-black/20 border border-white/10 rounded-xl pl-9 pr-10 py-2.5 text-xs text-zinc-300 outline-none hover:border-white/20 transition-colors appearance-none cursor-pointer w-full md:w-auto"
                >
                    <option value="all">All Clusters</option>
                    {availableClusters.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
            </div>

            <Link href="/admin/clusters">
                <Button 
                    className="rounded-xl h-10 border-white/10 bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white transition-all shadow-none border"
                >
                    <LayoutGrid className="w-4 h-4 mr-2" />
                    <span className="hidden md:inline">Clusters</span>
                </Button>
            </Link>

            <Button 
                onClick={() => setIsAddingPersona(true)}
                className="rounded-xl h-10 px-6 font-bold shadow-lg shadow-indigo-500/20"
            >
                <Plus className="w-4 h-4 mr-2" />
                Add Agent
            </Button>
          </div>
        </div>
      </div>

      {/* Modern High-Density Table */}
      <section className="bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-white/[0.03] border-b border-white/10">
                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors" onClick={() => { setSortBy("name"); setSortOrder(sortOrder === "asc" ? "desc" : "asc"); }}>
                            <div className="flex items-center gap-2">
                                Agent Name
                                <ArrowUpDown className="w-3 h-3" />
                            </div>
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Intelligence</th>
                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Cluster</th>
                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Core Role</th>
                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors" onClick={() => { setSortBy("updated_at"); setSortOrder(sortOrder === "asc" ? "desc" : "asc"); }}>
                            <div className="flex items-center gap-2">
                                Last Sync
                                <ArrowUpDown className="w-3 h-3" />
                            </div>
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {loading ? (
                        [1,2,3,4,5].map(i => (
                            <tr key={i} className="animate-pulse">
                                <td colSpan={7} className="px-6 py-8"><div className="h-4 bg-white/5 rounded-full w-full" /></td>
                            </tr>
                        ))
                    ) : filteredPersonas.map((p) => (
                        <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-6 py-4">
                                {editingCell?.id === p.id && editingCell?.field === 'name' ? (
                                    <input
                                        autoFocus
                                        type="text"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onBlur={handleBlur}
                                        onKeyDown={handleKeyDown}
                                        className="bg-indigo-500/10 border-b border-indigo-500/50 text-sm font-bold text-white outline-none w-full py-0.5"
                                    />
                                ) : (
                                    <div 
                                        onClick={() => handleStartEdit(p, 'name')}
                                        className="flex flex-col cursor-pointer hover:bg-white/5 rounded px-1 -ml-1 transition-colors"
                                    >
                                        <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">{p.name}</span>
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <div className={clsx(
                                    "flex items-center gap-2 px-2.5 py-1 rounded-full border transition-all w-fit",
                                    p.has_rag 
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                )}>
                                    <Brain className="w-3 h-3" />
                                    <span className="text-[9px] font-black tracking-widest uppercase">
                                        {p.has_rag ? "Ready" : "Training"}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <button 
                                    onClick={() => handleToggleStatus(p.id, p.is_active)}
                                    className={clsx(
                                        "flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all",
                                        p.is_active 
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" 
                                            : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20 hover:bg-zinc-500/20 opacity-60"
                                    )}
                                >
                                    {p.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                    <span className="text-[9px] font-black tracking-widest uppercase">{p.is_active ? "Active" : "Disabled"}</span>
                                </button>
                            </td>
                            <td className="px-6 py-4">
                                <div className="relative group/select">
                                    <select
                                        value={p.cluster}
                                        onChange={(e) => handleInlineUpdate(p.id, { cluster: e.target.value })}
                                        className="appearance-none bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/40 px-2.5 py-1 pr-7 rounded-full text-[9px] font-black tracking-widest uppercase cursor-pointer transition-all outline-none"
                                    >
                                        {availableClusters.map(c => (
                                            <option key={c} value={c} className="bg-[#09090b] text-white lowercase tracking-normal font-sans">
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-indigo-400/50 pointer-events-none group-hover/select:text-indigo-400" />
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {editingCell?.id === p.id && editingCell?.field === 'role' ? (
                                    <input
                                        autoFocus
                                        type="text"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onBlur={handleBlur}
                                        onKeyDown={handleKeyDown}
                                        className="bg-indigo-500/10 border-b border-indigo-500/50 text-sm font-medium italic text-zinc-300 outline-none w-full py-0.5"
                                    />
                                ) : (
                                    <div 
                                        onClick={() => handleStartEdit(p, 'role')}
                                        className="cursor-pointer hover:bg-white/5 rounded px-1 -ml-1 transition-colors"
                                    >
                                        <span className="text-sm text-zinc-400 font-medium italic">{p.role || "—"}</span>
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-[11px] text-zinc-500 font-medium">{formatDate(p.updated_at)}</span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex justify-end gap-1">
                                    <button onClick={() => setViewingDossier(p)} title="Dossier" className="p-2 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all">
                                        <FileText className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => { setActivePersona(p); setDrawerMode('train'); }} title="Entrenar" className="p-2 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all">
                                        <Brain className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => { setActivePersona(p); setDrawerMode('edit'); }} title="Editar" className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeletePersona(p.id, p.name)} title="Borrar" className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {!loading && filteredPersonas.length === 0 && (
                <div className="py-20 text-center space-y-3">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                        <Search className="w-5 h-5 text-zinc-600" />
                    </div>
                    <p className="text-zinc-500 text-sm font-medium tracking-tight">No intelligence nodes found for current parameters.</p>
                </div>
            )}
        </div>
      </section>

      {/* Modals & Drawer */}
      {isAddingPersona && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#09090b] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-8 space-y-6">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Add Cognitive Agent</h2>
                    <p className="text-sm text-zinc-500">Initialize a new persona in the factory.</p>
                </div>
                <form onSubmit={handleCreatePersona} className="space-y-5">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Nombre</label>
                            <span className="text-[9px] text-zinc-600 font-bold">{createName.length}/40</span>
                        </div>
                        <input 
                            type="text" 
                            value={createName} 
                            onChange={(e) => setCreateName(e.target.value.slice(0, 40))} 
                            maxLength={40}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 transition-colors" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Cluster</label>
                        <div className="relative">
                            <select
                                value={createCluster}
                                onChange={(e) => setCreateCluster(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 transition-colors appearance-none"
                            >
                                {availableClusters.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button type="button" onClick={() => setIsAddingPersona(false)} className="flex-1 h-12 rounded-xl border border-white/10 bg-transparent hover:bg-white/5 text-white shadow-none">Cancel</Button>
                        <Button type="submit" disabled={submitting} className="flex-1 h-12 rounded-xl shadow-indigo-500/20 shadow-lg">Initialize</Button>
                    </div>
                </form>
            </div>
          </div>
        </div>
      )}

      {viewingDossier && <PersonaDossier persona={viewingDossier} onClose={() => setViewingDossier(null)} />}
      {activePersona && drawerMode && (
          <IntelligenceDrawer 
            key={`${activePersona.id}-${drawerMode}`}
            persona={activePersona}
            clusters={availableClusters.map(name => ({ id: name, name }))}
            mode={drawerMode}
            onClose={() => { setActivePersona(null); setDrawerMode(null); }}
            onSave={handleSaveEdit}
            onUploadSuccess={loadData}
            submitting={submitting}
          />
      )}
    </div>
  );
}
