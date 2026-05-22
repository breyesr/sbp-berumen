"use client";

import { Sparkles, Loader2, User, Target, Zap, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { useI18n } from "@/components/i18n/I18nProvider";
import { usePersonaDossier } from "@/lib/hooks/usePersonaDossier";
import { FIELD_LIMITS, PersonaOption } from "./types";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FieldTooltip } from "@/components/ui/FieldTooltip";
import { PersonaSidebar } from "@/components/ui/PersonaSidebar";

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
  isMainColumnOnly?: boolean;
}

export function IdeaSection({
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
  isMainColumnOnly = false,
}: IdeaSectionProps) {
  const { t } = useI18n();
  const { dossier, isLoading: dossierLoading } = usePersonaDossier(personaId);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const isFormValid = idea.trim().length >= FIELD_LIMITS.idea.min &&
                      idea.trim().length <= FIELD_LIMITS.idea.max &&
                      goal.trim().length >= FIELD_LIMITS.goal.min &&
                      goal.trim().length <= FIELD_LIMITS.goal.max &&
                      evaluationFocus.trim().length >= FIELD_LIMITS.evaluationFocus.min &&
                      evaluationFocus.trim().length <= FIELD_LIMITS.evaluationFocus.max;

  const basicPersona = personas?.find(p => p.id === personaId || p.id.toString() === personaId.toString());
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

  const metadata = dossier?.metadata || {};

  const FormContent = (
    <div className="space-y-6">
        {/* Pitch Field */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-3 relative group">
            <label className="block text-xs font-bold uppercase tracking-[0.2em] text-foreground-muted font-brand">
              {t("stress.field.idea")}
            </label>
            <div 
                className="cursor-help"
                onMouseEnter={() => setActiveTooltip('idea')}
                onMouseLeave={() => setActiveTooltip(null)}
            >
                <Info className="w-4 h-4 text-foreground-subtle hover:text-primary transition-colors" />
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
            className="w-full bg-surface border border-border rounded-3xl px-6 py-5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none leading-relaxed font-body shadow-sm"
          />
          <span className={clsx(
            "block text-[10px] font-bold text-right mt-2 tracking-widest font-brand",
            idea.length < FIELD_LIMITS.idea.min || idea.length > FIELD_LIMITS.idea.max ? "text-error" : "text-foreground-subtle"
          )}>
            {idea.length}/{FIELD_LIMITS.idea.max}
          </span>
        </div>

        {/* Goal Field */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-3 relative group">
            <label className="block text-xs font-bold uppercase tracking-[0.2em] text-foreground-muted font-brand">
              {t("stress.field.goal")}
            </label>
            <div 
                className="cursor-help"
                onMouseEnter={() => setActiveTooltip('goal')}
                onMouseLeave={() => setActiveTooltip(null)}
            >
                <Info className="w-4 h-4 text-foreground-subtle hover:text-primary transition-colors" />
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
            className="w-full bg-surface border border-border rounded-3xl px-6 py-5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none leading-relaxed font-body shadow-sm"
          />
          <span className={clsx(
            "block text-[10px] font-bold text-right mt-2 tracking-widest font-brand",
            goal.length < FIELD_LIMITS.goal.min || goal.length > FIELD_LIMITS.goal.max ? "text-error" : "text-foreground-subtle"
          )}>
            {goal.length}/{FIELD_LIMITS.goal.max}
          </span>
        </div>

        {/* Focus Field */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-3 relative group">
            <label className="block text-xs font-bold uppercase tracking-[0.2em] text-foreground-muted font-brand">
              {t("stress.field.focus")}
            </label>
            <div 
                className="cursor-help"
                onMouseEnter={() => setActiveTooltip('focus')}
                onMouseLeave={() => setActiveTooltip(null)}
            >
                <Info className="w-4 h-4 text-foreground-subtle hover:text-primary transition-colors" />
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
              className="w-full bg-surface border border-border rounded-3xl px-6 py-5 pr-14 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none leading-relaxed font-body shadow-sm"
            />
            <button
              type="button"
              className="absolute right-4 top-4 p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition-all group"
            >
              <Sparkles className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            </button>
          </div>
          <span className={clsx(
            "block text-[10px] font-bold text-right mt-2 tracking-widest font-brand",
            evaluationFocus.length < FIELD_LIMITS.evaluationFocus.min || evaluationFocus.length > FIELD_LIMITS.evaluationFocus.max ? "text-error" : "text-foreground-subtle"
          )}>
            {evaluationFocus.length}/{FIELD_LIMITS.evaluationFocus.max}
          </span>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={onSubmit}
            disabled={!isFormValid || loading}
            className={clsx(
              "py-4 px-12 rounded-2xl font-bold text-xs tracking-[0.2em] uppercase transition-all shadow-xl font-brand",
              isFormValid && !loading
                ? "bg-primary hover:bg-primary-hover text-white shadow-primary/20 active:scale-[0.98]"
                : "bg-surface border border-border text-foreground-subtle cursor-not-allowed"
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
  );

  if (isMainColumnOnly) return FormContent;

  return (
    <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        {FormContent}
      </div>
      
      {/* Right Column: Persistent Context Card */}
      <div className="lg:col-span-1">
        <PersonaSidebar
          persona={basicPersona || null}
          dossier={dossier}
          isLoading={dossierLoading}
          className="sticky top-8"
        />
      </div>
    </div>
  );
}
