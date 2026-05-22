"use client";

import { useEffect, useRef, useState } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { Sparkles, Loader2, ArrowLeft, Download, Info, CheckCircle2 } from 'lucide-react';
import { useI18n } from "@/components/i18n/I18nProvider";
import { usePersonaDossier } from "@/lib/hooks/usePersonaDossier";
import { useWorkflowState } from "@/lib/hooks/useWorkflowState";
import { IdentitySection } from "./IdentitySection";
import { IdeaSection } from "./IdeaSection";
import { AnalysisResults } from "./AnalysisResults";
import { RefinementPanel } from "./RefinementPanel";
import { DebugPanel } from "./DebugPanel";
import { PersonaDossier } from "@/components/admin/PersonaDossier";
import { StepWizardLayout, StepWizardContainer } from "@/components/layout/StepWizardLayout";
import { PersonaSidebar } from "@/components/ui/PersonaSidebar";
import { ScoringBreakdown } from "./ScoringBreakdown";
import { StressResult, PersonaOption, ChallengeLevelOption, SimulationResultSchema } from "./types";
import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "clsx";

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
    const { 
        currentStep, 
        setCurrentStep, 
        completedSteps, 
        setCompletedSteps, 
        goToStep, 
        completeStep 
    } = useWorkflowState<Step>('identity');

    const [personas] = useState<PersonaOption[]>(initialPersonas);
    const [personaType, setPersonaType] = useState<string | number>("");
    const [levels] = useState<ChallengeLevelOption[]>(initialLevels);
    
    // Hardcode level to Intensity 3 per design decision
    const challengeLevelId = levels.find(l => l.intensity === 3)?.id || levels[0]?.id || "";
    
    const [idea, setIdea] = useState("");
    const [goal, setGoal] = useState("");
    const [evaluationFocus, setEvaluationFocus] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [viewingDossier, setViewingDossier] = useState<any | null>(null);
    const [loadingDossier, setLoadingDossier] = useState(false);

    const [refineLoading, setRefineLoading] = useState(false);
    const [refineError, setRefineError] = useState<string | null>(null);
    const [refineQuestions, setRefineQuestions] = useState<string[]>([]);
    const [refineAnswers, setRefineAnswers] = useState<string[]>([]);
    const [refinedPitch, setRefinedPitch] = useState<string | null>(null);
    const [refineChanges, setRefineChanges] = useState<string[]>([]);
    
    const [showDebug, setShowDebug] = useState(false);
    const isFirstChunkRef = useRef(true);

    // Dossier logic centralized in hook
    const { dossier, isLoading: dossierLoading, fetchDossier } = usePersonaDossier(personaType);

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

    useEffect(() => {
        const envEnabled = process.env.NEXT_PUBLIC_STRESS_DEBUG === "1";
        const queryEnabled = typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("debug") === "1"
            : false;
        setShowDebug(envEnabled && queryEnabled);
    }, []);

    // AI SDK Hook for streaming objects
    const { object, submit, isLoading: loading, error: aiError } = useObject({
        api: "/api/stress-test",
        schema: SimulationResultSchema,
    });

    // Auto-expand results when streaming starts
    useEffect(() => {
        if (object && isFirstChunkRef.current) {
            completeStep('strategy');
            goToStep('results', true, resultsRef);
            isFirstChunkRef.current = false;
        }
    }, [object, completeStep, goToStep]);

    useEffect(() => {
        if (aiError) {
            setError(aiError.message);
        }
    }, [aiError]);

    const handleContinueToInput = (newPersonaId?: string | number) => {
        const currentId = newPersonaId || personaType;
        if (currentId && challengeLevelId) {
            setPersonaType(currentId);
            completeStep('identity');
            goToStep('strategy', true, strategyRef);
        }
    };

    const handleViewDossier = async (id: string | number) => {
        if (loadingDossier) return;
        setLoadingDossier(true);
        try {
            const persona = await fetchDossier(id);
            if (persona) setViewingDossier(persona);
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
                goToStep('refinement', true, refinementRef);
            } else {
                setRefineQuestions([]);
                setRefineAnswers([]);
                setRefinedPitch(json.refinedPitch ?? "");
                setRefineChanges(Array.isArray(json.changesSummary) ? json.changesSummary : []);
                completeStep('refinement');
                goToStep('refinement', true, refinementRef);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : t("stress.error.refine");
            setRefineError(message);
        } finally {
            setRefineLoading(false);
        }
    };

    const handleExport = () => {
        if (!result) return;
        let content = `ANÁLISIS DE STRESS TEST ESTRATÉGICOn`;
        content += `Fecha: ${formatDate(new Date())}\n`;
        content += `Persona: ${result.persona}\n`;
        content += `Idea Original: ${idea}\n`;
        content += `Nivel de Reto: ${selectedLevelName}\n\n`;
        content += `VEREDICTO: ${result.verdict}\n`;
        content += `CONFIANZA: ${result.confidenceScore}%\n\n`;
        content += `REACCIÓN DE LA PERSONA:\n${result.personaReaction}\n\n`;
        content += `FORTALEZAS:\n- ${result.strengths.join('\n- ')}\n\n`;
        content += `BRECHAS Y RIESGOS:\n- ${result.gaps.join('\n- ')}\n\n`;
        content += `PLAN DE ACCIÓN:\n- ${result.actionPlan.join('\n- ')}\n`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `stress-test-${personaType}-${new Date().getTime()}.txt`;
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

    const selectedPersonaName = personaLookup[personaType] || t("stress.default_persona");
    const selectedLevelName = levels.find(l => l.id === challengeLevelId)?.name || "";
    const selectedPersona = personas.find(p => p.id === personaType || p.id.toString() === personaType.toString());

    const getConfidenceBadgeColor = (score: number) => {
        if (score === 0) return 'text-foreground-subtle';
        if (score >= 70) return 'text-success';
        if (score >= 40) return 'text-warning';
        return 'text-error';
    };

    const result: StressResult | null = object ? {
        ...object as any,
        persona: selectedPersonaName,
    } : null;

    return (
        <StepWizardContainer>
            <AnimatePresence mode="wait">
                {/* Section 1: Identity */}
                {currentStep === 'identity' && (
                    <StepWizardLayout stepKey="identity">
                        <div ref={identityRef}>
                            <IdentitySection
                                personas={personas}
                                personaType={personaType}
                                setPersonaType={setPersonaType}
                                onContinue={handleContinueToInput}
                                onViewDossier={handleViewDossier}
                            />
                        </div>
                    </StepWizardLayout>
                )}

                    {/* Section 2: Strategy Input */}
                    {currentStep === 'strategy' && (
                        <StepWizardLayout 
                            stepKey="strategy"
                            header={{
                                title: t("stress.step.strategy"),
                                onBack: () => goToStep('identity'),
                                backLabel: t("stress.step.change_persona")
                            }}
                            sidebar={(
                                <PersonaSidebar
                                    persona={selectedPersona || null}
                                    dossier={dossier}
                                    isLoading={dossierLoading}
                                />
                            )}
                        >
                            <div ref={strategyRef}>
                                <IdeaSection
                                    idea={idea}
                                    setIdea={setIdea}
                                    goal={goal}
                                    setGoal={setGoal}
                                    evaluationFocus={evaluationFocus}
                                    setEvaluationFocus={setEvaluationFocus}
                                    loading={loading}
                                    onSubmit={handleSubmit}
                                    personaId={personaType as string}
                                    personas={personas}
                                    isMainColumnOnly={true}
                                />
                            </div>
                        </StepWizardLayout>
                    )}

                    {/* Section 3: Intelligence Output */}
                    {currentStep === 'results' && (
                        <StepWizardLayout 
                            stepKey="results"
                            header={{
                                title: t("stress.step.analysis"),
                                onBack: () => goToStep('strategy'),
                                backLabel: t("stress.step.strategy")
                            }}
                            sidebar={(
                                <div className="space-y-6">
                                    <PersonaSidebar
                                        persona={selectedPersona || null}
                                        isLoading={dossierLoading}
                                        variant="compact"
                                        footer={result && (
                                            <div>
                                                <div className={clsx(
                                                    "text-5xl font-bold tracking-tighter font-brand",
                                                    getConfidenceBadgeColor(result.confidenceScore || 0)
                                                )}>
                                                    {result.confidenceScore && result.confidenceScore > 0 
                                                        ? `${result.confidenceScore}%`
                                                        : "..."}
                                                </div>
                                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground-subtle mt-2 block font-brand">
                                                    De Confianza
                                                </span>
                                            </div>
                                        )}
                                    />

                                    {/* Desglose de Confianza (DSE) - Moved outside the Persona card */}
                                    {result?.confidenceBreakdown && (
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
                        >
                            <div ref={resultsRef}>
                                {loading && !result ? (
                                    <div className="space-y-6 animate-pulse">
                                        <div className="h-32 bg-surface border border-border rounded-2xl" />
                                        <div className="h-48 bg-surface border border-border rounded-2xl" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="h-64 bg-surface border border-border rounded-2xl" />
                                            <div className="h-64 bg-surface border border-border rounded-2xl" />
                                        </div>
                                    </div>
                                ) : result ? (
                                    <div className="space-y-12">
                                        <AnalysisResults
                                            result={result}
                                            personaNames={personaLookup}
                                            personaType={personaType}
                                            selectedPersonaName={selectedPersonaName}
                                            personas={personas}
                                            showDebug={showDebug}
                                            loading={loading}
                                            isMainColumnOnly={true}
                                        />
                                        <DebugPanel result={result} showDebug={showDebug} />
                                        
                                        {!loading && (
                                            <div className="flex flex-wrap items-center justify-between gap-6 pt-10 border-t border-border">
                                                <button
                                                    onClick={handleExport}
                                                    className="inline-flex items-center gap-3 px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-foreground-muted bg-surface border border-border rounded-2xl hover:bg-surface-hover hover:text-foreground transition-all shadow-sm font-brand"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground-subtle"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                                    {t("stress.download.analysis")}
                                                </button>

                                                <button
                                                    onClick={() => void handleRefine()}
                                                    disabled={refineLoading}
                                                    className="inline-flex items-center gap-4 px-10 py-5 rounded-2xl bg-primary/10 border border-primary/30 text-primary font-bold text-xs tracking-[0.3em] uppercase transition-all shadow-lg hover:bg-primary/20 hover:border-primary/50 active:scale-95 disabled:opacity-50 font-brand"
                                                >
                                                    {refineLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 animate-pulse" />}
                                                    {t("stress.refine.button_simple")}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        </StepWizardLayout>
                    )}

                {/* Section 4: Strategic Refinement */}
                {currentStep === 'refinement' && result && !loading && (
                    <StepWizardLayout 
                        stepKey="refinement"
                        header={{
                            title: t("stress.step.refinement"),
                            onBack: () => goToStep('results'),
                            backLabel: t("stress.step.analysis")
                        }}
                        sidebar={(
                            <PersonaSidebar
                                persona={selectedPersona || null}
                                isLoading={dossierLoading}
                                variant="compact"
                                footer={(
                                    <div className="space-y-6">
                                        <div className="pt-6 border-t border-border">
                                            <div className={clsx(
                                                "text-5xl font-bold tracking-tighter font-brand",
                                                getConfidenceBadgeColor(result.confidenceScore || 0)
                                            )}>
                                                {result.confidenceScore && result.confidenceScore > 0 
                                                    ? `${result.confidenceScore}%`
                                                    : "..."}
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground-subtle mt-2 block font-brand">
                                                De Confianza
                                            </span>
                                        </div>

                                        {/* Dynamic Context Box (Restored to Sidebar Footer to match staging) */}
                                        {!refinedPitch ? (
                                            <div className="bg-surface border border-border rounded-[2rem] p-8 shadow-xl animate-fade-in space-y-6">
                                                <div className="flex items-center gap-3 border-b border-border pb-4">
                                                    <Info className="w-5 h-5 text-primary" />
                                                    <h3 className="text-sm font-bold uppercase tracking-wider text-primary font-brand">
                                                        Contexto del Análisis
                                                    </h3>
                                                </div>
                                                
                                                {result.personaReaction && (
                                                    <div className="space-y-2">
                                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground-subtle block font-brand">Reacción</span>
                                                        <p className="text-xs text-foreground-muted leading-relaxed italic border-l-2 border-primary/30 pl-3 font-body">"{result.personaReaction}"</p>
                                                    </div>
                                                )}

                                                {result.gaps && result.gaps.length > 0 && (
                                                    <div className="space-y-2">
                                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground-subtle block font-brand">Puntos a Mejorar</span>
                                                        <ul className="space-y-2 font-body">
                                                            {result.gaps.map((gap, idx) => (
                                                                <li key={idx} className="flex items-start gap-2 text-xs text-foreground-muted">
                                                                    <span className="text-warning/50 flex-shrink-0 mt-0.5">•</span>
                                                                    <span className="leading-relaxed">{gap}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="bg-gradient-to-br from-success/5 to-transparent border-2 border-success/10 rounded-[2rem] p-8 shadow-xl animate-fade-in">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <CheckCircle2 className="w-5 h-5 text-success" />
                                                    <h3 className="text-sm font-bold uppercase tracking-wider text-success font-brand">
                                                        Cambios Clave
                                                    </h3>
                                                </div>
                                                <ul className="space-y-4 font-body">
                                                    {refineChanges.map((change, idx) => (
                                                        <li key={idx} className="flex items-start gap-3 text-sm text-foreground-muted">
                                                            <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                <CheckCircle2 className="w-3 h-3 text-success" />
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
                        )}
                    >
                        <div ref={refinementRef}>
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
                                    personas={personas}
                                    personaId={personaType as string}
                                    isMainColumnOnly={true}
                                />
                            </div>
                        </div>
                    </StepWizardLayout>
                )}
            </AnimatePresence>

            {error && (
                <div className="max-w-6xl mx-auto mt-6">
                    <div className="bg-error/10 border border-error/20 p-4 rounded-2xl text-error text-sm text-center animate-shake font-bold font-brand uppercase tracking-widest shadow-sm">
                        {error}
                    </div>
                </div>
            )}

            {viewingDossier && (
                <PersonaDossier
                    persona={viewingDossier}
                    onClose={() => setViewingDossier(null)}
                />
            )}
        </StepWizardContainer>
    );
}
