"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { Download, Loader2, ArrowLeft, ArrowRight, Sparkles, Send, Target, Info, User, Zap } from 'lucide-react';
import { useI18n } from "@/components/i18n/I18nProvider";
import { IdentitySection } from "@/components/stress-test/IdentitySection";
import { InputSection } from "./InputSection";
import { ResultSection } from "./ResultSection";
import { PersonaDossier } from "@/components/admin/PersonaDossier";
import { PersonaOption, Platform, OutputSchema, CopyOutput, FIELD_LIMITS } from "./types";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

interface LinearCopywriterClientProps {
    initialPersonas: PersonaOption[];
    initialPlatforms: Platform[];
    personaLookup: Record<string, string>;
}

type Step = 'identity' | 'strategy' | 'channels' | 'results';

interface FieldTooltipProps {
  title: string;
  expectation: string;
  mechanism: string;
  example: string;
}

function FieldTooltip({ title, expectation, mechanism, example }: FieldTooltipProps) {
  const { t } = useI18n();
  return (
    <div className="p-5 rounded-2xl bg-[#171717]/95 backdrop-blur-xl border border-white/10 space-y-4 max-w-xs shadow-2xl">
      <div className="flex items-center gap-2 text-indigo-400">
        <Info className="w-4 h-4" />
        <h5 className="text-xs font-bold uppercase tracking-wider">{title}</h5>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">{t("stress.tooltip.expectation")}</p>
          <p className="text-xs text-white/80 leading-relaxed">{expectation}</p>
        </div>
        <div>
          <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">{t("stress.tooltip.mechanism")}</p>
          <p className="text-xs text-white/80 leading-relaxed">{mechanism}</p>
        </div>
        <div>
          <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">{t("stress.tooltip.example")}</p>
          <ul className="list-disc pl-4 text-xs text-indigo-300/90 space-y-1">
            {example.split('|').map((item, i) => <li key={i}>{item.trim()}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function LinearCopywriterClient({
    initialPersonas,
    initialPlatforms,
    personaLookup,
}: LinearCopywriterClientProps) {
    const { t, formatDate } = useI18n();
    
    // Workflow State
    const [currentStep, setCurrentStep] = useState<Step>('identity');
    const [completedSteps, setCompletedSteps] = useState<Step[]>([]);
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
    
    const [dossier, setDossier] = useState<any | null>(null);
    const [dossierLoading, setDossierLoading] = useState(false);

    // AI SDK Hook for streaming objects
    const { object, submit, isLoading: loading, error: aiError } = useObject({
        api: "/api/copywriter",
        schema: OutputSchema,
    });

    const isFirstChunkRef = useRef(true);

    // Auto-expand results when streaming starts
    useEffect(() => {
        if (object && isFirstChunkRef.current) {
            setCurrentStep('results');
            if (!completedSteps.includes('channels')) {
                setCompletedSteps(prev => [...prev, 'channels']);
            }
            isFirstChunkRef.current = false;
            // Prevent the browser from auto-scrolling down with the expanding content
            // by forcing the view to the top of the new Results page.
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [object, completedSteps]);

    useEffect(() => {
        if (aiError) {
            setError(aiError.message);
        }
    }, [aiError]);

    // Load Dossier when persona changes
    useEffect(() => {
        if (!personaType) return;
        setDossierLoading(true);
        fetch(`/api/personas/${encodeURIComponent(personaType)}`)
          .then(res => res.json())
          .then(data => {
            if (data.persona) setDossier(data.persona);
          })
          .catch(err => console.error("Failed to load dossier", err))
          .finally(() => setDossierLoading(false));
    }, [personaType]);

    const handleContinueToStrategy = (newPersonaId?: string | number) => {
        const currentId = newPersonaId || personaType;
        if (currentId) {
            setPersonaType(currentId);
            setCompletedSteps(prev => Array.from(new Set([...prev, 'identity'])));
            setCurrentStep('strategy');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleViewDossier = async (id: string | number) => {
        if (loadingDossier) return;
        setLoadingDossier(true);
        try {
            const res = await fetch(`/api/personas/${encodeURIComponent(id)}`);
            if (!res.ok) throw new Error("Failed to fetch persona data");
            const data = await res.json();
            if (data.persona) {
                setViewingDossier(data.persona);
            }
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
        <div className="bg-[#0a0a0a] text-[#ededed] min-h-screen selection:bg-indigo-500/30 font-sans antialiased overflow-x-hidden">
            
            <div className="max-w-6xl mx-auto px-6 py-8 md:py-12 relative z-40">
                
                <AnimatePresence mode="wait">
                    {/* Step 1: Identity Selection */}
                    {currentStep === 'identity' && (
                        <motion.div
                            key="identity"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <IdentitySection
                                personas={personas}
                                personaType={personaType}
                                setPersonaType={setPersonaType}
                                onContinue={handleContinueToStrategy}
                                onViewDossier={handleViewDossier}
                            />
                        </motion.div>
                    )}

                    {/* Step 2: Strategic Briefing */}
                    {currentStep === 'strategy' && (
                        <motion.div
                            key="strategy"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-0"
                        >
                            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                                <div>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">
                                        {t("copywriter.step.strategy")}
                                    </h2>
                                    <p className="text-base text-zinc-400 font-medium tracking-wide">
                                        {t("copywriter.step.strategy_desc")}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setCurrentStep('identity')}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-xs font-bold"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Cambiar Persona
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left: Briefing Form */}
                                <div className="lg:col-span-2 space-y-6">
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
                                                setCompletedSteps(prev => [...prev, 'strategy']);
                                                setCurrentStep('channels');
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="px-12 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white transition-all flex items-center gap-3 font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-indigo-500/20"
                                        >
                                            Siguiente <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Right Column: Persistent Context Card */}
                                <div className="lg:col-span-1">
                                    <div className="sticky top-8 rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col shadow-2xl overflow-hidden">
                                        <div className="p-6 border-b border-white/5 bg-gradient-to-br from-indigo-500/5 to-transparent">
                                            <div className="flex items-center gap-4">
                                                {selectedPersona?.photo_url ? (
                                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-indigo-500/30 flex-shrink-0">
                                                        <img src={selectedPersona.photo_url} alt={personaNameOnly} className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                                        <User className="w-8 h-8 text-indigo-400/50" />
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="text-[9px] font-black tracking-[0.2em] uppercase text-indigo-400 block mb-1">
                                                        {selectedPersona?.cluster || "Cluster"}
                                                    </span>
                                                    <h3 className="text-lg font-black text-white leading-tight uppercase">
                                                        {personaNameOnly}
                                                    </h3>
                                                    <p className="text-xs text-zinc-500 font-medium italic">
                                                        {personaRoleOnly}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="p-6 space-y-8">
                                            {dossierLoading ? (
                                                <div className="space-y-4 animate-pulse">
                                                    <div className="h-2 w-24 bg-white/5 rounded-full" />
                                                    <div className="h-20 bg-white/5 rounded-2xl" />
                                                </div>
                                            ) : dossier && (
                                                <>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 text-indigo-400">
                                                            <Sparkles className="w-4 h-4" />
                                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Síntesis Ejecutiva</h4>
                                                        </div>
                                                        <p className="text-xs leading-relaxed text-zinc-300 p-4 bg-black/40 rounded-2xl border border-white/5">
                                                            {dossier.metadata.strategic_synthesis || dossier.metadata.synthesis}
                                                        </p>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 text-amber-400">
                                                            <Zap className="w-4 h-4" />
                                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Dolores Principales</h4>
                                                        </div>
                                                        <ul className="space-y-2">
                                                            {dossier.metadata.pains?.slice(0,3).map((p: string, i: number) => (
                                                                <li key={i} className="text-xs text-zinc-400 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">{p}</li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 text-emerald-400">
                                                            <Target className="w-4 h-4" />
                                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Metas Estratégicas</h4>
                                                        </div>
                                                        <ul className="space-y-2">
                                                            {dossier.metadata.goals?.slice(0,3).map((g: string, i: number) => (
                                                                <li key={i} className="text-xs text-zinc-400 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">{g}</li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Channel Matrix */}
                    {currentStep === 'channels' && (
                        <motion.div
                            key="channels"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-0"
                        >
                             <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                                <div>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">
                                        {t("copywriter.step.channels")}
                                    </h2>
                                    <p className="text-base text-zinc-400 font-medium tracking-wide">
                                        {t("copywriter.step.channels_desc")}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setCurrentStep('strategy')}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-xs font-bold"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Volver
                                </button>
                            </div>

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
                                    onClick={() => setCurrentStep('strategy')}
                                    className="px-8 py-4 rounded-2xl bg-white/5 text-zinc-400 hover:text-white transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Volver
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 4: Output Factory */}
                    {currentStep === 'results' && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-12"
                        >
                            <div className="flex items-center justify-between gap-8 border-b border-white/5 pb-8">
                                <div>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">
                                        {t("copywriter.step.results")}
                                    </h2>
                                    <p className="text-base text-zinc-400 font-medium tracking-wide">
                                        {t("copywriter.step.results_desc")}
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => {
                                            setCurrentStep('channels');
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
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
                                </div>
                            </div>

                            <ResultSection
                                outputs={outputs}
                                loading={loading}
                                selectedFormats={selectedFormats}
                                platforms={platforms}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

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
        </div>
    );
}
