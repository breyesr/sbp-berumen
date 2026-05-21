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

    const handleExport = () => {
        if (!object?.outputs) return;
        const selectedPersonaName = personas.find(p => p.id === personaType)?.name || personaType;
        const date = formatDate(new Date(), { dateStyle: "medium" });
        const lines: string[] = [];
        lines.push(t("copywriter.report.header"));
        lines.push(`${t("copywriter.report.generated")}: ${date}`);
        lines.push(`${t("copywriter.report.persona")}: ${selectedPersonaName}`);
        if (context) lines.push(`${t("copywriter.field.context")}: ${context}`);
        lines.push(`${t("copywriter.field.goal")}: ${goal}`);
        lines.push(`${t("copywriter.field.message")}: ${message}`);
        lines.push(``);
        object.outputs.forEach((o) => {
            if (!o) return;
          lines.push(`--- ${o.platformName || "Platform"} / ${o.formatName || "Format"} ---`);
          
          if (o.fields) {
            Object.entries(o.fields).forEach(([label, value]) => {
                lines.push(`${label.replace(/_/g, ' ').toUpperCase()}:`);
                lines.push(value || "");
                lines.push(``);
            });
          }
          lines.push(``);
        });
        const blob = new Blob([lines.join("\n")], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `copywriter-${date}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                                    <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                                        {t("copywriter.field.context")}
                                    </label>
                                    <div 
                                        className="cursor-help"
                                        onMouseEnter={() => setActiveTooltip('context')}
                                        onMouseLeave={() => setActiveTooltip(null)}
                                    >
                                        <Info className="w-4 h-4 text-white/20 hover:text-white/60 transition-colors" />
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
                                    className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none leading-relaxed text-white/90 shadow-inner"
                                />
                                <span className={clsx(
                                    "block text-[10px] font-bold text-right mt-2 tracking-widest",
                                    context.length < FIELD_LIMITS.context.min || context.length > FIELD_LIMITS.context.max ? "text-red-400" : "text-white/20"
                                )}>
                                    {context.length}/{FIELD_LIMITS.context.max}
                                </span>
                            </div>

                            {/* 2. Qué queremos comunicar */}
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-3 relative group">
                                    <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                                        {t("copywriter.field.message")}
                                    </label>
                                    <div 
                                        className="cursor-help"
                                        onMouseEnter={() => setActiveTooltip('message')}
                                        onMouseLeave={() => setActiveTooltip(null)}
                                    >
                                        <Info className="w-4 h-4 text-white/20 hover:text-white/60 transition-colors" />
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
                                    className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none leading-relaxed text-white/90 shadow-inner"
                                />
                                <span className={clsx(
                                    "block text-[10px] font-bold text-right mt-2 tracking-widest",
                                    message.length < FIELD_LIMITS.message.min || message.length > FIELD_LIMITS.message.max ? "text-red-400" : "text-white/20"
                                )}>
                                    {message.length}/{FIELD_LIMITS.message.max}
                                </span>
                            </div>

                            {/* 3. Meta / Objetivo */}
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-3 relative group">
                                    <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                                        {t("copywriter.field.goal")}
                                    </label>
                                    <div 
                                        className="cursor-help"
                                        onMouseEnter={() => setActiveTooltip('goal')}
                                        onMouseLeave={() => setActiveTooltip(null)}
                                    >
                                        <Info className="w-4 h-4 text-white/20 hover:text-white/60 transition-colors" />
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
                                    className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none leading-relaxed text-white/90 shadow-inner"
                                />
                                <span className={clsx(
                                    "block text-[10px] font-bold text-right mt-2 tracking-widest",
                                    goal.length < FIELD_LIMITS.goal.min || goal.length > FIELD_LIMITS.goal.max ? "text-red-400" : "text-white/20"
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
                                    className="px-12 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white transition-all flex items-center gap-3 font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-indigo-500/20"
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
                        <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-8 shadow-inner">
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

                        <div className="flex justify-between pt-8 border-t border-white/5">
                            <button
                                onClick={() => goToStep('strategy')}
                                className="px-8 py-4 rounded-2xl bg-white/5 text-zinc-400 hover:text-white transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest"
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
                                        className="px-6 py-3 rounded-xl bg-white/5 text-zinc-400 hover:text-white border border-white/5 transition-all text-[10px] font-black uppercase tracking-widest"
                                    >
                                        Ajustar Canales
                                    </button>
                                    <button
                                        onClick={handleExport}
                                        disabled={loading || outputs.length === 0}
                                        className="px-6 py-3 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                                    >
                                        <Download className="w-3.5 h-3.5" /> Exportar Plan
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
