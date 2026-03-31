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
}: RefinementPanelProps) {
    const { t } = useI18n();

    const handleRefineClick = (answers?: string[]) => {
        onRefine(answers);
    };

    return (
        <div className="animate-fade-in bg-gradient-to-br from-[#111827] to-[#0a0a0a] border border-[rgba(255,255,255,0.15)] rounded-xl overflow-hidden shadow-lg mt-6">
            <div className="p-6 space-y-5">
                <div className="flex items-center justify-between gap-4">
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

                {refineError && (
                    <div className="text-sm text-red-400">{refineError}</div>
                )}

                {refineQuestions.length > 0 && !refinedPitch && (
                    <div className="space-y-4">
                        <p className="text-sm text-[#e2e8f0]">
                            {t("stress.refine.error_missing_details", { persona: selectedPersonaName })}
                        </p>
                        <div className="space-y-4">
                            {refineQuestions.map((question, idx) => (
                                <div key={idx} className="space-y-2">
                                    <p className="text-xs uppercase tracking-wider text-[#94a3b8]">{question}</p>
                                    <textarea
                                        value={refineAnswers[idx] ?? ""}
                                        onChange={(e) => {
                                            const next = [...refineAnswers];
                                            next[idx] = e.target.value;
                                            setRefineAnswers(next);
                                        }}
                                        rows={2}
                                        className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#22d3ee]/40 focus:border-transparent transition-all resize-none"
                                        placeholder={t("stress.refine.answer_placeholder")}
                                    />
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => handleRefineClick(refineAnswers)}
                            disabled={refineLoading || refineAnswers.some((answer) => !answer.trim())}
                            className={clsx(
                                "w-full py-3 rounded-lg text-sm font-semibold transition-all",
                                "focus:outline-none focus:ring-2 focus:ring-[#22d3ee]/40 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]",
                                refineLoading || refineAnswers.some((answer) => !answer.trim())
                                    ? "bg-[rgba(255,255,255,0.05)] text-[#94a3b8] cursor-not-allowed"
                                    : "bg-[#22d3ee] text-[#0a0a0a] hover:bg-[#38bdf8] shadow-lg shadow-[#22d3ee]/20"
                            )}
                        >
                            {refineLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {t("stress.refine.button_working")}
                                </span>
                            ) : (
                                t("stress.refine.generate_button")
                            )}
                        </button>
                    </div>
                )}

                {refinedPitch && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] p-4">
                                <p className="text-xs uppercase tracking-wider text-[#94a3b8] mb-2">{t("stress.refine.original_pitch")}</p>
                                <p className="text-sm text-[#e2e8f0] whitespace-pre-line">{originalIdea}</p>
                            </div>
                            <div className="rounded-xl border border-[#22d3ee]/30 bg-[#0f172a] p-4 shadow-lg shadow-[#22d3ee]/10">
                                <p className="text-xs uppercase tracking-wider text-[#22d3ee] mb-2">{t("stress.refine.refined_pitch")}</p>
                                <p className="text-sm text-[#f8fafc] whitespace-pre-line">{refinedPitch}</p>
                            </div>
                        </div>
                        {refineChanges.length > 0 && (
                            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] p-4">
                                <p className="text-xs uppercase tracking-wider text-[#94a3b8] mb-3">{t("stress.refine.what_changed")}</p>
                                <ul className="space-y-2 text-sm text-[#e2e8f0]">
                                    {refineChanges.map((change, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-[#22d3ee]">•</span>
                                            <span>{change}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className="flex justify-end">
                            <button
                                onClick={onExportRefined}
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] bg-[#22d3ee] rounded-lg transition-all shadow-lg shadow-[#22d3ee]/20 focus:outline-none focus:ring-2 focus:ring-[#22d3ee]/40 hover:bg-[#38bdf8] hover:-translate-y-0.5 active:translate-y-[1px] active:scale-[0.99]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                {t("stress.download.refined")}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
