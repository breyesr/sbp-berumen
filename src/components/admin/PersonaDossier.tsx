"use client";

import { X, User, Brain, Target, Zap, MessageSquare, Globe, ShieldAlert, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { isAdminRole } from "@/lib/rbac";

interface PersonaDossierProps {
  persona: any;
  onClose: () => void;
}

export function PersonaDossier({ persona, onClose }: PersonaDossierProps) {
  const { data: session } = useSession();
  const isAdmin = isAdminRole(session?.user?.roles);

  if (!persona) return null;

  const metadata = persona.metadata || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-[#09090b] border border-white/10 rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(79,70,229,0.15)] animate-scale-in">
        
        {/* Header - Executive Style */}
        <div className="p-8 border-b border-white/5 flex items-start justify-between bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent">
          <div className="flex gap-8 items-start">
            {persona.photo_url ? (
              <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-indigo-500/30 shadow-2xl shadow-indigo-500/20 flex-shrink-0">
                <img src={persona.photo_url} alt={persona.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <User className="w-16 h-16 text-indigo-400/50" />
              </div>
            )}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-black tracking-[0.2em] uppercase">
                      {persona.cluster || "General"}
                  </span>
              </div>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase">{persona.name || "Unknown Persona"}</h2>
              <p className="text-zinc-400 text-lg font-medium italic">{persona.role || "Consultor Estratégico"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-colors group">
            <X className="w-8 h-8 text-zinc-500 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Content - Multi-column Executive Summary */}
        <div className="flex-1 overflow-y-auto p-10 space-y-12">
          
          {/* Top Section: Synthesis & Demographics */}
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-2 text-indigo-400">
                    <Sparkles className="w-5 h-5" />
                    <h3 className="text-xs font-black uppercase tracking-[0.3em]">Síntesis Ejecutiva</h3>
                </div>
                <p className="text-xl text-zinc-300 leading-relaxed font-medium">
                    {metadata.strategic_synthesis || metadata.synthesis || "Analizando el núcleo estratégico de esta persona..."}
                </p>
                
                <div className="pt-4 grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Ubicación</span>
                        <span className="text-white font-bold flex items-center gap-2">
                            <Globe className="w-4 h-4 text-indigo-500" />
                            {metadata.city || "Nacional"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-6 bg-white/[0.02] border border-white/5 rounded-3xl p-6">
                <div className="flex items-center gap-2 text-zinc-400">
                    <User className="w-4 h-4" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em]">Demografía</h3>
                </div>
                <ul className="space-y-3">
                    {Array.isArray(metadata.demographics) ? metadata.demographics.map((d: string, i: number) => (
                    <li key={i} className="text-xs text-zinc-400 leading-tight flex gap-2">
                        <span className="text-indigo-500 font-black">•</span> {d}
                    </li>
                    )) : (
                        <li className="text-xs text-zinc-600 italic">No hay datos demográficos disponibles</li>
                    )}
                </ul>
            </div>
          </div>

          {/* Middle Section: Psychographics (Pains & Motivations) */}
          <div className="grid md:grid-cols-2 gap-10">
            <section className="space-y-6">
                <div className="flex items-center gap-2 text-amber-400">
                    <Zap className="w-5 h-5" />
                    <h3 className="text-xs font-black uppercase tracking-[0.3em]">Psicografía: Dolores</h3>
                </div>
                <div className="space-y-3">
                    {(metadata.pains || []).map((p: string, i: number) => (
                    <div key={i} className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-sm text-zinc-300">
                        {p}
                    </div>
                    ))}
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex items-center gap-2 text-emerald-400">
                    <Target className="w-5 h-5" />
                    <h3 className="text-xs font-black uppercase tracking-[0.3em]">Psicografía: Metas</h3>
                </div>
                <div className="space-y-3">
                    {(metadata.goals || []).map((g: string, i: number) => (
                    <div key={i} className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-sm text-zinc-300">
                        {g}
                    </div>
                    ))}
                </div>
            </section>
          </div>

          {/* Bottom Section: Objections & Regional Context */}
          <div className="grid md:grid-cols-2 gap-10 pt-6 border-t border-white/5">
            {isAdmin ? (
              <>
                <section className="space-y-6">
                    <div className="flex items-center gap-2 text-red-400">
                        <ShieldAlert className="w-5 h-5" />
                        <h3 className="text-xs font-black uppercase tracking-[0.3em]">Barreras de Decisión</h3>
                    </div>
                    <ul className="space-y-2">
                        {(metadata.objections || []).map((o: string, i: number) => (
                        <li key={i} className="text-sm text-zinc-400 flex gap-3">
                            <span className="text-red-500 font-black">!</span> {o}
                        </li>
                        ))}
                    </ul>
                </section>

                <section className="space-y-6">
                    <div className="flex items-center gap-2 text-blue-400">
                        <MessageSquare className="w-5 h-5" />
                        <h3 className="text-xs font-black uppercase tracking-[0.3em]">Voz del Cliente</h3>
                    </div>
                    <div className="grid gap-3">
                    {(metadata.quotes || []).map((q: string, i: number) => (
                        <p key={i} className="text-sm italic text-zinc-400 bg-white/[0.03] p-4 rounded-2xl border-l-4 border-indigo-500">
                        "{q}"
                        </p>
                    ))}
                    </div>
                </section>
              </>
            ) : (
              <div className="col-span-full py-10 flex flex-col items-center justify-center space-y-4 bg-white/[0.01] border border-dashed border-white/5 rounded-[2rem]">
                <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-400">
                    <Lock className="w-6 h-6" />
                </div>
                <div className="text-center space-y-1">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Acceso Restringido</p>
                    <p className="text-xs text-zinc-600 font-medium">Contacte a un administrador para acceder al perfil psicográfico avanzado.</p>
                </div>
              </div>
            )}
          </div>
          {/* Advanced Section: Full Strategic Depth (Admin Only) */}
          {isAdmin && (
            <section className="pt-10 border-t border-white/5 space-y-6">
                <details className="group" open={!!persona.context}>
                    <summary className="flex items-center justify-between cursor-pointer list-none">
                        <div className="flex items-center gap-2 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                            <Brain className="w-5 h-5" />
                            <h3 className="text-xs font-black uppercase tracking-[0.3em]">Detalles Estratégicos Avanzados</h3>
                        </div>
                        <span className="text-zinc-500 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="mt-6 p-8 rounded-[2rem] bg-black border border-white/5 text-zinc-500 text-sm leading-relaxed whitespace-pre-line font-mono animate-in fade-in duration-500">
                        {persona.context || "No hay información técnica adicional cargada en el núcleo."}
                    </div>
                </details>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-white/[0.01] flex justify-center">
            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em]">
                IntelAgent Systems • Confidential Persona Dossier
            </p>
        </div>
      </div>
    </div>
  );
}
