"use client";

import { MessageSquare, TrendingUp, Shield, Award, AlertTriangle, Target, HelpCircle, Sparkles, AlertCircle, XCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { useI18n } from "@/components/i18n/I18nProvider";
import { StressResult, PersonaOption } from "./types";
import { ScoringBreakdown } from "./ScoringBreakdown";
import { PersonaSidebar } from "@/components/ui/PersonaSidebar";

interface AnalysisResultsProps {
    result: StressResult;
    personaNames: Record<string | number, string>;
    personaType: string | number;
    selectedPersonaName: string;
    personas: PersonaOption[];
    showDebug: boolean;
    loading?: boolean;
    isMainColumnOnly?: boolean;
}

export function AnalysisResults({
    result,
    personaNames,
    personaType,
    selectedPersonaName,
    personas,
    showDebug,
    loading = false,
    isMainColumnOnly = false,
}: AnalysisResultsProps) {
    const { t } = useI18n();

    const getConfidenceBadgeColor = (score: number) => {
        if (score === 0) return 'text-gray-400';
        if (score >= 70) return 'text-green-400';
        if (score >= 40) return 'text-yellow-400';
        return 'text-red-400';
    };

    const strengths = result.strengths || [];
    const gaps = result.gaps || [];
    const actionPlan = result.actionPlan || [];
    const followUpQuestions = result.followUpQuestions || [];

    const basicPersona = personas?.find(p => p.id === personaType || p.id.toString() === personaType.toString());
    const nameParts = basicPersona?.name?.split(' — ') || [selectedPersonaName, "Role"];
    const personaName = nameParts[0];

    const MainContent = (
        <div className="space-y-8">
            {/* Reacción de la Persona */}
            <div className="animate-slide-in-up bg-gradient-to-r from-[#4F46E5]/10 via-[#4F46E5]/5 to-transparent border-l-4 border-[#4F46E5] rounded-r-2xl overflow-hidden shadow-xl p-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4F46E5]/30 to-[#4F46E5]/10 flex items-center justify-center shadow-md flex-shrink-0">
                        <MessageSquare className="w-6 h-6 text-[#4F46E5]" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#4F46E5]">
                        Reacción de la Persona
                    </h3>
                </div>
                <p className={clsx(
                    "text-base leading-relaxed text-[#ededed] font-medium transition-opacity",
                    loading && !result.personaReaction ? "opacity-50" : "opacity-100"
                )}>
                    {result.personaReaction || (loading ? "Analizando el impacto estratégico de la idea..." : "No se generó una reacción.")}
                </p>
            </div>

            {/* Grid: Fortalezas & Brechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fortalezas */}
                <div className="animate-slide-in-up bg-gradient-to-br from-green-500/10 to-green-500/5 border-2 border-green-500/30 rounded-[2rem] p-8 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/30 to-green-500/10 flex items-center justify-center shadow-md flex-shrink-0">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-green-400">
                            Fortalezas
                        </h3>
                    </div>
                    <ul className="space-y-4">
                        {strengths.map((strength, idx) => {
                            const icons = [Shield, Award, TrendingUp];
                            const Icon = icons[idx % icons.length];
                            return (
                                <li key={idx} className="flex items-start gap-3 text-sm text-[#ededed]">
                                    <div className="w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Icon className="w-3.5 h-3.5 text-green-400" />
                                    </div>
                                    <span className="leading-relaxed">{strength}</span>
                                </li>
                            );
                        })}
                        {loading && strengths.length === 0 && <li className="animate-pulse text-sm text-green-400/50">...</li>}
                    </ul>
                </div>

                {/* Brechas y Riesgos */}
                <div className="animate-slide-in-up bg-gradient-to-br from-red-500/10 to-red-500/5 border-2 border-red-500/30 rounded-[2rem] p-8 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/30 to-red-500/10 flex items-center justify-center shadow-md flex-shrink-0">
                            <AlertTriangle className="w-6 h-6 text-red-400" />
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-red-400">
                            Brechas y Riesgos
                        </h3>
                    </div>
                    <ul className="space-y-4">
                        {gaps.map((gap, idx) => {
                            const icons = [AlertCircle, XCircle, AlertTriangle];
                            const Icon = icons[idx % icons.length];
                            return (
                                <li key={idx} className="flex items-start gap-3 text-sm text-[#ededed]">
                                    <div className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Icon className="w-3.5 h-3.5 text-red-400" />
                                    </div>
                                    <span className="leading-relaxed">{gap}</span>
                                </li>
                            );
                        })}
                        {loading && gaps.length === 0 && <li className="animate-pulse text-sm text-red-400/50">...</li>}
                    </ul>
                </div>
            </div>

            {/* Action Plan */}
            <div className="animate-slide-in-up bg-indigo-500/5 border border-indigo-500/10 rounded-[2rem] p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                        <Target className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400">
                        Plan de Acción
                    </h3>
                </div>
                <ul className="space-y-4">
                    {actionPlan.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-4">
                            <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-black mt-0.5">
                                {idx + 1}
                            </span>
                            <span className="text-sm text-zinc-300 leading-relaxed pt-0.5">{action}</span>
                        </li>
                    ))}
                    {loading && actionPlan.length === 0 && <li className="animate-pulse text-sm text-indigo-400/50">...</li>}
                </ul>
            </div>

            {/* Follow Up Questions */}
            <div className="animate-slide-in-up bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                        <HelpCircle className="w-5 h-5 text-amber-400" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
                        Preguntas de Seguimiento
                    </h3>
                </div>
                <div className="grid gap-3">
                    {followUpQuestions.map((question, idx) => (
                        <div
                            key={idx}
                            className="px-5 py-4 bg-black/40 border border-white/5 rounded-2xl text-sm text-zinc-300 leading-relaxed"
                        >
                            {question}
                        </div>
                    ))}
                    {loading && followUpQuestions.length === 0 && <div className="animate-pulse h-12 bg-white/5 rounded-2xl"></div>}
                </div>
            </div>

            {showDebug && (
                <div className="animate-fade-in bg-black border border-white/10 rounded-[2rem] p-8 shadow-xl">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-6">
                        Pitch Render (Debug)
                    </h3>
                    <p className="text-sm text-zinc-400 font-mono leading-relaxed whitespace-pre-line">{result.presentation}</p>
                </div>
            )}
        </div>
    );

    if (isMainColumnOnly) return MainContent;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-anchor-none animate-fade-in mt-8">
            <div className="lg:col-span-2 space-y-8">
                {MainContent}
            </div>

            <div className="lg:col-span-1">
                <PersonaSidebar
                    persona={basicPersona || null}
                    className="sticky top-8"
                    footer={(
                        <div className="space-y-6">
                            <div>
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

                            {result.confidenceBreakdown && (
                                <div className="animate-slide-in-up delay-100">
                                    <ScoringBreakdown 
                                        confidenceScore={result.confidenceScore || 0}
                                        breakdown={result.confidenceBreakdown as any}
                                        rationale={result.scoringRationale as any}
                                        hideScore={true}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                />
            </div>
        </div>
    );
}
