"use client";

import { X, User, Brain, Target, Zap, MessageSquare, Globe, ShieldAlert, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { isAdminRole } from "@/lib/rbac";
import { useEffect } from "react";

interface PersonaDossierProps {
  persona: any;
  onClose: () => void;
}

export function PersonaDossier({ persona, onClose }: PersonaDossierProps) {
  const { data: session } = useSession();
  const isAdmin = isAdminRole(session?.user?.roles);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!persona) return null;

  const metadata = persona.metadata || {};

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-background border border-border rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scale-in">
        
        {/* Header - Executive Style */}
        <div className="p-8 border-b border-border flex items-start justify-between bg-gradient-to-br from-primary/5 via-transparent to-transparent">
          <div className="flex gap-8 items-start">
            {persona.photo_url ? (
              <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-primary/30 shadow-xl flex-shrink-0">
                <img src={persona.photo_url} alt={persona.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <User className="w-16 h-16 text-primary/50" />
              </div>
            )}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold tracking-[0.2em] uppercase font-brand">
                      {persona.cluster || "General"}
                  </span>
              </div>
              <h2 className="text-4xl font-bold text-foreground tracking-tighter uppercase font-brand">{persona.name || "Unknown Persona"}</h2>
              <p className="text-foreground-muted text-lg font-medium italic font-body">{persona.role || "Consultor Estratégico"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-surface-hover rounded-full transition-colors group">
            <X className="w-8 h-8 text-foreground-subtle group-hover:text-foreground transition-colors" />
          </button>
        </div>

        {/* Content - Multi-column Executive Summary */}
        <div className="flex-1 overflow-y-auto p-10 space-y-12">
          
          {/* Top Section: Synthesis & Demographics */}
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-2 text-primary">
                    <Sparkles className="w-5 h-5" />
                    <h3 className="text-xs font-bold uppercase tracking-[0.3em] font-brand">Síntesis Ejecutiva</h3>
                </div>
                <p className="text-xl text-foreground leading-relaxed font-medium font-body">
                    {metadata.strategic_synthesis || metadata.synthesis || "Analizando el núcleo estratégico de esta persona..."}
                </p>
                
                <div className="pt-4 grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-surface border border-border">
                        <span className="text-[10px] font-bold text-foreground-subtle uppercase tracking-widest block mb-2 font-brand">Ubicación</span>
                        <span className="text-foreground font-bold flex items-center gap-2 font-brand">
                            <Globe className="w-4 h-4 text-primary" />
                            {metadata.city || "Nacional"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-6 bg-surface border border-border rounded-3xl p-6">
                <div className="flex items-center gap-2 text-foreground-subtle">
                    <User className="w-4 h-4" />
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] font-brand">Demografía</h3>
                </div>
                <ul className="space-y-3 font-body">
                    {Array.isArray(metadata.demographics) ? metadata.demographics.map((d: string, i: number) => (
                    <li key={i} className="text-xs text-foreground-muted leading-tight flex gap-2">
                        <span className="text-primary font-bold">•</span> {d}
                    </li>
                    )) : (
                        <li className="text-xs text-foreground-subtle italic">No hay datos demográficos disponibles</li>
                    )}
                </ul>
            </div>
          </div>

          {/* Middle Section: Psychographics (Pains & Motivations) */}
          <div className="grid md:grid-cols-2 gap-10">
            <section className="space-y-6">
                <div className="flex items-center gap-2 text-error">
                    <Zap className="w-5 h-5" />
                    <h3 className="text-xs font-bold uppercase tracking-[0.3em] font-brand">Psicografía: Dolores</h3>
                </div>
                <div className="space-y-3">
                    {(metadata.pains || []).map((p: string, i: number) => (
                    <div key={i} className="p-4 rounded-2xl bg-error/5 border border-error/10 text-sm text-foreground-muted font-body">
                        {p}
                    </div>
                    ))}
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex items-center gap-2 text-success">
                    <Target className="w-5 h-5" />
                    <h3 className="text-xs font-bold uppercase tracking-[0.3em] font-brand">Psicografía: Metas</h3>
                </div>
                <div className="space-y-3">
                    {(metadata.goals || []).map((g: string, i: number) => (
                    <div key={i} className="p-4 rounded-2xl bg-success/5 border border-success/10 text-sm text-foreground-muted font-body">
                        {g}
                    </div>
                    ))}
                </div>
            </section>
          </div>

          {/* Bottom Section: Objections & Regional Context (Admin Only) */}
          {isAdmin && (
            <div className="grid md:grid-cols-2 gap-10 pt-6 border-t border-border">
              <section className="space-y-6">
                  <div className="flex items-center gap-2 text-error">
                      <ShieldAlert className="w-5 h-5" />
                      <h3 className="text-xs font-bold uppercase tracking-[0.3em] font-brand">Barreras de Decisión</h3>
                  </div>
                  <ul className="space-y-2 font-body">
                      {(metadata.objections || []).map((o: string, i: number) => (
                      <li key={i} className="text-sm text-foreground-muted flex gap-3">
                          <span className="text-error font-bold">!</span> {o}
                      </li>
                      ))}
                  </ul>
              </section>

              <section className="space-y-6">
                  <div className="flex items-center gap-2 text-primary">
                      <MessageSquare className="w-5 h-5" />
                      <h3 className="text-xs font-bold uppercase tracking-[0.3em] font-brand">Voz del Cliente</h3>
                  </div>
                  <div className="grid gap-3">
                  {(metadata.quotes || []).map((q: string, i: number) => (
                      <p key={i} className="text-sm italic text-foreground-muted bg-surface p-4 rounded-2xl border-l-4 border-primary font-body">
                      "{q}"
                      </p>
                  ))}
                  </div>
              </section>
            </div>
          )}
          {/* Advanced Section: Full Strategic Depth (Admin Only) */}
          {isAdmin && (
            <section className="pt-10 border-t border-border space-y-6">
                <details className="group" open={!!persona.context}>
                    <summary className="flex items-center justify-between cursor-pointer list-none">
                        <div className="flex items-center gap-2 text-foreground-subtle group-hover:text-foreground transition-colors">
                            <Brain className="w-5 h-5" />
                            <h3 className="text-xs font-bold uppercase tracking-[0.3em] font-brand">Detalles Estratégicos Avanzados</h3>
                        </div>
                        <span className="text-foreground-subtle group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="mt-6 p-8 rounded-[2rem] bg-background border border-border text-foreground-muted text-sm leading-relaxed whitespace-pre-line font-mono animate-in fade-in duration-500">
                        {persona.context || "No hay información técnica adicional cargada en el núcleo."}
                    </div>
                </details>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-surface flex justify-center">
            <p className="text-[10px] text-foreground-subtle font-bold uppercase tracking-[0.4em] font-brand">
                IntelAgent Systems • Confidential Persona Dossier
            </p>
        </div>
      </div>
    </div>
  );
}
