"use client";

import { Sparkles, Loader2, User, Target, Zap, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { useI18n } from "@/components/i18n/I18nProvider";
import { FIELD_LIMITS, PersonaOption } from "./types";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IdeaSectionProps {
  idea: string;
  setIdea: (val: string) => void;
  goal: string;
  setGoal: (val: string) => void;
  evaluationFocus: string;
  setEvaluationFocus: (val: string) => void;
  loading: boolean;
  onSubmit: () => void;
  personaId: string;
  personas: PersonaOption[];
}

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

export function LinearIdeaSection({
  idea,
  setIdea,
  goal,
  setGoal,
  evaluationFocus,
  setEvaluationFocus,
  loading,
  onSubmit,
  personaId,
  personas,
}: IdeaSectionProps) {
  const { t } = useI18n();
  const [dossier, setDossier] = useState<any | null>(null);
  const [dossierLoading, setDossierLoading] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const isFormValid = idea.trim().length >= FIELD_LIMITS.idea.min &&
                      idea.trim().length <= FIELD_LIMITS.idea.max &&
                      goal.trim().length >= FIELD_LIMITS.goal.min &&
                      goal.trim().length <= FIELD_LIMITS.goal.max &&
                      evaluationFocus.trim().length >= FIELD_LIMITS.evaluationFocus.min &&
                      evaluationFocus.trim().length <= FIELD_LIMITS.evaluationFocus.max;

  const basicPersona = personas?.find(p => p.id === personaId);
  const nameParts = basicPersona?.name?.split(' — ') || ["Unknown Persona", "Role"];
  const personaName = nameParts[0];
  const personaRole = nameParts[1] || "Decisor";

  const tooltips = {
    idea: {
      title: t("stress.tooltip.idea.title"),
      expectation: t("stress.tooltip.idea.expectation"),
      mechanism: t("stress.tooltip.idea.mechanism"),
      example: t("stress.tooltip.idea.example")
    },
    goal: {
      title: t("stress.tooltip.goal.title"),
      expectation: t("stress.tooltip.goal.expectation"),
      mechanism: t("stress.tooltip.goal.mechanism"),
      example: t("stress.tooltip.goal.example")
    },
    focus: {
      title: t("stress.tooltip.focus.title"),
      expectation: t("stress.tooltip.focus.expectation"),
      mechanism: t("stress.tooltip.focus.mechanism"),
      example: t("stress.tooltip.focus.example")
    }
  };

  useEffect(() => {
    if (!personaId) return;
    setDossierLoading(true);
    fetch(`/api/personas/${encodeURIComponent(personaId)}`)
      .then(res => res.json())
      .then(data => {
        if (data.persona) setDossier(data.persona);
      })
      .catch(err => console.error("Failed to load dossier", err))
      .finally(() => setDossierLoading(false));
  }, [personaId]);

  const metadata = dossier?.metadata || {};

  return (
    <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Column: Form Inputs */}
      <div className="lg:col-span-2 space-y-6">
        {/* Pitch Field */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-3 relative group">
            <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/40">
              {t("stress.field.idea")}
            </label>
            <div 
                className="cursor-help"
                onMouseEnter={() => setActiveTooltip('idea')}
                onMouseLeave={() => setActiveTooltip(null)}
            >
                <Info className="w-4 h-4 text-white/20 hover:text-white/60 transition-colors" />
            </div>
            <AnimatePresence>
                {activeTooltip === 'idea' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-[150px] top-0 z-50 pointer-events-none"
                    >
                        <FieldTooltip {...tooltips.idea} />
                    </motion.div>
                )}
            </AnimatePresence>
          </div>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder={t("stress.placeholder.idea")}
            rows={8}
            className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none leading-relaxed text-white/90 shadow-inner"
          />
          <span className={clsx(
            "block text-[10px] font-bold text-right mt-2 tracking-widest",
            idea.length < FIELD_LIMITS.idea.min || idea.length > FIELD_LIMITS.idea.max ? "text-red-400" : "text-white/20"
          )}>
            {idea.length}/{FIELD_LIMITS.idea.max}
          </span>
        </div>

        {/* Goal Field */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-3 relative group">
            <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/40">
              {t("stress.field.goal")}
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
                        <FieldTooltip {...tooltips.goal} />
                    </motion.div>
                )}
            </AnimatePresence>
          </div>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder={t("stress.placeholder.goal")}
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none leading-relaxed text-white/90 shadow-inner"
          />
          <span className={clsx(
            "block text-[10px] font-bold text-right mt-2 tracking-widest",
            goal.length < FIELD_LIMITS.goal.min || goal.length > FIELD_LIMITS.goal.max ? "text-red-400" : "text-white/20"
          )}>
            {goal.length}/{FIELD_LIMITS.goal.max}
          </span>
        </div>

        {/* Focus Field */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-3 relative group">
            <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/40">
              {t("stress.field.focus")}
            </label>
            <div 
                className="cursor-help"
                onMouseEnter={() => setActiveTooltip('focus')}
                onMouseLeave={() => setActiveTooltip(null)}
            >
                <Info className="w-4 h-4 text-white/20 hover:text-white/60 transition-colors" />
            </div>
            <AnimatePresence>
                {activeTooltip === 'focus' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-[180px] bottom-full mb-2 z-50 pointer-events-none"
                    >
                        <FieldTooltip {...tooltips.focus} />
                    </motion.div>
                )}
            </AnimatePresence>
          </div>
          <div className="relative">
            <textarea
              value={evaluationFocus}
              onChange={(e) => setEvaluationFocus(e.target.value)}
              placeholder={t("stress.placeholder.focus")}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none leading-relaxed text-white/90 shadow-inner"
            />
            <button
              type="button"
              className="absolute right-4 top-4 p-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 transition-all group"
            >
              <Sparkles className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300" />
            </button>
          </div>
          <span className={clsx(
            "block text-[10px] font-bold text-right mt-2 tracking-widest",
            evaluationFocus.length < FIELD_LIMITS.evaluationFocus.min || evaluationFocus.length > FIELD_LIMITS.evaluationFocus.max ? "text-red-400" : "text-white/20"
          )}>
            {evaluationFocus.length}/{FIELD_LIMITS.evaluationFocus.max}
          </span>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={onSubmit}
            disabled={!isFormValid || loading}
            className={clsx(
              "py-4 px-10 rounded-2xl font-black text-xs tracking-[0.2em] uppercase transition-all shadow-xl",
              isFormValid && !loading
                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 active:scale-[0.98]"
                : "bg-white/5 border border-white/5 text-white/20 cursor-not-allowed"
            )}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("stress.strategy.loading")}
              </span>
            ) : (
              t("stress.strategy.analyze_now")
            )}
          </button>
        </div>
      </div>

      {/* Right Column: Persistent Context Card */}
      <div className="lg:col-span-1">
        <div className="sticky top-8 rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col shadow-2xl">
          
          {/* Header Card */}
          <div className="p-6 border-b border-white/5 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-t-[2rem]">
            <div className="flex items-center gap-4">
              {basicPersona?.photo_url ? (
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-indigo-500/30 flex-shrink-0">
                  <img src={basicPersona.photo_url} alt={personaName} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-8 h-8 text-indigo-400/50" />
                </div>
              )}
              <div>
                <span className="text-[9px] font-black tracking-[0.2em] uppercase text-indigo-400 block mb-1">
                  {basicPersona?.cluster || "Cluster"}
                </span>
                <h3 className="text-lg font-black text-white leading-tight uppercase">
                  {personaName}
                </h3>
                <p className="text-xs text-zinc-500 font-medium italic">
                  {personaRole}
                </p>
              </div>
            </div>
          </div>

          {/* Dossier Content */}
          <div className="p-6 space-y-8">
            {dossierLoading ? (
              <div className="space-y-8 animate-pulse">
                <div className="space-y-3">
                  <div className="h-3 w-24 bg-white/5 rounded-full" />
                  <div className="h-20 bg-white/5 rounded-2xl" />
                </div>
                <div className="space-y-3">
                  <div className="h-3 w-32 bg-white/5 rounded-full" />
                  <div className="h-16 bg-white/5 rounded-2xl" />
                  <div className="h-16 bg-white/5 rounded-2xl" />
                </div>
              </div>
            ) : (
              <>
                {/* Executive Summary */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Síntesis Ejecutiva
                    </h4>
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-300 p-4 bg-black/40 rounded-2xl border border-white/5">
                    {metadata.strategic_synthesis || metadata.synthesis || "Análisis estratégico no disponible."}
                  </p>
                </div>

                {/* Psychographics: Pains */}
                {(metadata.pains?.length > 0) && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-amber-400">
                      <Zap className="w-4 h-4" />
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">
                        Dolores Principales
                      </h4>
                    </div>
                    <ul className="space-y-2">
                      {metadata.pains.slice(0,3).map((p: string, i: number) => (
                        <li key={i} className="text-xs text-zinc-400 leading-tight p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Psychographics: Goals */}
                {(metadata.goals?.length > 0) && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Target className="w-4 h-4" />
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">
                        Metas Estratégicas
                      </h4>
                    </div>
                    <ul className="space-y-2">
                      {metadata.goals.slice(0,3).map((g: string, i: number) => (
                        <li key={i} className="text-xs text-zinc-400 leading-tight p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
