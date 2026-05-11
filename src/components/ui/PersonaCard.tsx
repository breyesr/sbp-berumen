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
        "group relative flex flex-col p-5 rounded-2xl border transition-all h-full",
        isReady ? "cursor-pointer bg-white/[0.02] hover:bg-white/[0.04]" : "cursor-not-allowed bg-zinc-900/50 border-white/5",
        isSelected
          ? "border-indigo-500/50 bg-indigo-500/5 shadow-[0_0_30px_rgba(79,70,229,0.1)]"
          : isReady ? "border-white/5 hover:border-white/10" : "opacity-60 grayscale"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        {/* Avatar (Compact) */}
        <div className={clsx(
          "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
          isSelected ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5 text-white/20 group-hover:bg-white/40",
          !isReady && "bg-zinc-800 text-zinc-600"
        )}>
          {isReady ? <User className="w-6 h-6" /> : <BrainCircuit className="w-6 h-6" />}
        </div>

        {/* Action Area */}
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => onViewDossier(e, persona.id)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all shadow-sm"
            title="Ver Dossier"
          >
            <Info className="w-5 h-5" />
          </button>
          
          {isReady ? (
            <div className={clsx(
                "w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-all",
                isSelected ? "bg-indigo-600 scale-100 rotate-0" : "bg-white/5 scale-0 rotate-12"
            )}>
                <Check className="w-4 h-4 text-white stroke-[3px]" />
            </div>
          ) : (
            <div className="px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-500 uppercase tracking-widest">
                Training
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1.5 flex-1">
        <h4 className={clsx(
          "text-base font-bold tracking-tight transition-colors leading-tight truncate",
          isSelected ? "text-white" : isReady ? "text-zinc-300 group-hover:text-white" : "text-zinc-600"
        )}>
          {name}
        </h4>
        <div className="space-y-1">
          <p className={clsx(
            "text-[10px] font-black uppercase tracking-[0.2em]",
            isReady ? "text-indigo-400/80" : "text-zinc-700"
          )}>
            {persona.cluster?.replace("-", " & ") || "General"}
          </p>
          <p className="text-xs italic text-zinc-500 group-hover:text-zinc-400 line-clamp-2 leading-relaxed transition-colors">
            {isReady ? role : "Intelligence training in progress..."}
          </p>
        </div>
      </div>

      {!isReady && (
        <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
            <div className="bg-zinc-900 border border-white/10 p-3 rounded-xl shadow-2xl max-w-[80%] text-center">
                <BrainCircuit className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Not Ready</p>
                <p className="text-[9px] text-zinc-400 leading-tight">This persona is currently being synced with its knowledge base.</p>
            </div>
        </div>
      )}
    </div>
  );
}
