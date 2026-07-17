"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { Download, Loader2, ArrowLeft, ArrowRight, Sparkles, Send, Target, Info, User, Zap } from 'lucide-react';
import { useI18n } from "@/components/i18n/I18nProvider";
import { usePersonaDossier } from "@/lib/hooks/usePersonaDossier";
import { useWorkflowState } from "@/lib/hooks/useWorkflowState";
import { IdentitySection } from "@/components/stress-test/IdentitySection";
import { InputSection } from "./InputSection";
import { ResultSection } from "./ResultSection";
import { FieldTooltip } from "@/components/ui/FieldTooltip";
import { PersonaSidebar } from "@/components/ui/PersonaSidebar";
import { PersonaDossier } from "@/components/admin/PersonaDossier";
import { StepWizardLayout, StepWizardContainer } from "@/components/layout/StepWizardLayout";
import { PersonaOption, Platform, OutputSchema, CopyOutput, FIELD_LIMITS } from "./types";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

interface CopywriterClientProps {
    initialPersonas: PersonaOption[];
    initialPlatforms: Platform[];
    personaLookup: Record<string, string>;
}

type Step = 'identity' | 'strategy' | 'channels' | 'results';

export function CopywriterClient({
    initialPersonas,
    initialPlatforms,
    personaLookup,
}: CopywriterClientProps) {
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

    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

    const [personas] = useState<PersonaOption[]>(initialPersonas);
    const [personaType, setPersonaType] = useState<string | number>("");
    const [platforms] = useState<Platform[]>(initialPlatforms);
    
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(initialPlatforms[0] ? [initialPlatforms[0].id] : []);
    const [selectedFormats, setSelectedFormats] = useState<string[]>(initialPlatforms[0]?.formats[0] ? [initialPlatforms[0].formats[0].id] : []);
    const [activeTab, setActiveTab] = useState<string>(initialPlatforms[0]?.id || "");

    const [context, setContext] = useState("");
    const [message, setMessage] = useState("");
    const [goal, setGoal] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [viewingDossier, setViewingDossier] = useState<any | null>(null);
    const [loadingDossier, setLoadingDossier] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);

    
    // Dossier logic centralized in hook
    const { dossier, isLoading: dossierLoading, fetchDossier } = usePersonaDossier(personaType);

    // AI SDK Hook for streaming objects
    const { object, submit, isLoading: loading, error: aiError } = useObject({
        api: "/api/copywriter",
        schema: OutputSchema,
    });

    const isFirstChunkRef = useRef(true);

    // Auto-expand results when streaming starts
    useEffect(() => {
        if (object && isFirstChunkRef.current) {
            completeStep('channels');
            goToStep('results');
            isFirstChunkRef.current = false;
        }
    }, [object, completeStep, goToStep]);

    useEffect(() => {
        if (aiError) {
            setError(aiError.message);
        }
    }, [aiError]);

    const handleContinueToStrategy = (newPersonaId?: string | number) => {
        const currentId = newPersonaId || personaType;
        if (currentId) {
            setPersonaType(currentId);
            completeStep('identity');
            goToStep('strategy');
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

    const availableFormats = useMemo(() => {
        return platforms
          .filter((p) => selectedPlatforms.includes(p.id))
          .flatMap((p) => p.formats);
    }, [platforms, selectedPlatforms]);

    const togglePlatform = (id: string) => {
        setSelectedPlatforms((prev) => {
          const exists = prev.includes(id);
          if (exists) {
            const next = prev.filter((p) => p !== id);
            
            // Clean up formats for the removed platform
            setSelectedFormats((formats) =>
              formats.filter((f) => {
                const fmt = availableFormats.find((af) => af.id === f);
                return fmt ? next.includes(fmt.platform_id) : false;
              })
            );

            if (activeTab === id) {
                setActiveTab(next[0] || "");
            }

            return next;
          }

          const platform = platforms.find(p => p.id === id);
          if (platform && platform.formats.length > 0) {
              const firstFormatId = platform.formats[0].id;
              setSelectedFormats(prevF => [...prevF, firstFormatId]);
          }

          setActiveTab(id);
          return [...prev, id];
        });
    };

    const toggleFormat = (id: string) => {
        setSelectedFormats((prev) =>
          prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
        );
    };

    const handleSubmit = async () => {
        setError(null);
        isFirstChunkRef.current = true;

        submit({
            personaType,
            context: context.trim(),
            message: message.trim(),
            goal: goal.trim(),
            platforms: selectedPlatforms,
            formats: selectedFormats,
        });
    };

    const handleExport = async () => {
        if (!object?.outputs) return;
        setExportLoading(true);
        setError(null);
        try {
            // Lazy load utility and PDF presentation template
            const { downloadPDF } = await import("@/lib/pdf/download");
            const { CopywriterPDF } = await import("./CopywriterPDF");

            const selectedPersonaName = personas.find(p => p.id === personaType)?.name || personaType.toString();
            const dateStr = formatDate(new Date(), { dateStyle: "medium" });

            const pdfDoc = (
                <CopywriterPDF
                    personaName={selectedPersonaName}
                    goal={goal}
                    context={context}
                    message={message}
                    outputs={outputs}
                    date={dateStr}
                    labels={{
                        title: t("copywriter.report.header") || "Reporte de Copys - IntelAgent",
                        generated: t("copywriter.report.generated") || "Generado",
                        persona: t("copywriter.report.persona") || "Persona",
                        goal: t("copywriter.field.goal") || "Objetivo",
                        context: t("copywriter.field.context") || "Contexto",
                        message: t("copywriter.field.message") || "Mensaje",
                        platform: t("copywriter.step.channels") || "Canal",
                        format: "Formato",
                        anchors: "Anclas Utilizadas",
                        triggers: "Triggers Abordados",
                        reasoning: "Razonamiento Estratégico",
                        footerText: "IntelAgent Analytics & Copywriter Reports",
                        pageOf: "Página {current} de {total}",
                    }}
                />
            );

            const cleanPersonaName = selectedPersonaName.split(" — ")[0].trim().replace(/\s+/g, "_");
            const fileName = `IntelAgent-Copywriter-${cleanPersonaName}-${new Date().toISOString().slice(0, 10)}.pdf`;

            await downloadPDF(pdfDoc, fileName);
        } catch (err) {
            console.error("PDF export failed:", err);
            setError(err instanceof Error ? err.message : "Error al exportar PDF");
        } finally {
            setExportLoading(false);
        }
    };


    const selectedPersona = personas.find(p => p.id === personaType || p.id.toString() === personaType.toString());
    const personaDisplayName = selectedPersona?.name || "";
    const nameParts = personaDisplayName.split(' — ');
    const personaNameOnly = nameParts[0] || "";
    const personaRoleOnly = nameParts[1] || "Decisor";

    const outputs = (object?.outputs || []) as CopyOutput[];

    const isBriefingValid = message.trim().length >= FIELD_LIMITS.message.min &&
                           goal.trim().length >= FIELD_LIMITS.goal.min;

    return (
        <StepWizardContainer>
            <AnimatePresence mode="wait">
                {/* Step 1: Identity Selection */}
                {currentStep === 'identity' && (
                    <StepWizardLayout stepKey="identity">
                        <IdentitySection
                            personas={personas}
                            personaType={personaType}
                            setPersonaType={setPersonaType}
                            onContinue={handleContinueToStrategy}
                            onViewDossier={handleViewDossier}
                            confirmTitleKey="copywriter.persona.confirm_title"
                        />
                    </StepWizardLayout>
                )}

                {/* Step 2: Strategic Briefing */}
                {currentStep === 'strategy' && (
                    <StepWizardLayout 
                        stepKey="strategy"
                        header={{
                            title: t("copywriter.step.strategy"),
                            description: t("copywriter.step.strategy_desc"),
                            onBack: () => goToStep('identity'),
                            backLabel: "Cambiar Persona"
                        }}
                        sidebar={(
                            <PersonaSidebar
                                persona={selectedPersona || null}
                                dossier={dossier}
                                isLoading={dossierLoading}
                            />
                        )}
                    >
                        <div className="space-y-6">
                            {/* 1. Contexto */}
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-3 relative group">
                                    <label className="block text-xs font-bold uppercase tracking-[0.2em] text-foreground-muted font-brand">
                                        {t("copywriter.field.context")}
                                    </label>
                                    <div 
                                        className="cursor-help"
                                        onMouseEnter={() => setActiveTooltip('context')}
                                        onMouseLeave={() => setActiveTooltip(null)}
                                    >
                                        <Info className="w-3.5 h-3.5 text-foreground-subtle hover:text-primary transition-colors" />
                                    </div>
                                    <AnimatePresence>
                                        {activeTooltip === 'context' && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute left-[150px] top-0 z-50 pointer-events-none"
                                            >
                                                <FieldTooltip 
                                                    title={t("copywriter.tooltip.context.title")}
                                                    expectation={t("copywriter.tooltip.context.expectation")}
                                                    mechanism={t("copywriter.tooltip.context.mechanism")}
                                                    example={t("copywriter.tooltip.context.example")}
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <textarea
                                    value={context}
                                    onChange={(e) => setContext(e.target.value)}
                                    placeholder={t("copywriter.placeholder.context")}
                                    rows={4}
                                    className="w-full bg-surface border border-border rounded-3xl px-6 py-5 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none leading-relaxed font-body shadow-sm"
                                />
                                <span className={clsx(
                                    "block text-[10px] font-bold text-right mt-2 tracking-widest font-brand",
                                    context.length < FIELD_LIMITS.context.min || context.length > FIELD_LIMITS.context.max ? "text-error" : "text-foreground-subtle"
                                )}>
                                    {context.length}/{FIELD_LIMITS.context.max}
                                </span>
                            </div>

                            {/* 2. Qué queremos comunicar */}
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-3 relative group">
                                    <label className="block text-xs font-bold uppercase tracking-[0.2em] text-foreground-muted font-brand">
                                        {t("copywriter.field.message")}
                                    </label>
                                    <div 
                                        className="cursor-help"
                                        onMouseEnter={() => setActiveTooltip('message')}
                                        onMouseLeave={() => setActiveTooltip(null)}
                                    >
                                        <Info className="w-3.5 h-3.5 text-foreground-subtle hover:text-primary transition-colors" />
                                    </div>
                                    <AnimatePresence>
                                        {activeTooltip === 'message' && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute left-[150px] top-0 z-50 pointer-events-none"
                                            >
                                                <FieldTooltip 
                                                    title={t("copywriter.tooltip.message.title")}
                                                    expectation={t("copywriter.tooltip.message.expectation")}
                                                    mechanism={t("copywriter.tooltip.message.mechanism")}
                                                    example={t("copywriter.tooltip.message.example")}
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={t("copywriter.placeholder.message")}
                                    rows={6}
                                    className="w-full bg-surface border border-border rounded-3xl px-6 py-5 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none leading-relaxed font-body shadow-sm"
                                />
                                <span className={clsx(
                                    "block text-[10px] font-bold text-right mt-2 tracking-widest font-brand",
                                    message.length < FIELD_LIMITS.message.min || message.length > FIELD_LIMITS.message.max ? "text-error" : "text-foreground-subtle"
                                )}>
                                    {message.length}/{FIELD_LIMITS.message.max}
                                </span>
                            </div>

                            {/* 3. Meta / Objetivo */}
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-3 relative group">
                                    <label className="block text-xs font-bold uppercase tracking-[0.2em] text-foreground-muted font-brand">
                                        {t("copywriter.field.goal")}
                                    </label>
                                    <div 
                                        className="cursor-help"
                                        onMouseEnter={() => setActiveTooltip('goal')}
                                        onMouseLeave={() => setActiveTooltip(null)}
                                    >
                                        <Info className="w-3.5 h-3.5 text-foreground-subtle hover:text-primary transition-colors" />
                                    </div>
                                    <AnimatePresence>
                                        {activeTooltip === 'goal' && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute left-[180px] top-0 z-50 pointer-events-none"
                                            >
                                                <FieldTooltip 
                                                    title={t("copywriter.tooltip.goal.title")}
                                                    expectation={t("copywriter.tooltip.goal.expectation")}
                                                    mechanism={t("copywriter.tooltip.goal.mechanism")}
                                                    example={t("copywriter.tooltip.goal.example")}
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <textarea
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    placeholder={t("copywriter.placeholder.goal")}
                                    rows={3}
                                    className="w-full bg-surface border border-border rounded-3xl px-6 py-5 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none leading-relaxed font-body shadow-sm"
                                />
                                <span className={clsx(
                                    "block text-[10px] font-bold text-right mt-2 tracking-widest font-brand",
                                    goal.length < FIELD_LIMITS.goal.min || goal.length > FIELD_LIMITS.goal.max ? "text-error" : "text-foreground-subtle"
                                )}>
                                    {goal.length}/{FIELD_LIMITS.goal.max}
                                </span>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    disabled={!isBriefingValid}
                                    onClick={() => {
                                        completeStep('strategy');
                                        goToStep('channels');
                                    }}
                                    className="px-12 py-4 rounded-2xl bg-primary hover:bg-primary-hover disabled:opacity-30 text-white transition-all flex items-center gap-3 font-bold uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-primary/20 font-brand"
                                >
                                    Siguiente <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </StepWizardLayout>
                )}

                {/* Step 3: Channel Matrix */}
                {currentStep === 'channels' && (
                    <StepWizardLayout 
                        stepKey="channels"
                        header={{
                            title: t("copywriter.step.channels"),
                            description: t("copywriter.step.channels_desc"),
                            onBack: () => goToStep('strategy')
                        }}
                    >
                        <div className="bg-surface/30 border border-border rounded-3xl p-8 shadow-inner">
                            <InputSection
                                hideStrategicInputs={true}
                                context={context}
                                setContext={setContext}
                                message={message}
                                setMessage={setMessage}
                                goal={goal}
                                setGoal={setGoal}
                                platforms={platforms}
                                selectedPlatforms={selectedPlatforms}
                                togglePlatform={togglePlatform}
                                selectedFormats={selectedFormats}
                                toggleFormat={toggleFormat}
                                setSelectedFormats={setSelectedFormats}
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                loading={loading}
                                onSubmit={handleSubmit}
                                selectedPersonaName={personaDisplayName}
                            />
                        </div>

                        <div className="flex justify-between pt-8 border-t border-border">
                            <button
                                onClick={() => goToStep('strategy')}
                                className="px-8 py-4 rounded-2xl bg-surface text-foreground-muted hover:text-foreground border border-border transition-all flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest font-brand"
                            >
                                <ArrowLeft className="w-4 h-4" /> Volver
                            </button>
                        </div>
                    </StepWizardLayout>
                )}

                {/* Step 4: Output Factory */}
                {currentStep === 'results' && (
                    <StepWizardLayout 
                        stepKey="results"
                        header={{
                            title: t("copywriter.step.results"),
                            description: t("copywriter.step.results_desc"),
                            actions: (
                                <>
                                    <button
                                        onClick={() => goToStep('channels')}
                                        className="px-6 py-3 rounded-xl bg-surface text-foreground-muted hover:text-foreground border border-border transition-all text-[10px] font-bold uppercase tracking-widest font-brand"
                                    >
                                        Ajustar Canales
                                    </button>
                                    <button
                                        onClick={handleExport}
                                        disabled={loading || exportLoading || outputs.length === 0}
                                        className="px-6 py-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 font-brand"
                                    >
                                        {exportLoading ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <Download className="w-3.5 h-3.5" />
                                        )}
                                        {exportLoading ? "Generando PDF..." : "Exportar Plan"}
                                    </button>

                                </>
                            )
                        }}
                    >
                        <ResultSection
                            outputs={outputs}
                            loading={loading}
                            selectedFormats={selectedFormats}
                            platforms={platforms}
                        />
                    </StepWizardLayout>
                )}
            </AnimatePresence>

            {viewingDossier && (
                <PersonaDossier
                    persona={viewingDossier}
                    onClose={() => setViewingDossier(null)}
                />
            )}

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </StepWizardContainer>
    );
}
