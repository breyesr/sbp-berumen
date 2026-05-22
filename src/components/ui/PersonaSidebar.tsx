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
            <div className={clsx("bg-surface border border-border rounded-[2rem] p-8 shadow-2xl flex flex-col gap-6", className)}>
                <div className="flex items-start gap-4">
                    {persona.photo_url ? (
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-primary/30 flex-shrink-0">
                            <img src={persona.photo_url} alt={personaName} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                            <User className="w-8 h-8 text-primary/50" />
                        </div>
                    )}
                    <div>
                        <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-primary block mb-1 font-brand">
                            {persona.cluster || "Cluster"}
                        </span>
                        <h3 className="text-lg font-bold text-foreground leading-tight uppercase font-brand">
                            {personaName}
                        </h3>
                        <p className="text-xs text-foreground-muted font-medium italic font-body">
                            {personaRole}
                        </p>
                    </div>
                </div>

                {footer && (
                    <div className="pt-6 border-t border-border">
                        {footer}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={clsx("rounded-[2rem] bg-surface border border-border flex flex-col shadow-2xl overflow-hidden", className)}>
            {/* Header: Identity */}
            <div className="p-6 border-b border-border bg-gradient-to-br from-primary/5 to-transparent">
                <div className="flex items-center gap-4">
                    {persona.photo_url ? (
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-primary/30 flex-shrink-0">
                            <img src={persona.photo_url} alt={personaName} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                            <User className="w-8 h-8 text-primary/50" />
                        </div>
                    )}
                    <div>
                        <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-primary block mb-1 font-brand">
                            {persona.cluster || "Cluster"}
                        </span>
                        <h3 className="text-lg font-bold text-foreground leading-tight uppercase font-brand">
                            {personaName}
                        </h3>
                        <p className="text-xs text-foreground-muted font-medium italic font-body">
                            {personaRole}
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Body: Intelligence */}
            <div className="p-6 space-y-8">
                {isLoading ? (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-2 w-24 bg-foreground/5 rounded-full" />
                        <div className="h-20 bg-foreground/5 rounded-2xl" />
                    </div>
                ) : (dossier && !hideIntelligence) ? (
                    <>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-primary">
                                <Sparkles className="w-4 h-4" />
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] font-brand">Síntesis Ejecutiva</h4>
                            </div>
                            <p className="text-xs leading-relaxed text-foreground-muted p-4 bg-background/40 rounded-2xl border border-border font-body shadow-inner">
                                {metadata.strategic_synthesis || metadata.synthesis || "Análisis estratégico no disponible."}
                            </p>
                        </div>

                        {metadata.pains && metadata.pains.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-error">
                                    <Zap className="w-4 h-4" />
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] font-brand">Dolores Principales</h4>
                                </div>
                                <ul className="space-y-2">
                                    {metadata.pains.slice(0,3).map((p: string, i: number) => (
                                        <li key={i} className="text-xs text-foreground-muted p-3 rounded-xl bg-error/5 border border-error/10 font-body">{p}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {metadata.goals && metadata.goals.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-success">
                                    <Target className="w-4 h-4" />
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] font-brand">Metas Estratégicas</h4>
                                </div>
                                <ul className="space-y-2">
                                    {metadata.goals.slice(0,3).map((g: string, i: number) => (
                                        <li key={i} className="text-xs text-foreground-muted p-3 rounded-xl bg-success/5 border border-success/10 font-body">{g}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                ) : null}

                {footer && (
                    <div className="pt-6 border-t border-border">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
