"use client";

import React from "react";
import { User, Sparkles, Zap, Target } from "lucide-react";
import { clsx } from "clsx";
import { PersonaOption } from "@/lib/types/shared";

interface PersonaSidebarProps {
    persona: PersonaOption | null;
    dossier?: any;
    isLoading?: boolean;
    footer?: React.ReactNode;
    className?: string;
    hideIntelligence?: boolean;
    variant?: 'dossier' | 'compact';
}

/**
 * Standard Intelligence Sidebar for Persona context.
 * Supports two variants:
 * - 'dossier': Header/Body split with p-6 (Strategy Input style)
 * - 'compact': Unified p-8 card with gap-6 (Results/Analysis style)
 */
export function PersonaSidebar({
    persona,
    dossier,
    isLoading,
    footer,
    className,
    hideIntelligence = false,
    variant = 'dossier'
}: PersonaSidebarProps) {
    if (!persona) return null;

    const nameParts = persona.name.split(' — ');
    const personaName = nameParts[0];
    const personaRole = nameParts[1] || "Decisor";
    const metadata = dossier?.metadata || {};

    if (variant === 'compact') {
        return (
            <div className={clsx("bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 shadow-2xl flex flex-col gap-6", className)}>
                <div className="flex items-start gap-4">
                    {persona.photo_url ? (
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-indigo-500/30 flex-shrink-0">
                            <img src={persona.photo_url} alt={personaName} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                            <User className="w-8 h-8 text-indigo-400/50" />
                        </div>
                    )}
                    <div>
                        <span className="text-[9px] font-black tracking-[0.2em] uppercase text-indigo-400 block mb-1">
                            {persona.cluster || "Cluster"}
                        </span>
                        <h3 className="text-lg font-black text-white leading-tight uppercase">
                            {personaName}
                        </h3>
                        <p className="text-xs text-zinc-500 font-medium italic">
                            {personaRole}
                        </p>
                    </div>
                </div>

                {footer && (
                    <div className="pt-6 border-t border-white/5">
                        {footer}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={clsx("rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col shadow-2xl overflow-hidden", className)}>
            {/* Header: Identity */}
            <div className="p-6 border-b border-white/5 bg-gradient-to-br from-indigo-500/5 to-transparent">
                <div className="flex items-center gap-4">
                    {persona.photo_url ? (
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-indigo-500/30 flex-shrink-0">
                            <img src={persona.photo_url} alt={personaName} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                            <User className="w-8 h-8 text-indigo-400/50" />
                        </div>
                    )}
                    <div>
                        <span className="text-[9px] font-black tracking-[0.2em] uppercase text-indigo-400 block mb-1">
                            {persona.cluster || "Cluster"}
                        </span>
                        <h3 className="text-lg font-black text-white leading-tight uppercase">
                            {personaName}
                        </h3>
                        <p className="text-xs text-zinc-500 font-medium italic">
                            {personaRole}
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Body: Intelligence */}
            <div className="p-6 space-y-8">
                {isLoading ? (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-2 w-24 bg-white/5 rounded-full" />
                        <div className="h-20 bg-white/5 rounded-2xl" />
                    </div>
                ) : (dossier && !hideIntelligence) ? (
                    <>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-indigo-400">
                                <Sparkles className="w-4 h-4" />
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Síntesis Ejecutiva</h4>
                            </div>
                            <p className="text-xs leading-relaxed text-zinc-300 p-4 bg-black/40 rounded-2xl border border-white/5">
                                {metadata.strategic_synthesis || metadata.synthesis || "Análisis estratégico no disponible."}
                            </p>
                        </div>

                        {metadata.pains && metadata.pains.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-amber-400">
                                    <Zap className="w-4 h-4" />
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Dolores Principales</h4>
                                </div>
                                <ul className="space-y-2">
                                    {metadata.pains.slice(0,3).map((p: string, i: number) => (
                                        <li key={i} className="text-xs text-zinc-400 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">{p}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {metadata.goals && metadata.goals.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-emerald-400">
                                    <Target className="w-4 h-4" />
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Metas Estratégicas</h4>
                                </div>
                                <ul className="space-y-2">
                                    {metadata.goals.slice(0,3).map((g: string, i: number) => (
                                        <li key={i} className="text-xs text-zinc-400 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">{g}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                ) : null}

                {footer && (
                    <div className="pt-6 border-t border-white/5">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
