"use client";

import { Sparkles, Loader2, User, AlertTriangle, CheckCircle2, Download, Info, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { useI18n } from "@/components/i18n/I18nProvider";
import { StressResult, PersonaOption } from "./types";
import { PersonaSidebar } from "@/components/ui/PersonaSidebar";

interface RefinementPanelProps {
    result: StressResult;
    refineLoading: boolean;
    refineError: string | null;
    refineQuestions: string[];
    refineAnswers: string[];
    setRefineAnswers: (answers: string[]) => void;
    refinedPitch: string | null;
    refineChanges: string[];
    onRefine: (answers?: string[]) => void;
    selectedPersonaName: string;
    originalIdea: string;
    onExportRefined: () => void;
    personas: PersonaOption[];
    personaId: string;
    isMainColumnOnly?: boolean;
}

export function RefinementPanel({
    result,
    refineLoading,
    refineError,
    refineQuestions,
    refineAnswers,
    setRefineAnswers,
    refinedPitch,
    refineChanges,
    onRefine,
    selectedPersonaName,
    originalIdea,
    onExportRefined,
    personas,
    personaId,
    isMainColumnOnly = false,
}: RefinementPanelProps) {
    const { t } = useI18n();
    const [isOriginalExpanded, setIsOriginalExpanded] = useState(false);

    const basicPersona = personas?.find(p => p.id === personaId || p.id.toString() === personaId.toString());
    const nameParts = basicPersona?.name?.split(' — ') || [selectedPersonaName, "Role"];
    const personaName = nameParts[0];

    const getConfidenceBadgeColor = (score: number) => {
        if (score === 0) return 'text-gray-400';
        if (score >= 70) return 'text-green-400';
        if (score >= 40) return 'text-yellow-400';
        return 'text-red-400';
    };

    const handleRefineClick = () => {
        onRefine(refineAnswers);
    };

    const isRefinado = !!refinedPitch;

    const MainContent = (
        <div className="space-y-8">
            {/* Left Column: Form or Result */}
            <div className="space-y-8">
                
                {/* STATE A: REFINAR PITCH (FORM) */}
                {!isRefinado && (
                    <div className="space-y-8">
                        <div>
                            <p className="text-lg text-zinc-300 font-medium tracking-wide">
                                {personaName} necesita algunos detalles más para poder ajustar mejor el pitch.
                            </p>
                        </div>

                        {refineError && (
                            <div className="text-sm text-red-400 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl">
                                {refineError}
                            </div>
                        )}

                        <div className="space-y-6">
                            {refineQuestions.map((question, idx) => (
                                <div key={idx} className="space-y-4">
                                    <label className="block text-sm font-semibold text-indigo-200 leading-relaxed">
                                        {question}
                                    </label>
                                    <textarea
                                        value={refineAnswers[idx] ?? ""}
                                        onChange={(e) => {
                                            const next = [...refineAnswers];
                                            next[idx] = e.target.value;
                                            setRefineAnswers(next);
                                        }}
                                        rows={4}
                                        className="w-full bg-white/[0.02] border border-white/10 rounded-3xl px-6 py-5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none leading-relaxed text-white/90 shadow-inner"
                                        placeholder={t("stress.refine.answer_placeholder")}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                onClick={handleRefineClick}
                                disabled={refineLoading || refineAnswers.some((answer) => !answer.trim())}
                                className={clsx(
                                    "py-5 px-12 rounded-2xl font-black text-xs tracking-[0.2em] uppercase transition-all shadow-xl",
                                    refineLoading || refineAnswers.some((answer) => !answer.trim())
                                        ? "bg-white/5 border border-white/5 text-white/20 cursor-not-allowed"
                                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 active:scale-[0.98]"
                                )}
                            >
                                {refineLoading ? (
                                    <span className="flex items-center justify-center gap-3">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Generando...
                                    </span>
                                ) : (
                                    "Generar Idea Refinada"
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* STATE B: REFINADO (RESULT) */}
                {isRefinado && (
                    <div className="space-y-8 animate-slide-in-up">
                        <div>
                            <p className="text-lg text-zinc-300 font-medium tracking-wide">
                                El pitch ha sido ajustado según el feedback de {personaName}.
                            </p>
                        </div>

                        <div className="flex flex-col gap-6">
                            {/* Refined Pitch (Top) */}
                            <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-[2rem] p-8 shadow-2xl flex flex-col">
                                <div className="flex items-center gap-3 mb-6">
                                    <Sparkles className="w-5 h-5 text-indigo-400" />
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400">
                                        Pitch Refinado
                                    </h3>
                                </div>
                                <div className="text-base text-white leading-relaxed font-medium whitespace-pre-wrap">
                                    {refinedPitch}
                                </div>
                            </div>

                            {/* Original Pitch (Bottom, Collapsible) */}
                            <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] shadow-xl overflow-hidden transition-all">
                                <button 
                                    onClick={() => setIsOriginalExpanded(!isOriginalExpanded)}
                                    className="w-full flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors focus:outline-none"
                                >
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                                        Ver Pitch Original
                                    </h3>
                                    <ChevronDown className={clsx("w-5 h-5 text-zinc-500 transition-transform", isOriginalExpanded && "rotate-180")} />
                                </button>
                                {isOriginalExpanded && (
                                    <div className="p-6 pt-0 mt-2 border-t border-white/5">
                                        <div className="mt-6 text-sm text-zinc-400 leading-relaxed italic whitespace-pre-wrap">
                                            {originalIdea}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-8 flex justify-end">
                            <button
                                onClick={onExportRefined}
                                className="inline-flex items-center gap-4 px-10 py-5 rounded-2xl bg-white text-black font-black text-xs tracking-[0.2em] uppercase transition-all shadow-xl hover:bg-zinc-200 active:scale-[0.98]"
                            >
                                <Download className="w-4 h-4" />
                                Descargar Análisis Completo
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    if (isMainColumnOnly) return MainContent;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 animate-fade-in">
            
            {/* Left Column: Form or Result */}
            <div className="lg:col-span-2 space-y-8">
                {MainContent}
            </div>

            {/* Right Column: Context Card */}
            <div className="lg:col-span-1">
                <PersonaSidebar
                    persona={basicPersona || null}
                    className="sticky top-8"
                    variant="compact"
                    footer={(
                        <div className="space-y-6">
                            <div className="pt-6 border-t border-white/5">
                                <div className={clsx(
                                    "text-5xl font-black tracking-tighter",
                                    getConfidenceBadgeColor(result.confidenceScore || 0)
                                )}>
                                    {result.confidenceScore && result.confidenceScore > 0 
                                        ? `${result.confidenceScore}%`
                                        : "..."}
                                </div>
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mt-2 block">
                                    De Confianza
                                </span>
                            </div>

                            {/* Dynamic Context Box (Restored to match staging) */}
                            {!isRefinado ? (
                                <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 shadow-xl animate-fade-in space-y-6">
                                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                        <Info className="w-5 h-5 text-indigo-400" />
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400">
                                            Contexto del Análisis
                                        </h3>
                                    </div>
                                    
                                    {result.personaReaction && (
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block">Reacción</span>
                                            <p className="text-xs text-zinc-300 leading-relaxed italic border-l-2 border-indigo-500/30 pl-3">"{result.personaReaction}"</p>
                                        </div>
                                    )}

                                    {result.gaps && result.gaps.length > 0 && (
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block">Puntos a Mejorar</span>
                                            <ul className="space-y-2">
                                                {result.gaps.map((gap, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-xs text-zinc-400">
                                                        <span className="text-amber-500/50 flex-shrink-0 mt-0.5">•</span>
                                                        <span className="leading-relaxed">{gap}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-gradient-to-br from-green-500/5 to-transparent border-2 border-green-500/10 rounded-[2rem] p-8 shadow-xl animate-fade-in">
                                    <div className="flex items-center gap-3 mb-6">
                                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-green-400">
                                            Cambios Clave
                                        </h3>
                                    </div>
                                    <ul className="space-y-4">
                                        {refineChanges.map((change, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-sm text-zinc-300">
                                                <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                                                </div>
                                                <span className="leading-relaxed">{change}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                />
            </div>
        </div>
    );
}
