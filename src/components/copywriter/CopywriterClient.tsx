"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { Download, Loader2 } from 'lucide-react';
import { useI18n } from "@/components/i18n/I18nProvider";
import { CollapsibleStep } from "@/components/ui/CollapsibleStep";
import { PersonaSection } from "./PersonaSection";
import { InputSection } from "./InputSection";
import { ResultSection } from "./ResultSection";
import { PersonaDossier } from "@/components/admin/PersonaDossier";
import { PersonaOption, Platform, OutputSchema, CopyOutput } from "./types";

interface CopywriterClientProps {
    initialPersonas: PersonaOption[];
    initialPlatforms: Platform[];
    personaLookup: Record<string, string>;
}

type Step = 'identity' | 'input' | 'results';

export function CopywriterClient({
    initialPersonas,
    initialPlatforms,
    personaLookup,
}: CopywriterClientProps) {
    const { t, formatDate } = useI18n();
    
    // Workflow State
    const [currentStep, setCurrentStep] = useState<Step>('identity');
    const [completedSteps, setCompletedSteps] = useState<Step[]>([]);

    const [personas] = useState<PersonaOption[]>(initialPersonas);
    const [personaType, setPersonaType] = useState<string | number>(initialPersonas[0]?.id || "");
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
    
    // AI SDK Hook for streaming objects
    const { object, submit, isLoading: loading, error: aiError } = useObject({
        api: "/api/copywriter",
        schema: OutputSchema,
    });

    const isFirstChunkRef = useRef(true);

    // Refs for scrolling
    const identityRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLDivElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    const stepRefs = {
        identity: identityRef,
        input: inputRef,
        results: resultsRef,
    };

    const scrollToStep = (step: Step) => {
        setTimeout(() => {
            const target = stepRefs[step].current;
            if (target) {
                const yOffset = -20;
                const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({
                    top: y,
                    behavior: "smooth"
                });
            }
        }, 500);
    };

    // Auto-expand results when streaming starts
    useEffect(() => {
        if (object && isFirstChunkRef.current) {
            setCurrentStep('results');
            if (!completedSteps.includes('input')) {
                setCompletedSteps(prev => [...prev, 'input']);
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
        if (personaType) {
            setCompletedSteps(prev => Array.from(new Set([...prev, 'identity'])));
            setCurrentStep('input');
            scrollToStep('input');
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

            // Update active tab if we removed the current one
            if (activeTab === id) {
                setActiveTab(next[0] || "");
            }

            return next;
          }

          // Adding a platform: Auto-select its first format
          const platform = platforms.find(p => p.id === id);
          if (platform && platform.formats.length > 0) {
              const firstFormatId = platform.formats[0].id;
              setSelectedFormats(prevF => [...prevF, firstFormatId]);
          }

          // Set as active tab
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
          lines.push(`${t("copywriter.output.primary")}: ${o.primaryCopy || ""}`);
          if (o.alternateCopy) lines.push(`${t("copywriter.output.alternate")}: ${o.alternateCopy}`);
          if (o.cta) lines.push(`${t("copywriter.output.cta")}: ${o.cta}`);
          if (o.hashtags?.length) lines.push(`${t("copywriter.output.hashtags")}: ${o.hashtags.join(" ")}`);
          if (o.notes?.length) {
            lines.push(`${t("copywriter.output.notes")}:`);
            o.notes.forEach((n) => lines.push(`- ${n}`));
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

    const selectedPersonaName = personaLookup[personaType] || t("stress.default_persona");

    const outputs = (object?.outputs || []) as CopyOutput[];

    return (
        <div className="bg-[#0a0a0a] text-[#ededed] px-6 py-8 md:py-12 min-h-screen selection:bg-indigo-500/30">
            <div className="max-w-6xl mx-auto space-y-12">
                <header className="mb-12">
                    <h1 className="text-4xl font-semibold tracking-tight mb-3">
                        {t("copywriter.title")}
                    </h1>
                    <p className="text-sm text-[#a1a1aa] max-w-3xl">
                        {t("copywriter.subtitle")}
                    </p>
                </header>

                <div className="space-y-0">
                    {/* Section 1: Identity */}
                    <div ref={identityRef} className="relative z-40">
                        <CollapsibleStep
                            stepNumber={1}
                            title={t("copywriter.step.identity")}
                            isExpanded={currentStep === 'identity'}
                            isCompleted={completedSteps.includes('identity')}
                            summary={completedSteps.includes('identity') ? `${t("stress.identity.summary_target")}: ${selectedPersonaName.split(' — ')[0]}` : undefined}
                            onToggle={() => {
                                setCurrentStep('identity');
                                scrollToStep('identity');
                            }}
                        >
                            <PersonaSection
                                personas={personas}
                                personaType={personaType}
                                setPersonaType={setPersonaType}
                                onContinue={handleContinueToInput}
                                onViewDossier={handleViewDossier}
                            />
                        </CollapsibleStep>
                    </div>

                    {/* Section 2: Input & Platforms */}
                    <div ref={inputRef} className="relative z-30">
                        <CollapsibleStep
                            stepNumber={2}
                            title={t("copywriter.step.input")}
                            isExpanded={currentStep === 'input'}
                            isCompleted={completedSteps.includes('input')}
                            summary={completedSteps.includes('input') ? `${selectedPlatforms.length} platforms | ${selectedFormats.length} formats` : undefined}
                            disabled={!completedSteps.includes('identity')}
                            onToggle={() => {
                                setCurrentStep('input');
                                scrollToStep('input');
                            }}
                        >
                            <InputSection
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
                                selectedPersonaName={selectedPersonaName}
                            />
                        </CollapsibleStep>
                    </div>

                    {/* Section 3: Intelligence Output */}
                    <div ref={resultsRef} className="relative z-20">
                        <CollapsibleStep
                            stepNumber={3}
                            title={t("copywriter.step.results")}
                            isExpanded={currentStep === 'results'}
                            isCompleted={outputs.length > 0 && !loading}
                            summary={outputs.length > 0 ? `${outputs.length} variants generated` : undefined}
                            disabled={outputs.length === 0 && !loading}
                            onToggle={() => {
                                setCurrentStep('results');
                                scrollToStep('results');
                            }}
                        >
                            {loading && outputs.length === 0 ? (
                                <div className="space-y-12 animate-pulse">
                                    <div className="h-12 bg-white/5 rounded-full w-48" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="h-64 bg-white/5 rounded-2xl border border-white/10" />
                                        <div className="h-64 bg-white/5 rounded-2xl border border-white/10" />
                                    </div>
                                </div>
                            ) : outputs.length > 0 ? (
                                <div className="space-y-12">
                                    <ResultSection
                                        outputs={outputs}
                                        loading={loading}
                                    />
                                    
                                    {!loading && (
                                        <div className="flex flex-wrap items-center justify-between gap-6 pt-10 border-t border-white/5">
                                            <button
                                                onClick={handleExport}
                                                className="inline-flex items-center gap-3 px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-white/40 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:text-white transition-all shadow-sm"
                                            >
                                                <Download className="w-4 h-4 text-zinc-500" />
                                                {t("copywriter.button.export")}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : null}
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
