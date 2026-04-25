"use client";

import { X, FileText, Target, Zap, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PersonaDossierProps {
  persona: any;
  onClose: () => void;
}

export function PersonaDossier({ persona, onClose }: PersonaDossierProps) {
  if (!persona) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111214] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-transparent">
          <div>
            <h2 className="text-2xl font-bold text-white">{persona.name}</h2>
            <p className="text-indigo-300 text-sm font-medium uppercase tracking-wider">{persona.cluster} • {persona.role}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-6 h-6 text-[#71717a]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Strategic Depth */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-400" />
              Profundidad Estratégica
            </h3>
            <div className="prose prose-invert max-w-none text-[#a1a1aa] leading-relaxed bg-white/[0.02] p-6 rounded-xl border border-white/5 whitespace-pre-line">
              {persona.context || "No hay información estratégica adicional."}
            </div>
          </section>

          {/* Metadata Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Dolores (Pains)
              </h4>
              <ul className="space-y-2">
                {(persona.metadata?.pains || []).map((p: string, i: number) => (
                  <li key={i} className="text-sm text-[#a1a1aa] flex gap-2">
                    <span className="text-indigo-500">•</span> {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                Metas (Goals)
              </h4>
              <ul className="space-y-2">
                {(persona.metadata?.goals || []).map((g: string, i: number) => (
                  <li key={i} className="text-sm text-[#a1a1aa] flex gap-2">
                    <span className="text-emerald-500">•</span> {g}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quotes */}
          <section className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              Frases Típicas
            </h4>
            <div className="grid gap-3">
              {(persona.metadata?.quotes || []).map((q: string, i: number) => (
                <p key={i} className="text-sm italic text-indigo-200/70 bg-indigo-500/5 p-3 rounded-lg border-l-2 border-indigo-500">
                  "{q}"
                </p>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0d0e10] flex justify-end">
          <Button onClick={onClose} variant="outline">Cerrar Dossier</Button>
        </div>
      </div>
    </div>
  );
}
