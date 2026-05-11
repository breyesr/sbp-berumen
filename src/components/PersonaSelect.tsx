"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { Info, Search, ChevronDown, Check, User, Boxes, X, ChevronRight } from "lucide-react";
import { PersonaDossier } from "./admin/PersonaDossier";
import { clsx } from "clsx";

export type PersonaOption = { id: string | number; name: string; cluster?: string; role?: string; metadata?: any; has_rag?: boolean };

type Props = {
  options?: PersonaOption[];
  value: string | number;
  onChange: (id: string | number) => void;
  className?: string;
  labelText?: string;
};

export default function PersonaSelect({ options, value, onChange, className, labelText }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scope, setScope] = useState<string>("all");
  const [viewingDossier, setViewingDossier] = useState<any | null>(null);
  const [loadingDossier, setLoadingDossier] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Grouping & Clusters logic
  const clusters = useMemo(() => {
    const clusterSet = new Set<string>();
    options?.forEach(opt => clusterSet.add(opt.cluster || "General"));
    return Array.from(clusterSet).sort();
  }, [options]);

  const selectedPersona = useMemo(() => 
    options?.find(o => o.id === value), 
    [options, value]
  );

  // Filtered & Grouped results
  const groupedResults = useMemo(() => {
    const filtered = (options ?? []).filter(o => {
      const matchesScope = scope === "all" || (o.cluster || "General") === scope;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        o.name.toLowerCase().includes(q) || 
        (o.role || "").toLowerCase().includes(q) ||
        (o.cluster || "").toLowerCase().includes(q);
      return matchesScope && matchesSearch;
    });

    const groups: Record<string, PersonaOption[]> = {};
    filtered.forEach(o => {
      const c = o.cluster || "General";
      if (!groups[c]) groups[c] = [];
      groups[c].push(o);
    });
    return groups;
  }, [options, scope, searchQuery]);

  // Interaction handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
        searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleOpenDossier = async (e: React.MouseEvent, personaId: string | number) => {
    e.stopPropagation();
    if (loadingDossier) return;
    
    setLoadingDossier(true);
    try {
      const res = await fetch(`/api/personas/${encodeURIComponent(personaId)}`);
      if (!res.ok) throw new Error("Failed to fetch dossier");
      const data = await res.json();
      if (data.persona) {
        setViewingDossier(data.persona);
      }
    } catch (err) {
      console.error("Dossier fetch failed", err);
      // Optional: alert the user or show a toast
    } finally {
      setLoadingDossier(false);
    }
  };

  return (
    <div className={clsx("relative", className)} ref={dropdownRef}>
      {labelText && (
        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 px-1">
          {labelText}
        </label>
      )}
      
      {/* Trigger Button */}
      <div className="flex gap-2">
        <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={clsx(
              "flex-1 flex items-center justify-between bg-[#0f0f10] border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 hover:border-white/20 transition-all group shadow-lg",
              isOpen && "ring-2 ring-indigo-500/40 border-indigo-500/50"
            )}
        >
            <div className="flex items-center gap-3 truncate">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                    <User className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="flex flex-col items-start truncate">
                    <span className="font-bold truncate tracking-tight max-w-[180px] md:max-w-[240px]">
                        {selectedPersona ? selectedPersona.name : "Seleccionar Persona..."}
                    </span>
                    {selectedPersona && (
                        <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest truncate">
                            {selectedPersona.cluster} • {selectedPersona.role}
                        </span>
                    )}
                </div>
            </div>
            <ChevronDown className={clsx("w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-all", isOpen && "rotate-180 text-indigo-400")} />
        </button>

        {selectedPersona && (
            <button
                type="button"
                onClick={(e) => handleOpenDossier(e, selectedPersona.id)}
                disabled={loadingDossier}
                className="p-4 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all flex items-center justify-center shadow-lg"
                title="Dossier Completo"
            >
                {loadingDossier ? <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" /> : <Info className="w-5 h-5" />}
            </button>
        )}
      </div>

      {/* Command Palette Overlay */}
      {isOpen && (
        <div className="absolute z-[100] mt-3 w-screen max-w-[90vw] md:w-[600px] bg-[#09090b] border border-white/10 rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            
            {/* Header: Scope + Search */}
            <div className="p-6 border-b border-white/5 bg-white/[0.02] space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">
                        <Boxes className="w-3.5 h-3.5" />
                        Intelligence Hub
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/5 rounded-lg text-zinc-600 hover:text-zinc-300 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                    {/* Scope Selector */}
                    <div className="relative flex-shrink-0">
                        <select 
                            value={scope}
                            onChange={(e) => setScope(e.target.value)}
                            className="appearance-none bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest px-4 pr-10 py-3 rounded-xl focus:outline-none hover:bg-indigo-500/20 transition-all cursor-pointer w-full md:w-auto"
                        >
                            <option value="all">Global Scope</option>
                            {clusters.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-indigo-500 pointer-events-none" />
                    </div>

                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Buscar por nombre, rol o característica..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/40 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Results Area */}
            <div className="flex flex-col h-[450px]">
                {/* Main List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-6">
                    {Object.keys(groupedResults).length > 0 ? (
                        Object.entries(groupedResults).map(([cluster, personas]) => (
                            <div key={cluster} className="space-y-2">
                                <div className="px-3 flex items-center gap-2">
                                    <div className="h-[1px] flex-1 bg-white/5"></div>
                                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">{cluster}</span>
                                    <div className="h-[1px] flex-1 bg-white/5"></div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {personas.map((opt) => {
                                        const isReady = opt.has_rag !== false;
                                        return (
                                            <div
                                                key={opt.id}
                                                onClick={() => {
                                                    if (!isReady) return;
                                                    onChange(opt.id);
                                                    setIsOpen(false);
                                                }}
                                                className={clsx(
                                                    "group relative p-3 rounded-2xl transition-all border",
                                                    !isReady ? "bg-zinc-900/50 border-white/5 cursor-not-allowed opacity-60" : "cursor-pointer",
                                                    isReady && (value === opt.id 
                                                        ? "bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_20px_rgba(79,70,229,0.1)]" 
                                                        : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10")
                                                )}
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex flex-col min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className={clsx("text-sm font-bold truncate tracking-tight", isReady && value === opt.id ? "text-indigo-400" : "text-zinc-200")}>
                                                                {opt.name}
                                                            </span>
                                                            {!isReady && (
                                                                <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[8px] font-black text-amber-500 uppercase tracking-widest">
                                                                    Training
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] text-zinc-500 font-medium italic truncate">
                                                            {isReady ? opt.role : "Intelligence syncing..."}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        {isReady && value === opt.id ? (
                                                            <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/50 animate-scale-in">
                                                                <Check className="w-3 h-3 text-white" />
                                                            </div>
                                                        ) : isReady ? (
                                                            <ChevronRight className="w-3.5 h-3.5 text-zinc-700 transition-transform group-hover:translate-x-1 group-hover:text-zinc-400" />
                                                        ) : (
                                                            <Info className="w-3.5 h-3.5 text-zinc-800" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-20 opacity-40">
                            <Search className="w-12 h-12 text-zinc-700 mb-4" />
                            <p className="text-xs font-black uppercase tracking-widest">Sin resultados en este scope</p>
                        </div>
                    )}
                </div>

                {/* Footer Status */}
                <div className="p-4 border-t border-white/5 bg-white/[0.02] flex items-center justify-between px-6">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{options?.length || 0} Intelligence Profiles</span>
                        </div>
                    </div>
                    <div className="text-[9px] text-zinc-600 font-medium">
                        {scope === 'all' ? 'Global Core' : `Scoped: ${scope}`}
                    </div>
                </div>
            </div>
        </div>
      )}

      {viewingDossier && (
        <PersonaDossier
          persona={viewingDossier}
          onClose={() => setViewingDossier(null)}
        />
      )}
    </div>
  );
}
