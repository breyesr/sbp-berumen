// src/components/stress-test/StressTestForm.tsx
"use client";

import { User, BarChart, Sparkles, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useI18n } from "@/components/i18n/I18nProvider";
import { PersonaOption, ChallengeLevelOption, FIELD_LIMITS } from "./types";
import PersonaSelect from "@/components/PersonaSelect";

interface StressTestFormProps {
    personas: PersonaOption[];
    personaType: string | number;
    setPersonaType: (val: string | number) => void;
    levels: ChallengeLevelOption[];
    challengeLevelId: string;
    setChallengeLevelId: (val: string) => void;
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

export function StressTestForm({
    personas,
    personaType,
    setPersonaType,
    levels,
    challengeLevelId,
    setChallengeLevelId,
    idea,
    setIdea,
    goal,
    setGoal,
    evaluationFocus,
    setEvaluationFocus,
    loading,
    onSubmit,
    selectedPersonaName,
}: StressTestFormProps) {
    const { t } = useI18n();

    const isFormValid = idea.trim().length >= FIELD_LIMITS.idea.min &&
                        idea.trim().length <= FIELD_LIMITS.idea.max &&
                        goal.trim().length >= FIELD_LIMITS.goal.min &&
                        goal.trim().length <= FIELD_LIMITS.goal.max &&
                        evaluationFocus.trim().length >= FIELD_LIMITS.evaluationFocus.min &&
                        evaluationFocus.trim().length <= FIELD_LIMITS.evaluationFocus.max &&
                        personaType &&
                        challengeLevelId;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <PersonaSelect
                    options={personas}
                    value={personaType}
                    onChange={setPersonaType}
                    labelText={t("stress.field.persona")}
                />

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-2">
                        {t("stress.field.challenge_level")}
                    </label>
                    <div className="relative">
                        <BarChart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a1a1aa]" />
                        <select
                            value={challengeLevelId}
                            onChange={(e) => setChallengeLevelId(e.target.value)}
                            aria-label={t("stress.aria.select_challenge")}
                            className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
                        >
                            {levels.map((l) => (
                                <option key={l.id} value={l.id} className="bg-[#171717]">
                                    {l.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="space-y-4 mb-6">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">
                            {t("stress.field.idea")}
                        </label>
                    </div>
                    <textarea
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        placeholder={t("stress.placeholder.idea")}
                        aria-label={t("stress.aria.idea")}
                        rows={6}
                        className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all resize-none"
                    />
                    <span className={clsx(
                        "block text-xs text-right mt-1",
                        idea.length < FIELD_LIMITS.idea.min || idea.length > FIELD_LIMITS.idea.max ? "text-red-400" : "text-gray-400"
                    )}>
                        {idea.length}/{FIELD_LIMITS.idea.max}
                    </span>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">
                            {t("stress.field.goal")}
                        </label>
                    </div>
                    <textarea
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder={t("stress.placeholder.goal")}
                        aria-label={t("stress.aria.goal")}
                        rows={3}
                        className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all resize-none"
                    />
                    <span className={clsx(
                        "block text-xs text-right mt-1",
                        goal.length < FIELD_LIMITS.goal.min || goal.length > FIELD_LIMITS.goal.max ? "text-red-400" : "text-gray-400"
                    )}>
                        {goal.length}/{FIELD_LIMITS.goal.max}
                    </span>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">
                            {t("stress.field.focus")}
                        </label>
                    </div>
                    <div className="relative">
                        <textarea
                            value={evaluationFocus}
                            onChange={(e) => setEvaluationFocus(e.target.value)}
                            placeholder={t("stress.placeholder.focus")}
                            aria-label={t("stress.aria.focus")}
                            rows={2}
                            className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all resize-none"
                        />
                        <span className={clsx(
                            "block text-xs text-right mt-1",
                            evaluationFocus.length < FIELD_LIMITS.evaluationFocus.min || evaluationFocus.length > FIELD_LIMITS.evaluationFocus.max ? "text-red-400" : "text-gray-400"
                        )}>
                            {evaluationFocus.length}/{FIELD_LIMITS.evaluationFocus.max}
                        </span>
                        <button
                            type="button"
                            aria-label={t("stress.aria.auto_detect")}
                            className="absolute right-3 top-3 p-1.5 rounded-md bg-[#4F46E5]/10 hover:bg-[#4F46E5]/20 transition-colors group"
                            title={t("stress.button.auto_detect")}
                        >
                            <Sparkles className="w-4 h-4 text-[#4F46E5] group-hover:text-[#6366F1]" />
                        </button>
                    </div>
                </div>
            </div>

            <button
                onClick={onSubmit}
                disabled={!isFormValid || loading}
                className={clsx(
                    "w-full py-4 px-6 rounded-lg font-semibold text-sm transition-all",
                    "focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 focus:ring-offset-[#0a0a0a]",
                    isFormValid && !loading
                        ? "bg-[#4F46E5] hover:bg-[#6366F1] text-white shadow-lg shadow-[#4F46E5]/20"
                        : "bg-[rgba(255,255,255,0.05)] text-[#a1a1aa] cursor-not-allowed"
                )}
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t("stress.button.run_loading")}
                    </span>
                ) : (
                    t("stress.button.run_with_persona", { persona: selectedPersonaName })
                )}
            </button>
        </div>
    );
}
