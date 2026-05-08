"use client";

import React from "react";
import { User, Info, Check } from "lucide-react";
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

  return (
    <div
      onClick={() => onSelect(persona.id)}
      className={clsx(
        "group relative flex flex-col p-5 rounded-2xl border transition-all cursor-pointer h-full",
        "bg-white/[0.02] hover:bg-white/[0.04]",
        isSelected
          ? "border-indigo-500/50 bg-indigo-500/5 shadow-[0_0_30px_rgba(79,70,229,0.1)]"
          : "border-white/5 hover:border-white/10"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        {/* Avatar (Compact) */}
        <div className={clsx(
          "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
          isSelected ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5 text-white/20 group-hover:bg-white/40"
        )}>
          <User className="w-6 h-6" />
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
          <div className={clsx(
            "w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-all",
            isSelected ? "bg-indigo-600 scale-100 rotate-0" : "bg-white/5 scale-0 rotate-12"
          )}>
            <Check className="w-4 h-4 text-white stroke-[3px]" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1.5 flex-1">
        <h4 className={clsx(
          "text-base font-bold tracking-tight transition-colors leading-tight",
          isSelected ? "text-white" : "text-zinc-300 group-hover:text-white"
        )}>
          {name}
        </h4>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/80">
            {persona.cluster?.replace("-", " & ") || "General"}
          </p>
          <p className="text-xs italic text-zinc-500 group-hover:text-zinc-400 line-clamp-2 leading-relaxed transition-colors">
            {role}
          </p>
        </div>
      </div>
    </div>
  );
}
