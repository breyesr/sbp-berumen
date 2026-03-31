// src/components/stress-test/DebugPanel.tsx
"use client";

import { useI18n } from "@/components/i18n/I18nProvider";
import { StressResult } from "./types";

interface DebugPanelProps {
    result: StressResult;
    showDebug: boolean;
}

export function DebugPanel({ result, showDebug }: DebugPanelProps) {
    const { t } = useI18n();

    if (!showDebug) return null;

    return (
        <div className="animate-fade-in bg-[#0f0f0f] border border-[rgba(255,255,255,0.12)] rounded-xl p-5 shadow-lg mb-6">
            <details>
                <summary className="cursor-pointer text-sm font-semibold text-[#a1a1aa]">
                    {t("stress.debug.raw_response")}
                </summary>
                <div className="mt-4 space-y-3">
                    <div className="text-xs text-[#71717a]">
                        {result.debug?.model ? `${t("stress.debug.model")}: ${result.debug.model}` : ""}
                        {result.debug?.temperature !== undefined ? ` · ${t("stress.debug.temperature")}: ${result.debug.temperature}` : ""}
                        {result.debug?.retried
                            ? result.debug.retryTemperature !== undefined
                                ? ` · ${t("stress.debug.retry_with_temp", { temp: result.debug.retryTemperature })}`
                                : ` · ${t("stress.debug.retry_yes")}`
                            : ` · ${t("stress.debug.retry_no")}`}
                    </div>
                    {result.confidenceBreakdown && (
                        <div className="text-xs text-[#a1a1aa]">
                            {t("stress.debug.confidence_breakdown", {
                                problem: result.confidenceBreakdown.problemValidity || 0,
                                solution: result.confidenceBreakdown.solutionLogic || 0,
                                pitch: result.confidenceBreakdown.pitchClarity || 0,
                            })}
                        </div>
                    )}
                    {result.debugRationale && (
                        <div className="text-xs text-[#a1a1aa]">
                            {t("stress.debug.rationale")}: {result.debugRationale}
                        </div>
                    )}
                    {result.debug?.ragHighlights && (
                        <div className="text-xs text-[#a1a1aa] whitespace-pre-line">
                            {t("stress.debug.highlights")}: {result.debug.ragHighlights}
                        </div>
                    )}
                    {result.debug?.personaContext && (
                        <details>
                            <summary className="cursor-pointer text-xs text-[#a1a1aa]">
                                {t("stress.debug.view_persona_context")}
                            </summary>
                            <pre className="whitespace-pre-wrap text-xs text-[#e5e7eb] bg-black/30 border border-white/10 rounded-lg p-4 overflow-x-auto mt-2">
{result.debug.personaContext}
                            </pre>
                        </details>
                    )}
                    {result.debug?.systemPrompt && (
                        <details>
                            <summary className="cursor-pointer text-xs text-[#a1a1aa]">
                                {t("stress.debug.view_system_prompt")}
                            </summary>
                            <pre className="whitespace-pre-wrap text-xs text-[#e5e7eb] bg-black/30 border border-white/10 rounded-lg p-4 overflow-x-auto mt-2">
{result.debug.systemPrompt}
                            </pre>
                        </details>
                    )}
                    {result.debug?.userPrompt && (
                        <details>
                            <summary className="cursor-pointer text-xs text-[#a1a1aa]">
                                {t("stress.debug.view_user_prompt")}
                            </summary>
                            <pre className="whitespace-pre-wrap text-xs text-[#e5e7eb] bg-black/30 border border-white/10 rounded-lg p-4 overflow-x-auto mt-2">
{result.debug.userPrompt}
                            </pre>
                        </details>
                    )}
                    {result.debug?.rawModelOutput && (
                        <pre className="whitespace-pre-wrap text-xs text-[#e5e7eb] bg-black/30 border border-white/10 rounded-lg p-4 overflow-x-auto">
{result.debug.rawModelOutput}
                        </pre>
                    )}
                </div>
            </details>
        </div>
    );
}
