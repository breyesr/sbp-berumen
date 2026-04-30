// src/components/stress-test/RefinementPanel.tsx
"use client";

import { Sparkles, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useI18n } from "@/components/i18n/I18nProvider";
import { StressResult } from "./types";

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
    hideTrigger?: boolean;
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
    hideTrigger = false,
}: RefinementPanelProps) {
    const { t } = useI18n();

    const handleRefineClick = (answers?: string[]) => {
        onRefine(answers);
    };

    return (
        <div className={clsx(
            "animate-fade-in space-y-6",
            !hideTrigger && "bg-gradient-to-br from-[#111827] to-[#0a0a0a] border border-[rgba(255,255,255,0.15)] rounded-xl overflow-hidden shadow-lg p-6 mt-6"
        )}>
            {!hideTrigger && (
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#22d3ee]/30 to-[#0ea5e9]/10 flex items-center justify-center shadow-md">
                            <Sparkles className="w-6 h-6 text-[#22d3ee]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-[#22d3ee]">
                                {t("stress.refine.title")}
                            </h3>
                            <p className="text-xs text-[#a1a1aa] mt-0.5">{t("stress.refine.subtitle")}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleRefineClick()}
                        disabled={refineLoading}
                        className={clsx(
                            "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all",
                            "focus:outline-none focus:ring-2 focus:ring-[#22d3ee]/40",
                            refineLoading
                                ? "bg-[rgba(255,255,255,0.05)] text-[#94a3b8] cursor-not-allowed"
                                : "bg-[#0ea5e9]/20 text-[#22d3ee] border border-[#22d3ee]/40 hover:bg-[#22d3ee]/20"
                        )}
                    >
                        {refineLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {t("stress.refine.button_working")}
                            </>
                        ) : (
                            t("stress.refine.button_for_persona", { persona: selectedPersonaName })
                        )}
                    </button>
                </div>
            )}

            {refineError && (
                <div className="text-sm text-red-400 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    {refineError}
                </div>
            )}

            {refineQuestions.length > 0 && !refinedPitch && (
                <div className="space-y-6">
                    <p className="text-sm text-[#e2e8f0] font-medium px-1">
                        {t("stress.refine.error_missing_details", { persona: selectedPersonaName })}
                    </p>
                    <div className="grid grid-cols-1 gap-6">
                        {refineQuestions.map((question, idx) => (
                            <div key={idx} className="space-y-3">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400/70">
                                    {question}
                                </label>
                                <textarea
                                    value={refineAnswers[idx] ?? ""}
                                    onChange={(e) => {
                                        const next = [...refineAnswers];
                                        next[idx] = e.target.value;
                                        setRefineAnswers(next);
                                    }}
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all resize-none leading-relaxed text-white/90"
                                    placeholder={t("stress.refine.answer_placeholder")}
                                />
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => handleRefineClick(refineAnswers)}
                        disabled={refineLoading || refineAnswers.some((answer) => !answer.trim())}
                        className={clsx(
                            "w-full py-5 rounded-2xl font-black text-xs tracking-[0.3em] uppercase transition-all shadow-xl",
                            "focus:outline-none focus:ring-2 focus:ring-cyan-500/40",
                            refineLoading || refineAnswers.some((answer) => !answer.trim())
                                ? "bg-white/5 text-white/20 cursor-not-allowed shadow-none"
                                : "bg-cyan-600 text-white hover:bg-cyan-500 shadow-cyan-500/20 active:scale-[0.98]"
                        )}
                    >
                        {refineLoading ? (
                            <span className="flex items-center justify-center gap-3">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {t("stress.refine.button_working")}
                            </span>
                        ) : (
                            t("stress.refine.generate_button")
                        )}
                    </button>
                </div>
            )}

            {refinedPitch && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-1">
                                {t("stress.refine.original_pitch")}
                            </label>
                            <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 leading-relaxed text-white/60 italic text-sm">
                                {originalIdea}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 px-1">
                                {t("stress.refine.refined_pitch")}
                            </label>
                            <div className="rounded-[2rem] border border-cyan-500/20 bg-cyan-500/5 p-8 leading-relaxed text-white text-lg font-medium shadow-[0_20px_50px_rgba(34,211,238,0.05)]">
                                {refinedPitch}
                            </div>
                        </div>
                    </div>
                    
                    {refineChanges.length > 0 && (
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-1">
                                {t("stress.refine.what_changed")}
                            </label>
                            <div className="rounded-3xl border border-white/5 bg-white/[0.01] p-8">
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {refineChanges.map((change, idx) => (
                                        <li key={idx} className="flex items-start gap-3 group">
                                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0 group-hover:scale-125 transition-transform" />
                                            <span className="text-sm text-zinc-400 leading-relaxed group-hover:text-zinc-200 transition-colors">{change}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-center pt-8 border-t border-white/5">
                        <button
                            onClick={onExportRefined}
                            className="inline-flex items-center gap-4 px-12 py-5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs tracking-[0.3em] uppercase transition-all shadow-[0_20px_40px_rgba(34,211,238,0.2)] active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            {t("stress.download.refined")}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
