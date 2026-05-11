"use client";

import { useMemo, useState } from "react";
import { Filter } from 'lucide-react';
import { useI18n } from "@/components/i18n/I18nProvider";
import { PersonaOption } from "./types";
import { PersonaCard } from "@/components/ui/PersonaCard";
import { clsx } from "clsx";

interface PersonaSectionProps {
  personas: PersonaOption[];
  personaType: string | number;
  setPersonaType: (val: string | number) => void;
  onContinue: () => void;
  onViewDossier: (id: string | number) => void;
}

export function PersonaSection({
  personas,
  personaType,
  setPersonaType,
  onContinue,
  onViewDossier,
}: PersonaSectionProps) {
  const { t } = useI18n();
  const [selectedCluster, setSelectedCluster] = useState<string>("all");

  const clusters = useMemo(() => {
    const clusterSet = new Set<string>();
    personas.forEach(p => clusterSet.add(p.cluster || "General"));
    return Array.from(clusterSet).sort();
  }, [personas]);

  const groupedPersonas = useMemo(() => {
    const groups: Record<string, PersonaOption[]> = {};
    
    const source = selectedCluster === "all" 
      ? personas 
      : personas.filter(p => (p.cluster || "General") === selectedCluster);

    source.forEach(p => {
      const c = p.cluster || "General";
      if (!groups[c]) groups[c] = [];
      groups[c].push(p);
    });

    return groups;
  }, [personas, selectedCluster]);

  const handleViewDossier = (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    onViewDossier(id);
  };

  return (
    <div className="space-y-16 animate-fade-in">
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-1">
          <Filter className="w-3.5 h-3.5 text-indigo-400/50" />
          <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
            Scope Selection
          </label>
        </div>
        
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setSelectedCluster("all")}
            className={clsx(
              "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
              selectedCluster === "all"
                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                : "bg-white/5 border-white/5 text-white/30 hover:bg-white/10 hover:text-white/50"
            )}
          >
            {t("stress.identity.all_clusters")}
          </button>
          {clusters.map(cluster => (
            <button
              key={cluster}
              onClick={() => setSelectedCluster(cluster)}
              className={clsx(
                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                selectedCluster === cluster
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                  : "bg-white/5 border-white/5 text-white/30 hover:bg-white/10 hover:text-white/50"
              )}
            >
              {cluster.replace("-", " & ")}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-12">
        {Object.entries(groupedPersonas).map(([cluster, clusterPersonas]) => (
          <div key={cluster} className="space-y-6">
            <div className="flex items-center gap-4 px-1">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400/40 whitespace-nowrap">
                {cluster.replace("-", " & ")}
              </span>
              <div className="h-px w-full bg-white/5" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {clusterPersonas.map((p) => (
                <PersonaCard
                  key={p.id}
                  persona={p}
                  isSelected={personaType === p.id}
                  onSelect={setPersonaType}
                  onViewDossier={handleViewDossier}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-12 border-t border-white/5 bg-gradient-to-t from-white/[0.01] to-transparent -mx-6 px-6 pb-6">
        <button
          onClick={onContinue}
          disabled={!personaType}
          className="md:w-auto w-full px-12 py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-white/10 text-white font-black text-xs tracking-[0.3em] uppercase transition-all shadow-[0_20px_40px_rgba(79,70,229,0.2)] active:scale-95 disabled:shadow-none"
        >
          {t("stress.identity.continue")}
        </button>
      </div>
    </div>
  );
}
