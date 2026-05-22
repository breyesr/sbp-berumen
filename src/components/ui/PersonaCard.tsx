"use client";

import React from "react";
import { User, Info, Check, BrainCircuit } from "lucide-react";
import { clsx } from "clsx";
import { PersonaOption } from "../stress-test/types";

interface PersonaCardProps {
  persona: PersonaOption;
  isSelected: boolean;
  onSelect: (id: string | number) => void;
  onViewDossier: (e: React.MouseEvent, id: string | number) => void;
}

export function PersonaCard({
  persona,
  isSelected,
  onSelect,
  onViewDossier,
}: PersonaCardProps) {
  const parts = persona.name.split(" — ");
  const name = parts[0];
  const role = parts[1] || "Decisor";
  const isReady = persona.has_rag !== false; // Default to true if undefined for safety, but usually provided

  return (
    <div
      onClick={() => isReady && onSelect(persona.id)}
      className={clsx(
        "group/card relative flex flex-col p-5 rounded-2xl border transition-all h-full",
        isReady ? "cursor-pointer bg-surface hover:bg-surface-hover" : "cursor-not-allowed bg-surface/40 border-border/50",
        isSelected
          ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/5"
          : isReady ? "border-border hover:border-primary/30" : "opacity-60 grayscale"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        {/* Avatar (Compact) */}
        <div 
          onClick={(e) => { 
            if (isReady) {
                e.stopPropagation(); 
                onViewDossier(e, persona.id); 
            }
          }}
          className={clsx(
            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all overflow-hidden",
            isSelected ? "bg-primary/20 text-primary" : "bg-background border border-border text-foreground-subtle group-hover/card:text-primary group-hover/card:border-primary/30",
            !isReady && "bg-surface-elevated text-foreground-subtle cursor-default",
            isReady && "cursor-pointer hover:ring-2 hover:ring-primary/50"
        )}>
          {persona.photo_url ? (
            <img src={persona.photo_url} alt={name} className="w-full h-full object-cover" />
          ) : isReady ? (
            <User className="w-6 h-6" />
          ) : (
            <BrainCircuit className="w-6 h-6" />
          )}
        </div>

        {/* Action Area */}
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => onViewDossier(e, persona.id)}
            className="p-2.5 rounded-xl bg-background border border-border text-foreground-muted hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all shadow-sm"
            title="Ver Dossier"
          >
            <Info className="w-5 h-5" />
          </button>
          
          {isReady ? (
            <div className={clsx(
                "w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-all",
                isSelected ? "bg-primary scale-100 rotate-0" : "bg-surface scale-0 rotate-12"
            )}>
                <Check className="w-4 h-4 text-primary-foreground stroke-[3px]" />
            </div>
          ) : (
            <div className="px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold text-amber-500 uppercase tracking-widest font-brand">
                Training
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1.5 flex-1">
        <h4 className={clsx(
          "text-base font-bold tracking-tight transition-colors leading-tight truncate font-brand",
          isSelected ? "text-primary" : isReady ? "text-foreground group-hover/card:text-primary" : "text-foreground-subtle"
        )}>
          {name}
        </h4>
        <div className="space-y-1">
          <p className={clsx(
            "text-[10px] font-bold uppercase tracking-[0.2em] font-brand",
            isReady ? "text-primary/80" : "text-foreground-subtle"
          )}>
            {persona.cluster?.replace("-", " & ") || "General"}
          </p>
          <p className={clsx(
            "text-xs italic text-foreground-muted line-clamp-2 leading-relaxed transition-colors font-body",
            isReady && "group-hover/card:text-foreground"
          )}>
            {isReady ? role : "Intelligence training in progress..."}
          </p>
        </div>
      </div>

      {!isReady && (
        <div className="absolute inset-0 bg-background/60 rounded-2xl flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity backdrop-blur-[2px]">
            <div className="bg-surface border border-border p-4 rounded-xl shadow-2xl max-w-[80%] text-center">
                <BrainCircuit className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-1 font-brand">Not Ready</p>
                <p className="text-[9px] text-foreground-muted leading-tight font-body">This persona is currently being synced with its knowledge base.</p>
            </div>
        </div>
      )}
    </div>
  );
}
