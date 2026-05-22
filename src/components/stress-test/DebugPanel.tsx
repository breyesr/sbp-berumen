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
        <div className="animate-fade-in bg-surface border border-border rounded-xl p-5 shadow-inner mb-6">
            <details className="group">
                <summary className="cursor-pointer text-sm font-bold text-foreground-muted hover:text-foreground transition-colors font-brand uppercase tracking-widest list-none flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {t("stress.debug.raw_response")}
                </summary>
                <div className="mt-6 space-y-4">
                    <div className="text-xs text-foreground-subtle font-body bg-background/50 p-3 rounded-lg border border-border/50">
                        {result.debug?.model ? `${t("stress.debug.model")}: ${result.debug.model}` : ""}
                        {result.debug?.temperature !== undefined ? ` · ${t("stress.debug.temperature")}: ${result.debug.temperature}` : ""}
                        {result.debug?.retried
                            ? result.debug.retryTemperature !== undefined
                                ? ` · ${t("stress.debug.retry_with_temp", { temp: result.debug.retryTemperature })}`
                                : ` · ${t("stress.debug.retry_yes")}`
                            : ` · ${t("stress.debug.retry_no")}`}
                    </div>
                    {result.confidenceBreakdown && (
                        <div className="text-xs text-foreground-muted font-body">
                            {t("stress.debug.confidence_breakdown", {
                                problem: result.confidenceBreakdown.problemValidity || 0,
                                solution: result.confidenceBreakdown.solutionLogic || 0,
                                pitch: result.confidenceBreakdown.pitchClarity || 0,
                            })}
                        </div>
                    )}
                    {result.debugRationale && (
                        <div className="text-xs text-foreground-muted font-body italic p-3 bg-surface-elevated/20 rounded-lg border border-border">
                            {t("stress.debug.rationale")}: {result.debugRationale}
                        </div>
                    )}
                    {result.debug?.ragHighlights && (
                        <div className="text-xs text-foreground-muted whitespace-pre-line font-body p-3 bg-primary/5 rounded-lg border border-primary/10">
                            {t("stress.debug.highlights")}: {result.debug.ragHighlights}
                        </div>
                    )}
                    {result.debug?.personaContext && (
                        <details className="space-y-2">
                            <summary className="cursor-pointer text-[10px] font-bold text-foreground-subtle hover:text-primary transition-colors font-brand uppercase tracking-widest">
                                {t("stress.debug.view_persona_context")}
                            </summary>
                            <pre className="whitespace-pre-wrap text-[11px] text-foreground-muted bg-background border border-border rounded-lg p-4 overflow-x-auto mt-2 font-mono">
{result.debug.personaContext}
                            </pre>
                        </details>
                    )}
                    {result.debug?.systemPrompt && (
                        <details className="space-y-2">
                            <summary className="cursor-pointer text-[10px] font-bold text-foreground-subtle hover:text-primary transition-colors font-brand uppercase tracking-widest">
                                {t("stress.debug.view_system_prompt")}
                            </summary>
                            <pre className="whitespace-pre-wrap text-[11px] text-foreground-muted bg-background border border-border rounded-lg p-4 overflow-x-auto mt-2 font-mono">
{result.debug.systemPrompt}
                            </pre>
                        </details>
                    )}
                    {result.debug?.userPrompt && (
                        <details className="space-y-2">
                            <summary className="cursor-pointer text-[10px] font-bold text-foreground-subtle hover:text-primary transition-colors font-brand uppercase tracking-widest">
                                {t("stress.debug.view_user_prompt")}
                            </summary>
                            <pre className="whitespace-pre-wrap text-[11px] text-foreground-muted bg-background border border-border rounded-lg p-4 overflow-x-auto mt-2 font-mono">
{result.debug.userPrompt}
                            </pre>
                        </details>
                    )}
                    {result.debug?.rawModelOutput && (
                        <pre className="whitespace-pre-wrap text-[11px] text-foreground bg-background border border-primary/20 rounded-lg p-4 overflow-x-auto shadow-inner font-mono">
{result.debug.rawModelOutput}
                        </pre>
                    )}
                </div>
            </details>
        </div>
    );
}
