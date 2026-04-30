"use client";

import { Sparkles, Info, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useI18n } from "@/components/i18n/I18nProvider";
import { FIELD_LIMITS } from "./types";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface IdeaSectionProps {
  idea: string;
  setIdea: (val: string) => void;
  goal: string;
  setGoal: (val: string) => void;
  evaluationFocus: string;
  setEvaluationFocus: (val: string) => void;
  loading: boolean;
  onSubmit: () => void;
  selectedPersonaName: string;
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
    <div className="p-5 rounded-2xl glass border border-white/10 space-y-4 max-w-xs shadow-2xl">
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

export function IdeaSection({
  idea,
  setIdea,
  goal,
  setGoal,
  evaluationFocus,
  setEvaluationFocus,
  loading,
  onSubmit,
  selectedPersonaName,
}: IdeaSectionProps) {
  const { t } = useI18n();
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const isFormValid = idea.trim().length >= FIELD_LIMITS.idea.min &&
                      idea.trim().length <= FIELD_LIMITS.idea.max &&
                      goal.trim().length >= FIELD_LIMITS.goal.min &&
                      goal.trim().length <= FIELD_LIMITS.goal.max &&
                      evaluationFocus.trim().length >= FIELD_LIMITS.evaluationFocus.min &&
                      evaluationFocus.trim().length <= FIELD_LIMITS.evaluationFocus.max;

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

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-6">
        {/* Pitch Field */}
        <div className="relative">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                {t("stress.field.idea")}
              </label>
              <button 
                onClick={() => setActiveTooltip(activeTooltip === 'idea' ? null : 'idea')}
                className="p-1 hover:text-indigo-400 text-white/20 transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
            <AnimatePresence>
              {activeTooltip === 'idea' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute z-50 right-0 bottom-full mb-2"
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
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none leading-relaxed text-white/90"
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
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                {t("stress.field.goal")}
              </label>
              <button 
                onClick={() => setActiveTooltip(activeTooltip === 'goal' ? null : 'goal')}
                className="p-1 hover:text-indigo-400 text-white/20 transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
            <AnimatePresence>
              {activeTooltip === 'goal' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute z-50 right-0 bottom-full mb-2"
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
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none leading-relaxed text-white/90"
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
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                {t("stress.field.focus")}
              </label>
              <button 
                onClick={() => setActiveTooltip(activeTooltip === 'focus' ? null : 'focus')}
                className="p-1 hover:text-indigo-400 text-white/20 transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
            <AnimatePresence>
              {activeTooltip === 'focus' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute z-50 right-0 bottom-full mb-2"
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
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none leading-relaxed text-white/90"
            />
            <button
              type="button"
              className="absolute right-4 top-4 p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 transition-all group"
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
      </div>

      <div className="pt-6 border-t border-white/5">
        <button
          onClick={onSubmit}
          disabled={!isFormValid || loading}
          className={clsx(
            "w-full py-5 px-8 rounded-2xl font-bold text-sm tracking-[0.2em] uppercase transition-all shadow-xl",
            isFormValid && !loading
              ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 active:scale-[0.98]"
              : "bg-white/5 text-white/20 cursor-not-allowed"
          )}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              {t("stress.strategy.loading")}
            </span>
          ) : (
            t("stress.strategy.execute_with", { name: selectedPersonaName.split(' — ')[0] })
          )}
        </button>
      </div>
    </div>
  );
}
