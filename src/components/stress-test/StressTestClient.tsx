// src/components/stress-test/StressTestClient.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { StressTestForm } from "./StressTestForm";
import { AnalysisResults } from "./AnalysisResults";
import { RefinementPanel } from "./RefinementPanel";
import { DebugPanel } from "./DebugPanel";
import { StressResult, PersonaOption, ChallengeLevelOption, SimulationResultSchema } from "./types";

interface StressTestClientProps {
    initialPersonas: PersonaOption[];
    initialLevels: ChallengeLevelOption[];
    personaLookup: Record<string, string>;
}

export function StressTestClient({
    initialPersonas,
    initialLevels,
    personaLookup,
}: StressTestClientProps) {
    const { t, formatDate } = useI18n();
    
    const [personas] = useState<PersonaOption[]>(initialPersonas);
    const [personaType, setPersonaType] = useState<string>(initialPersonas[0]?.id || "");
    const [levels] = useState<ChallengeLevelOption[]>(initialLevels);
    const [challengeLevelId, setChallengeLevelId] = useState<string>(initialLevels[0]?.id || "");
    
    const [idea, setIdea] = useState("");
    const [goal, setGoal] = useState("");
    const [evaluationFocus, setEvaluationFocus] = useState("");

    const [error, setError] = useState<string | null>(null);
    
    // AI SDK Hook for streaming objects
    const { object, submit, isLoading: loading, error: aiError } = useObject({
        api: "/api/stress-test",
        schema: SimulationResultSchema,
        onFinish: () => {
            // Scroll to top of results when finished if needed
        }
    });

    const [refineLoading, setRefineLoading] = useState(false);
    const [refineError, setRefineError] = useState<string | null>(null);
    const [refineQuestions, setRefineQuestions] = useState<string[]>([]);
    const [refineAnswers, setRefineAnswers] = useState<string[]>([]);
    const [refinedPitch, setRefinedPitch] = useState<string | null>(null);
    const [refineChanges, setRefineChanges] = useState<string[]>([]);
    
    const [showDebug, setShowDebug] = useState(false);
    const resultTopRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const envEnabled = process.env.NEXT_PUBLIC_STRESS_DEBUG === "1";
        const queryEnabled = typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("debug") === "1"
            : false;
        setShowDebug(envEnabled && queryEnabled);
    }, []);

    useEffect(() => {
        if (object && resultTopRef.current) {
            resultTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [object]);

    useEffect(() => {
        if (aiError) {
            setError(aiError.message);
        }
    }, [aiError]);

    const handleSubmit = async () => {
        setError(null);
        setRefineError(null);
        setRefineQuestions([]);
        setRefineAnswers([]);
        setRefinedPitch(null);
        setRefineChanges([]);

        submit({
            personaType,
            challengeLevelId,
            idea: idea.trim(),
            goal: goal.trim(),
            evaluationFocus: evaluationFocus.trim(),
        });
    };

    const handleRefine = async (answers?: string[]) => {
        if (!object || refineLoading) return;

        setRefineLoading(true);
        setRefineError(null);
        if (!answers?.length) {
            setRefinedPitch(null);
            setRefineChanges([]);
        }

        try {
            const res = await fetch("/api/idea-refinement", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    personaType,
                    challengeLevelId,
                    idea: idea.trim(),
                    goal: goal.trim(),
                    stressResult: {
                        summary: object.verdict,
                        gaps: object.gaps || [],
                        improvements: object.actionPlan || [],
                        questions: object.followUpQuestions || [],
                        triggeredRedFlags: object.triggeredRedFlags ?? [],
                        confidence: object.confidenceScore || 0,
                    },
                    missingInfoQuestions: refineQuestions.length ? refineQuestions : undefined,
                    userAnswers: answers,
                }),
            });
            let json: any = null;
            try {
                json = await res.json();
            } catch {
                json = null;
            }
            if (!res.ok) {
                const message = json?.error || `HTTP error! status: ${res.status}`;
                throw new Error(message);
            }
            if (json.status === "needs_input") {
                const questions = Array.isArray(json.questions) ? json.questions : [];
                setRefineQuestions(questions);
                setRefineAnswers(new Array(questions.length).fill(""));
                setRefinedPitch(null);
                setRefineChanges([]);
            } else {
                setRefineQuestions([]);
                setRefineAnswers([]);
                setRefinedPitch(json.refinedPitch ?? "");
                setRefineChanges(Array.isArray(json.changesSummary) ? json.changesSummary : []);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : t("stress.error.refine");
            setRefineError(message);
        } finally {
            setRefineLoading(false);
        }
    };

    const selectedPersonaName =
        personaLookup[personaType] || t("stress.default_persona");

    // Map partial object to StressResult type
    const result: StressResult | null = object ? {
        ...object as any,
        persona: selectedPersonaName,
        // other metadata can be added here if needed
    } : null;

    const handleExport = () => {
        if (!result) return;
        const date = formatDate(new Date(), { dateStyle: "medium" });
        const report = `${t("stress.report.analysis_header")} ${result.persona || selectedPersonaName}
${t("stress.report.generated")}: ${date}
[ ${t("stress.report.idea_label")} ] ${idea}

========================================

[ ${t("stress.report.verdict_label")} ] ${t("stress.report.confidence_score")}: ${result.confidenceScore}/100 ${t("stress.report.summary")}: ${result.verdict}

[ ${t("stress.report.strengths_label")} ] ${(result.strengths || []).map((s: string) => `+ ${s}`).join('\n')}

[ ${t("stress.report.gaps_label")} ] ${(result.gaps || []).map((g: string) => `- ${g}`).join('\n')}

[ ${t("stress.report.action_plan_label")} ] ${(result.actionPlan || []).map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')}

[ ${t("stress.report.presentation_label")} ] ${result.presentation}

[ ${t("stress.report.followup_label")} ] ${(result.followUpQuestions || []).map((q: string) => `? ${q}`).join('\n')} `;

        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const safePersona = (selectedPersonaName || "persona")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        link.download = `stress-test-${safePersona}-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportRefined = () => {
        if (!refinedPitch) return;
        const date = formatDate(new Date(), { dateStyle: "medium" });
        const report = `${t("stress.report.refined_header")} ${selectedPersonaName}
${t("stress.report.generated")}: ${date}

[ ${t("stress.report.goal")} ]
${goal}

[ ${t("stress.report.refined_pitch")} ]
${refinedPitch}
`;
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const safePersona = (selectedPersonaName || "persona")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        link.download = `refined-pitch-${safePersona}-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-[#0a0a0a] text-[#ededed] px-4 py-6 md:py-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-semibold tracking-tight mb-3">
                        {t("stress.title")}
                    </h1>
                    <p className="text-sm text-[#a1a1aa] max-w-3xl">
                        {t("stress.subtitle")}
                    </p>
                </header>

                <StressTestForm
                    personas={personas}
                    personaType={personaType}
                    setPersonaType={setPersonaType}
                    levels={levels}
                    challengeLevelId={challengeLevelId}
                    setChallengeLevelId={setChallengeLevelId}
                    idea={idea}
                    setIdea={setIdea}
                    goal={goal}
                    setGoal={setGoal}
                    evaluationFocus={evaluationFocus}
                    setEvaluationFocus={setEvaluationFocus}
                    loading={loading}
                    onSubmit={handleSubmit}
                    selectedPersonaName={selectedPersonaName}
                />
                
                {error && <div className="mt-4 text-red-400 text-sm text-center">{error}</div>}

                {result && (
                    <div className="space-y-6">
                        <div ref={resultTopRef} />
                        <AnalysisResults
                            result={result}
                            personaNames={personaLookup}
                            personaType={personaType}
                            selectedPersonaName={selectedPersonaName}
                            showDebug={showDebug}
                        />

                        <DebugPanel result={result} showDebug={showDebug} />

                        {!loading && (
                            <RefinementPanel
                                result={result}
                                refineLoading={refineLoading}
                                refineError={refineError}
                                refineQuestions={refineQuestions}
                                refineAnswers={refineAnswers}
                                setRefineAnswers={setRefineAnswers}
                                refinedPitch={refinedPitch}
                                refineChanges={refineChanges}
                                onRefine={handleRefine}
                                selectedPersonaName={selectedPersonaName}
                                originalIdea={idea}
                                onExportRefined={handleExportRefined}
                            />
                        )}

                        {!loading && (
                            <div className="mt-10 pt-6 border-t border-white/10 flex flex-col gap-3 pb-12 sm:flex-row sm:justify-end">
                                <button
                                    onClick={handleExport}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#ededed] bg-gradient-to-br from-[#171717] to-[#0f0f0f] border border-[rgba(255,255,255,0.15)] rounded-lg transition-all shadow-lg shadow-black/30 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40 hover:bg-[rgba(255,255,255,0.05)] hover:-translate-y-0.5 hover:border-[#4F46E5]/40 hover:shadow-[#4F46E5]/20 active:translate-y-[1px] active:scale-[0.99] active:border-[#4F46E5]/50"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                    {t("stress.download.analysis")}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
