"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { Filter, ChevronDown, ChevronLeft, ChevronRight, User, Sparkles } from 'lucide-react';
import { useI18n } from "@/components/i18n/I18nProvider";
import { PersonaOption, ChallengeLevelOption } from "./types";
import { PersonaCard } from "@/components/ui/PersonaCard";
import { clsx } from "clsx";

interface IdentitySectionProps {
  personas: PersonaOption[];
  personaType: string | number;
  setPersonaType: (val: string | number) => void;
  onContinue: (id?: string | number) => void;
  onViewDossier: (id: string | number) => void;
  // Legacy props for accordion flow
  levels?: ChallengeLevelOption[];
  challengeLevelId?: string;
  setChallengeLevelId?: (id: string) => void;
  confirmTitleKey?: string;
}

function CarouselRow({ personas, personaType, onSelect, onViewDossier }: {
  personas: PersonaOption[];
  personaType: string | number;
  onSelect: (id: string | number) => void;
  onViewDossier: (e: React.MouseEvent, id: string | number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group">
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto snap-x gap-6 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-6 px-6"
      >
        {personas.map((p) => (
          <div key={p.id} className="min-w-[280px] w-[280px] snap-start shrink-0">
            <PersonaCard
              persona={p}
              isSelected={personaType === p.id}
              onSelect={onSelect}
              onViewDossier={onViewDossier}
            />
          </div>
        ))}
      </div>
      
      {/* Floating Buttons */}
      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 w-10 h-10 rounded-full bg-surface border border-border text-foreground-muted hover:text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 hover:scale-105 shadow-lg"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 w-10 h-10 rounded-full bg-surface border border-border text-foreground-muted hover:text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 hover:scale-105 shadow-lg"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

export function IdentitySection({
  personas,
  personaType,
  setPersonaType,
  onContinue,
  onViewDossier,
  levels,
  challengeLevelId,
  setChallengeLevelId,
  confirmTitleKey = "stress.persona.confirm_title",
}: IdentitySectionProps) {
  const { t } = useI18n();
  const [selectedCluster, setSelectedCluster] = useState<string>("all");
  const [confirmPersonaId, setConfirmPersonaId] = useState<string | number | null>(null);

  const clusters = useMemo(() => {
    const clusterSet = new Set<string>();
    personas.forEach(p => clusterSet.add(p.cluster || "General"));
    return Array.from(clusterSet).sort();
  }, [personas]);

  const groupedPersonas = useMemo(() => {
    const groups: Record<string, PersonaOption[]> = {};
    
    // Filter first
    const source = selectedCluster === "all" 
      ? personas 
      : personas.filter(p => (p.cluster || "General") === selectedCluster);

    // Group
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

  const handleSelectPersona = (id: string | number) => {
    setConfirmPersonaId(id);
  };

  const handleConfirm = () => {
    if (confirmPersonaId !== null) {
        setPersonaType(confirmPersonaId);
        onContinue(confirmPersonaId);
        setConfirmPersonaId(null);
    }
  };

  const handleCancel = () => {
    setConfirmPersonaId(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && confirmPersonaId !== null) {
        setConfirmPersonaId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmPersonaId]);

  const confirmPersona = personas.find(p => p.id === confirmPersonaId);

  return (
    <div className="space-y-16 animate-fade-in">
      {/* Header & Cluster Selection */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
            <h2 className="text-3xl font-bold uppercase tracking-tighter text-foreground mb-2 font-brand">
                Elige a tu Persona
            </h2>
            <p className="text-base text-foreground-muted font-medium tracking-wide font-body">
                Selecciona con quién quieres poner a prueba tu idea.
            </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {levels && challengeLevelId && setChallengeLevelId && (
            <div className="relative group min-w-[200px]">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary/50 group-focus-within:text-primary transition-colors">
                <Sparkles className="w-4 h-4" />
              </div>
              <select
                value={challengeLevelId}
                onChange={(e) => setChallengeLevelId(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl pl-10 pr-10 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none cursor-pointer hover:border-primary/50 text-foreground shadow-sm font-brand uppercase tracking-widest"
              >
                {levels.map(level => (
                  <option key={level.id} value={level.id} className="bg-surface text-foreground py-2">
                    {level.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-foreground-subtle group-focus-within:text-primary transition-colors">
                <ChevronDown className="w-4 h-4 stroke-[3px]" />
              </div>
            </div>
          )}

          <div className="relative group min-w-[200px]">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary/50 group-focus-within:text-primary transition-colors">
              <Filter className="w-4 h-4" />
            </div>
            <select
              value={selectedCluster}
              onChange={(e) => setSelectedCluster(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl pl-10 pr-10 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none cursor-pointer hover:border-primary/50 text-foreground shadow-sm font-brand uppercase tracking-widest"
            >
              <option value="all" className="bg-surface text-foreground py-2">{t("stress.identity.all_clusters")}</option>
              {clusters.map(cluster => (
                <option key={cluster} value={cluster} className="bg-surface text-foreground py-2">
                  {cluster.replace("-", " & ")}
                </option>
              ))}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-foreground-subtle group-focus-within:text-primary transition-colors">
              <ChevronDown className="w-4 h-4 stroke-[3px]" />
            </div>
          </div>
        </div>
      </div>

      {/* Grouped Personas */}
      <div className="space-y-12">
        {Object.entries(groupedPersonas).map(([cluster, clusterPersonas]) => (
          <div key={cluster} className="space-y-6">
            <div className="flex items-center gap-4 px-1 group">
              <h3 className="text-xl font-bold tracking-tight text-foreground whitespace-nowrap capitalize font-brand">
                {cluster.replace("-", " & ")}
              </h3>
              <div className="h-px w-full bg-border" />
            </div>

            
            <CarouselRow 
              personas={clusterPersonas}
              personaType={personaType}
              onSelect={handleSelectPersona}
              onViewDossier={handleViewDossier}
            />
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {confirmPersonaId !== null && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-fade-in"
          onClick={handleCancel}
        >
          <div 
            className="bg-surface border border-border rounded-3xl w-full max-w-sm p-8 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {confirmPersona && (
                <div className="flex flex-col items-center gap-4 mb-8">
                    {confirmPersona.photo_url ? (
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/30 shadow-lg">
                            <img src={confirmPersona.photo_url} alt={confirmPersona.name} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center shadow-lg">
                            <User className="w-12 h-12 text-primary/50" />
                        </div>
                    )}
                    <div className="text-center space-y-1 font-brand">
                        <h3 className="text-xl font-bold tracking-tight text-foreground leading-snug whitespace-pre-line">
                            {(() => {
                                const template = t(confirmTitleKey as any);
                                const parts = template.split('{{name}}');
                                return (
                                    <>
                                        {parts[0]}
                                        <span className="text-primary">{confirmPersona.name.split(' — ')[0]}</span>
                                        {parts[1]}
                                    </>
                                );
                            })()}
                        </h3>
                        <p className="text-xs text-foreground-muted mt-2 italic font-body">
                            {confirmPersona.name.split(' — ')[1] || "Decisor"}
                        </p>
                    </div>
                </div>
            )}
            
            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirm}
                className="w-full px-6 py-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm transition-all shadow-md active:scale-95 font-brand uppercase tracking-widest"
              >
                {t("stress.persona.confirm_ok")}
              </button>
              <button
                onClick={handleCancel}
                className="w-full px-6 py-4 rounded-xl bg-background border border-border text-foreground-muted hover:text-foreground font-bold text-sm transition-all font-brand uppercase tracking-widest"
              >
                {t("stress.persona.confirm_cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
