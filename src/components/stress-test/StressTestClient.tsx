// src/components/stress-test/StressTestClient.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { Sparkles, Loader2 } from 'lucide-react';
import { useI18n } from "@/components/i18n/I18nProvider";
import { CollapsibleStep } from "@/components/ui/CollapsibleStep";
import { IdentitySection } from "./IdentitySection";
import { IdeaSection } from "./IdeaSection";
import { AnalysisResults } from "./AnalysisResults";
import { RefinementPanel } from "./RefinementPanel";
import { DebugPanel } from "./DebugPanel";
import { PersonaDossier } from "@/components/admin/PersonaDossier";
import { StressResult, PersonaOption, ChallengeLevelOption, SimulationResultSchema } from "./types";

interface StressTestClientProps {
    initialPersonas: PersonaOption[];
    initialLevels: ChallengeLevelOption[];
    personaLookup: Record<string, string>;
}

type Step = 'identity' | 'strategy' | 'results' | 'refinement';

export function StressTestClient({
    initialPersonas,
    initialLevels,
    personaLookup,
}: StressTestClientProps) {
    const { t, formatDate } = useI18n();
    
    // Workflow State
    const [currentStep, setCurrentStep] = useState<Step>('identity');
    const [completedSteps, setCompletedSteps] = useState<Step[]>([]);

    const [personas] = useState<PersonaOption[]>(initialPersonas);
    const [personaType, setPersonaType] = useState<string | number>(initialPersonas[0]?.id || "");
    const [levels] = useState<ChallengeLevelOption[]>(initialLevels);
    const [challengeLevelId, setChallengeLevelId] = useState<string>(initialLevels[0]?.id || "");
    
    const [idea, setIdea] = useState("");
    const [goal, setGoal] = useState("");
    const [evaluationFocus, setEvaluationFocus] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [viewingDossier, setViewingDossier] = useState<any | null>(null);
    const [loadingDossier, setLoadingDossier] = useState(false);
    
    // AI SDK Hook for streaming objects
    const { object, submit, isLoading: loading, error: aiError } = useObject({
        api: "/api/stress-test",
        schema: SimulationResultSchema,
    });

    const [refineLoading, setRefineLoading] = useState(false);
    const [refineError, setRefineError] = useState<string | null>(null);
    const [refineQuestions, setRefineQuestions] = useState<string[]>([]);
    const [refineAnswers, setRefineAnswers] = useState<string[]>([]);
    const [refinedPitch, setRefinedPitch] = useState<string | null>(null);
    const [refineChanges, setRefineChanges] = useState<string[]>([]);
    
    const [showDebug, setShowDebug] = useState(false);
    const isFirstChunkRef = useRef(true);

    // Refs for scrolling
    const identityRef = useRef<HTMLDivElement>(null);
    const strategyRef = useRef<HTMLDivElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);
    const refinementRef = useRef<HTMLDivElement>(null);

    const stepRefs = {
        identity: identityRef,
        strategy: strategyRef,
        results: resultsRef,
        refinement: refinementRef
    };

    const scrollToStep = (step: Step) => {
        // Use a longer delay (500ms) to ensure previous step collapse 
        // and current step expansion animations are nearly complete.
        setTimeout(() => {
            const target = stepRefs[step].current;
            if (target) {
                // Calculate position relative to the scroll container
                const yOffset = -20; // Fine-tune this offset for perfect "header at top"
                const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;

                window.scrollTo({
                    top: y,
                    behavior: "smooth"
                });
            }
        }, 500);
    };

    useEffect(() => {
        const envEnabled = process.env.NEXT_PUBLIC_STRESS_DEBUG === "1";
        const queryEnabled = typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("debug") === "1"
            : false;
        setShowDebug(envEnabled && queryEnabled);
    }, []);

    // Auto-expand results when streaming starts
    useEffect(() => {
        if (object && isFirstChunkRef.current) {
            setCurrentStep('results');
            if (!completedSteps.includes('strategy')) {
                setCompletedSteps(prev => [...prev, 'strategy']);
            }
            isFirstChunkRef.current = false;
            scrollToStep('results');
        }
    }, [object, completedSteps]);

    useEffect(() => {
        if (aiError) {
            setError(aiError.message);
        }
    }, [aiError]);

    const handleContinueToInput = () => {
        if (personaType && challengeLevelId) {
            setCompletedSteps(prev => Array.from(new Set([...prev, 'identity'])));
            setCurrentStep('strategy');
            scrollToStep('strategy');
        }
    };

    const handleViewDossier = async (id: string | number) => {
        setLoadingDossier(true);
        try {
            const res = await fetch(`/api/personas/${id}`);
            const data = await res.json();
            if (res.ok) setViewingDossier(data.persona);
        } catch (err) {
            console.error("Dossier fetch failed", err);
        } finally {
            setLoadingDossier(false);
        }
    };

    const handleSubmit = async () => {
        setError(null);
        setRefineError(null);
        setRefineQuestions([]);
        setRefineAnswers([]);
        setRefinedPitch(null);
        setRefineChanges([]);
        isFirstChunkRef.current = true;

        submit({
            personaType,
            challengeLevelId,
            idea: idea.trim(),
            goal: goal.trim(),
            evaluationFocus: evaluationFocus.trim(),
        });
        
        // Collapse strategy and expand results will be handled by the useEffect on 'object'
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
                setCurrentStep('refinement');
                scrollToStep('refinement');
            } else {
                setRefineQuestions([]);
                setRefineAnswers([]);
                setRefinedPitch(json.refinedPitch ?? "");
                setRefineChanges(Array.isArray(json.changesSummary) ? json.changesSummary : []);
                setCurrentStep('refinement');
                scrollToStep('refinement');
                if (!completedSteps.includes('refinement')) {
                    setCompletedSteps(prev => [...prev, 'refinement']);
                }
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : t("stress.error.refine");
            setRefineError(message);
        } finally {
            setRefineLoading(false);
        }
    };

    const selectedPersonaName = personaLookup[personaType] || t("stress.default_persona");
    const selectedLevelName = levels.find(l => l.id === challengeLevelId)?.name || "";

    const result: StressResult | null = object ? {
        ...object as any,
        persona: selectedPersonaName,
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
        <div className="bg-[#0a0a0a] text-[#ededed] px-6 py-8 md:py-12 min-h-screen selection:bg-indigo-500/30">
            <div className="max-w-6xl mx-auto space-y-12">
                <header className="mb-12">
                    <h1 className="text-4xl font-semibold tracking-tight mb-3">
                        {t("stress.title")}
                    </h1>
                    <p className="text-sm text-[#a1a1aa] max-w-3xl">
                        {t("stress.subtitle")}
                    </p>
                </header>

                <div className="space-y-0">
                    {/* Section 1: Identity */}
                    <div ref={identityRef} className="relative z-40">
                        <CollapsibleStep
                            stepNumber={1}
                            title={t("stress.step.identity")}
                            isExpanded={currentStep === 'identity'}
                            isCompleted={completedSteps.includes('identity')}
                            summary={completedSteps.includes('identity') ? `${t("stress.identity.summary_target")}: ${selectedPersonaName.split(' — ')[0]} | ${selectedLevelName}` : undefined}
                            onToggle={() => {
                                setCurrentStep('identity');
                                scrollToStep('identity');
                            }}
                        >
                            <IdentitySection
                                personas={personas}
                                personaType={personaType}
                                setPersonaType={setPersonaType}
                                levels={levels}
                                challengeLevelId={challengeLevelId}
                                setChallengeLevelId={setChallengeLevelId}
                                onContinue={handleContinueToInput}
                                onViewDossier={handleViewDossier}
                            />
                        </CollapsibleStep>
                    </div>

                    {/* Section 2: Strategy Input */}
                    <div ref={strategyRef} className="relative z-30">
                        <CollapsibleStep
                            stepNumber={2}
                            title={t("stress.step.strategy")}
                            isExpanded={currentStep === 'strategy'}
                            isCompleted={completedSteps.includes('strategy')}
                            summary={idea ? `Pitch: ${idea.slice(0, 60)}...` : undefined}
                            disabled={!completedSteps.includes('identity')}
                            onToggle={() => {
                                setCurrentStep('strategy');
                                scrollToStep('strategy');
                            }}
                        >
                            <IdeaSection
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
                        </CollapsibleStep>
                    </div>

                    {/* Section 3: Intelligence Output */}
                    <div ref={resultsRef} className="relative z-20">
                        <CollapsibleStep
                            stepNumber={3}
                            title={t("stress.step.analysis")}
                            isExpanded={currentStep === 'results'}
                            isCompleted={!!result && !loading}
                            summary={result?.confidenceScore ? `${t("stress.report.confidence_score")}: ${result.confidenceScore}/100` : undefined}
                            disabled={!result && !loading}
                            onToggle={() => {
                                setCurrentStep('results');
                                scrollToStep('results');
                            }}
                        >
                            {loading && !result ? (
                                <div className="space-y-6 animate-pulse">
                                    <div className="h-32 bg-white/5 rounded-2xl border border-white/10" />
                                    <div className="h-48 bg-white/5 rounded-2xl border border-white/10" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="h-64 bg-white/5 rounded-2xl border border-white/10" />
                                        <div className="h-64 bg-white/5 rounded-2xl border border-white/10" />
                                    </div>
                                </div>
                            ) : result ? (
                                <div className="space-y-12">
                                    <AnalysisResults
                                        result={result}
                                        personaNames={personaLookup}
                                        personaType={personaType}
                                        selectedPersonaName={selectedPersonaName}
                                        showDebug={showDebug}
                                        loading={loading}
                                    />
                                    <DebugPanel result={result} showDebug={showDebug} />
                                    
                                    {!loading && (
                                        <div className="flex flex-wrap items-center justify-between gap-6 pt-10 border-t border-white/5">
                                            <button
                                                onClick={handleExport}
                                                className="inline-flex items-center gap-3 px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-white/40 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:text-white transition-all shadow-sm"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                                {t("stress.download.analysis")}
                                            </button>

                                            <button
                                                onClick={() => void handleRefine()}
                                                disabled={refineLoading}
                                                className="inline-flex items-center gap-4 px-10 py-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-black text-xs tracking-[0.3em] uppercase transition-all shadow-[0_10px_30px_rgba(34,211,238,0.1)] hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:shadow-[0_15px_40px_rgba(34,211,238,0.2)] active:scale-95 disabled:opacity-50"
                                            >
                                                {refineLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 animate-pulse" />}
                                                {t("stress.refine.button_for_persona", { persona: selectedPersonaName.split(' — ')[0] })}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </CollapsibleStep>
                    </div>

                    {/* Section 4: Strategic Refinement */}
                    <div ref={refinementRef} className="relative z-10">
                        <CollapsibleStep
                            stepNumber={4}
                            title={t("stress.step.refinement")}
                            isExpanded={currentStep === 'refinement'}
                            isCompleted={completedSteps.includes('refinement')}
                            summary={refinedPitch ? t("stress.refine.refined_pitch") : undefined}
                            disabled={!result || loading}
                            onToggle={() => {
                                setCurrentStep('refinement');
                                scrollToStep('refinement');
                            }}
                        >
                            {result && !loading && (
                                <div className="px-0">
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
                                        hideTrigger={true}
                                    />
                                </div>
                            )}
                        </CollapsibleStep>
                    </div>
                </div>

                {error && (
                    <div className="glass border border-red-500/30 bg-red-500/5 p-4 rounded-2xl text-red-400 text-sm text-center animate-shake">
                        {error}
                    </div>
                )}
            </div>

            {viewingDossier && (
                <PersonaDossier
                    persona={viewingDossier}
                    onClose={() => setViewingDossier(null)}
                />
            )}
        </div>
    );
}
