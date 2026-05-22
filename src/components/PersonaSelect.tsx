"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { Info, Search, ChevronDown, Check, User, Boxes, X, ChevronRight } from "lucide-react";
import { PersonaDossier } from "./admin/PersonaDossier";
import { clsx } from "clsx";

export type PersonaOption = { id: string | number; name: string; cluster?: string; role?: string; metadata?: any; has_rag?: boolean; photo_url?: string };

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
        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground-subtle mb-2 px-1 font-brand">
          {labelText}
        </label>
      )}
      
      {/* Trigger Button */}
      <div className="flex gap-2">
        <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={clsx(
              "flex-1 flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground hover:border-primary/30 transition-all group/trigger shadow-sm",
              isOpen && "ring-2 ring-primary/40 border-primary/50"
            )}
        >
            <div className="flex items-center gap-3 truncate">
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center border border-primary/20 group-hover/trigger:bg-primary/20 transition-colors">
                    {selectedPersona?.photo_url ? (
                        <img src={selectedPersona.photo_url} alt={selectedPersona.name} className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-4 h-4 text-primary" />
                    )}
                </div>
                <div className="flex flex-col items-start truncate font-brand">
                    <span className="font-bold truncate tracking-tight max-w-[180px] md:max-w-[240px]">
                        {selectedPersona ? selectedPersona.name : "Seleccionar Persona..."}
                    </span>
                    {selectedPersona && (
                        <span className="text-[10px] text-foreground-muted font-medium uppercase tracking-widest truncate">
                            {selectedPersona.cluster} • {selectedPersona.role}
                        </span>
                    )}
                </div>
            </div>
            <ChevronDown className={clsx("w-4 h-4 text-foreground-subtle group-hover/trigger:text-foreground-muted transition-all", isOpen && "rotate-180 text-primary")} />
        </button>

        {selectedPersona && (
            <button
                type="button"
                onClick={(e) => handleOpenDossier(e, selectedPersona.id)}
                disabled={loadingDossier}
                className="p-4 bg-surface border border-border rounded-xl text-foreground-muted hover:text-primary hover:border-primary/30 transition-all flex items-center justify-center shadow-sm"
                title="Dossier Completo"
            >
                {loadingDossier ? <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : <Info className="w-5 h-5" />}
            </button>
        )}
      </div>

      {/* Command Palette Overlay */}
      {isOpen && (
        <div className="absolute z-[100] mt-3 w-screen max-w-[90vw] md:w-[600px] bg-background border border-border rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            
            {/* Header: Scope + Search */}
            <div className="p-6 border-b border-border bg-surface/30 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-[0.3em] font-brand">
                        <Boxes className="w-3.5 h-3.5" />
                        Intelligence Hub
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-surface-hover rounded-lg text-foreground-subtle hover:text-foreground transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                    {/* Scope Selector */}
                    <div className="relative flex-shrink-0">
                        <select 
                            value={scope}
                            onChange={(e) => setScope(e.target.value)}
                            className="appearance-none bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest px-4 pr-10 py-3 rounded-xl focus:outline-none hover:bg-primary/20 transition-all cursor-pointer w-full md:w-auto font-brand"
                        >
                            <option value="all">Global Scope</option>
                            {clusters.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-primary pointer-events-none" />
                    </div>

                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Buscar por nombre, rol o característica..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-surface border border-border rounded-xl pl-12 pr-4 py-3 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-body"
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
                                    <div className="h-[1px] flex-1 bg-border/50"></div>
                                    <span className="text-[9px] font-bold text-foreground-subtle uppercase tracking-[0.2em] font-brand">{cluster}</span>
                                    <div className="h-[1px] flex-1 bg-border/50"></div>
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
                                                    "group/item relative p-3 rounded-2xl transition-all border",
                                                    !isReady ? "bg-surface/40 border-border cursor-not-allowed opacity-60" : "cursor-pointer",
                                                    isReady && (value === opt.id 
                                                        ? "bg-primary/10 border-primary/30 shadow-sm" 
                                                        : "bg-surface/20 border-border/50 hover:bg-surface-hover hover:border-border")
                                                )}
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center border border-primary/20 flex-shrink-0">
                                                            {opt.photo_url ? (
                                                                <img src={opt.photo_url} alt={opt.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <User className="w-5 h-5 text-primary" />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col min-w-0 font-brand">
                                                            <div className="flex items-center gap-2">
                                                                <span className={clsx("text-sm font-bold truncate tracking-tight", isReady && value === opt.id ? "text-primary" : "text-foreground")}>
                                                                    {opt.name}
                                                                </span>
                                                                {!isReady && (
                                                                    <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[8px] font-bold text-amber-500 uppercase tracking-widest">
                                                                        Training
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] text-foreground-muted font-medium italic truncate font-body">
                                                                {isReady ? opt.role : "Intelligence syncing..."}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        {isReady && value === opt.id ? (
                                                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/50 animate-scale-in text-white">
                                                                <Check className="w-3 h-3" />
                                                            </div>
                                                        ) : isReady ? (
                                                            <ChevronRight className="w-3.5 h-3.5 text-foreground-subtle transition-transform group-hover/item:translate-x-1 group-hover/item:text-primary" />
                                                        ) : (
                                                            <Info className="w-3.5 h-3.5 text-foreground-subtle" />
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
                            <Search className="w-12 h-12 text-foreground-subtle mb-4" />
                            <p className="text-xs font-bold uppercase tracking-widest text-foreground-muted font-brand">Sin resultados en este scope</p>
                        </div>
                    )}
                </div>

                {/* Footer Status */}
                <div className="p-4 border-t border-border bg-surface/30 flex items-center justify-between px-6">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-[9px] font-bold text-foreground-muted uppercase tracking-widest font-brand">{options?.length || 0} Intelligence Profiles</span>
                        </div>
                    </div>
                    <div className="text-[9px] text-foreground-subtle font-bold font-brand">
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
