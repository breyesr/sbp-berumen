"use client";

import { Info, Loader2, Send, CheckSquare, AlignLeft, Target, AlignJustify, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { useI18n } from "@/components/i18n/I18nProvider";
import { Platform, Format, FIELD_LIMITS } from "./types";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface InputSectionProps {
  context: string;
  setContext: (val: string) => void;
  message: string;
  setMessage: (val: string) => void;
  goal: string;
  setGoal: (val: string) => void;
  platforms: Platform[];
  selectedPlatforms: string[];
  togglePlatform: (id: string) => void;
  selectedFormats: string[];
  toggleFormat: (id: string) => void;
  setSelectedFormats: React.Dispatch<React.SetStateAction<string[]>>;
  activeTab: string;
  setActiveTab: (id: string) => void;
  loading: boolean;
  onSubmit: () => void;
  selectedPersonaName: string;
  hideStrategicInputs?: boolean;
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

export function InputSection({
  context,
  setContext,
  message,
  setMessage,
  goal,
  setGoal,
  platforms,
  selectedPlatforms,
  togglePlatform,
  selectedFormats,
  toggleFormat,
  setSelectedFormats,
  activeTab,
  setActiveTab,
  loading,
  onSubmit,
  selectedPersonaName,
  hideStrategicInputs = false,
}: InputSectionProps) {
  const { t } = useI18n();
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const isFormValid = 
    context.trim().length >= FIELD_LIMITS.context.min &&
    context.trim().length <= FIELD_LIMITS.context.max &&
    message.trim().length >= FIELD_LIMITS.message.min &&
    message.trim().length <= FIELD_LIMITS.message.max &&
    goal.trim().length >= FIELD_LIMITS.goal.min &&
    goal.trim().length <= FIELD_LIMITS.goal.max &&
    selectedPlatforms.length > 0 &&
    selectedFormats.length > 0;

  const tooltips = {
    context: {
      title: t("copywriter.tooltip.context.title"),
      expectation: t("copywriter.tooltip.context.expectation"),
      mechanism: t("copywriter.tooltip.context.mechanism"),
      example: t("copywriter.tooltip.context.example")
    },
    message: {
      title: t("copywriter.tooltip.message.title"),
      expectation: t("copywriter.tooltip.message.expectation"),
      mechanism: t("copywriter.tooltip.message.mechanism"),
      example: t("copywriter.tooltip.message.example")
    },
    goal: {
      title: t("copywriter.tooltip.goal.title"),
      expectation: t("copywriter.tooltip.goal.expectation"),
      mechanism: t("copywriter.tooltip.goal.mechanism"),
      example: t("copywriter.tooltip.goal.example")
    }
  };

  const platformColors: Record<string, string> = {
    instagram: "#E1306C",
    facebook: "#1877F2",
    linkedin: "#0A66C2",
    tiktok: "#0f0f0f",
    youtube: "#FF0000",
    default: "#6366F1",
  };

  return (
    <div className="space-y-16 animate-fade-in">
      {/* 1. Brief Inputs (Full Width Vertical Stack) */}
      {!hideStrategicInputs && (
        <div className="space-y-10">
          <div className="flex items-center gap-3 px-1">
            <Target className="w-4 h-4 text-indigo-400/50" />
            <label className="block text-xs font-black uppercase tracking-[0.4em] text-white/20">
              Phase 1: Strategic Briefing
            </label>
          </div>

          <div className="space-y-10">
            {/* Context Field */}
            <div className="relative">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                    {t("copywriter.field.context")}
                  </label>
                  <button 
                    onClick={() => setActiveTooltip(activeTooltip === 'context' ? null : 'context')}
                    className="p-1 hover:text-indigo-400 text-white/20 transition-colors"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
                <AnimatePresence>
                  {activeTooltip === 'context' && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute z-50 right-0 bottom-full mb-2"
                    >
                      <FieldTooltip {...tooltips.context} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder={t("copywriter.placeholder.context")}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none leading-relaxed text-white/90"
              />
              <span className={clsx(
                "block text-[10px] font-bold text-right mt-2 tracking-widest",
                context.length < FIELD_LIMITS.context.min || context.length > FIELD_LIMITS.context.max ? "text-red-400" : "text-white/20"
              )}>
                {context.length}/{FIELD_LIMITS.context.max}
              </span>
            </div>

            {/* Message Field */}
            <div className="relative">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                    {t("copywriter.field.message")}
                  </label>
                  <button 
                    onClick={() => setActiveTooltip(activeTooltip === 'message' ? null : 'message')}
                    className="p-1 hover:text-indigo-400 text-white/20 transition-colors"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
                <AnimatePresence>
                  {activeTooltip === 'message' && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute z-50 right-0 bottom-full mb-2"
                    >
                      <FieldTooltip {...tooltips.message} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("copywriter.placeholder.message")}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none leading-relaxed text-white/90"
              />
              <span className={clsx(
                "block text-[10px] font-bold text-right mt-2 tracking-widest",
                message.length < FIELD_LIMITS.message.min || message.length > FIELD_LIMITS.message.max ? "text-red-400" : "text-white/20"
              )}>
                {message.length}/{FIELD_LIMITS.message.max}
              </span>
            </div>

            {/* Goal Field */}
            <div className="relative">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                    {t("copywriter.field.goal")}
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
                placeholder={t("copywriter.placeholder.goal")}
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
          </div>
        </div>
      )}

      {/* 2. Platform Selection (Full Width Grid) */}
      <div className="space-y-10">
        <div className="flex items-center gap-3 px-1">
          <CheckSquare className="w-4 h-4 text-indigo-400/50" />
          <label className="block text-xs font-black uppercase tracking-[0.4em] text-white/20">
            Phase 2: Network Propagation
          </label>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => togglePlatform(platform.id)}
              className={clsx(
                "flex flex-col gap-3 p-5 rounded-2xl border transition-all text-left group relative overflow-hidden",
                selectedPlatforms.includes(platform.id)
                  ? "bg-indigo-500/10 border-indigo-500/30 ring-1 ring-indigo-500/20"
                  : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
              )}
            >
              <div className="flex items-center justify-between relative z-10">
                <span className={clsx(
                    "text-[10px] font-black uppercase tracking-widest",
                    selectedPlatforms.includes(platform.id) ? "text-indigo-400" : "text-white/40 group-hover:text-white/60"
                )}>
                    {platform.name}
                </span>
                {selectedPlatforms.includes(platform.id) && (
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-bold bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full border border-indigo-500/30">
                         {selectedFormats.filter(fid => platform.formats.some(f => f.id === fid)).length}/{platform.formats.length}
                       </span>
                       <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    </div>
                )}
              </div>
              <p className="text-[10px] text-white/30 leading-tight line-clamp-2 font-medium relative z-10">
                {platform.copy_guidelines_summary || platform.platform_purpose || t("copywriter.platform.guidance_fallback")}
              </p>
              
              {/* Decorative background wash */}
              <div 
                className="absolute inset-0 opacity-[0.03] transition-opacity group-hover:opacity-[0.05]"
                style={{ backgroundColor: platformColors[platform.id] || platformColors.default }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* 3. Format Matrix (Full Width below Grid) */}
      <div className="space-y-10">
        <div className="flex items-center gap-3 px-1">
          <AlignJustify className="w-4 h-4 text-indigo-400/50" />
          <label className="block text-xs font-black uppercase tracking-[0.4em] text-white/20">
            Phase 3: Intelligence Matrix
          </label>
        </div>

        {selectedPlatforms.length === 0 ? (
          <div className="p-12 rounded-3xl border border-white/5 bg-white/[0.02] border-dashed text-center">
            <p className="text-sm text-white/20 font-medium italic">
                {t("copywriter.formats.select_platform_first")}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Task 15.2: Platform Tab System */}
            <div className="flex items-center gap-1.5 p-1.5 bg-white/[0.03] rounded-2xl border border-white/5 overflow-x-auto custom-scrollbar no-scrollbar">
              {selectedPlatforms.map((pid) => {
                const plat = platforms.find((p) => p.id === pid);
                if (!plat) return null;
                const isActive = activeTab === pid;
                const color = platformColors[plat.id] || platformColors.default;
                const selCount = selectedFormats.filter(fid => plat.formats.some(f => f.id === fid)).length;

                return (
                  <button
                    key={pid}
                    onClick={() => setActiveTab(pid)}
                    className={clsx(
                      "flex items-center gap-2.5 px-5 py-3 rounded-xl transition-all whitespace-nowrap",
                      isActive ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/60 hover:bg-white/5"
                    )}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: isActive ? color : 'transparent', border: !isActive ? `1px solid ${color}40` : 'none' }} />
                    <span className="text-[11px] font-black uppercase tracking-widest">{plat.name}</span>
                    {selCount > 0 && (
                      <span className="text-[10px] font-bold opacity-60">({selCount})</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Task 15.3 & 15.4: Format Chip Grid & Bulk Controls */}
            {(() => {
              const plat = platforms.find((p) => p.id === activeTab);
              if (!plat) return null;
              const color = platformColors[plat.id] || platformColors.default;
              
              const platformFormats = plat.formats;
              const allSelected = platformFormats.every(f => selectedFormats.includes(f.id));
              
              const toggleAll = () => {
                if (allSelected) {
                  setSelectedFormats(prev => prev.filter(fid => !platformFormats.some(f => f.id === fid)));
                } else {
                  setSelectedFormats(prev => {
                    const otherFormats = prev.filter(fid => !platformFormats.some(f => f.id === fid));
                    return [...otherFormats, ...platformFormats.map(f => f.id)];
                  });
                }
              };

              return (
                <div className="space-y-8 animate-in fade-in slide-in-from-left-2 duration-300">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                      {plat.name} Distribution Channels
                    </span>
                    <button 
                      onClick={toggleAll}
                      className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      {allSelected ? "Deselect All" : "Select All"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {platformFormats.map((format) => {
                      const isSelected = selectedFormats.includes(format.id);
                      return (
                        <button
                          key={format.id}
                          onClick={() => toggleFormat(format.id)}
                          className={clsx(
                            "flex items-center justify-between p-5 rounded-2xl border transition-all text-left",
                            isSelected
                              ? "bg-white/10 border-white/20 shadow-[inset_0_0_12px_rgba(255,255,255,0.02)]"
                              : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                          )}
                        >
                          <span className={clsx(
                              "text-xs font-bold",
                              isSelected ? "text-white" : "text-white/40"
                          )}>
                              {format.name}
                          </span>
                          <div 
                            className={clsx(
                                "w-4.5 h-4.5 rounded-lg border flex items-center justify-center transition-all",
                                isSelected ? "border-transparent" : "border-white/10"
                            )}
                            style={{ backgroundColor: isSelected ? color : 'transparent' }}
                          >
                              {isSelected && (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="20 6 9 17 4 12"/></svg>
                              )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Task 15.6: Factory Ledger Footer & Action Button */}
      {selectedPlatforms.length > 0 && (
        <div className="mt-12 pt-10 border-t border-white/5">
          <div className="flex items-center justify-between px-6 py-4 rounded-3xl bg-white/[0.02] border border-white/5 shadow-2xl pl-10 pr-4">
             <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-5 h-5 text-indigo-400/60" />
                  <span className="text-xs font-black uppercase tracking-widest text-white/40">
                    {selectedPlatforms.length} Networks
                  </span>
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div className="flex items-center gap-3">
                  <AlignJustify className="w-5 h-5 text-indigo-400/60" />
                  <span className="text-xs font-black uppercase tracking-widest text-white/40">
                    {selectedFormats.length} Formats
                  </span>
                </div>
             </div>

             {hideStrategicInputs && (
               <button
                 onClick={onSubmit}
                 disabled={selectedFormats.length === 0 || loading}
                 className={clsx(
                   "py-3.5 px-10 rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase transition-all shadow-xl active:scale-95",
                   selectedFormats.length > 0 && !loading
                     ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20"
                     : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                 )}
               >
                 {loading ? (
                   <span className="flex items-center gap-3">
                     <Loader2 className="w-4 h-4 animate-spin" />
                     Generando...
                   </span>
                 ) : (
                   <span className="flex items-center gap-3">
                     <Sparkles className="w-4 h-4" />
                     Escribir Copy
                   </span>
                 )}
               </button>
             )}
          </div>
        </div>
      )}

      {!hideStrategicInputs && (
        <div className="pt-12 border-t border-white/5">
          <button
            onClick={onSubmit}
            disabled={!isFormValid || loading}
            className={clsx(
              "w-full py-6 px-10 rounded-3xl font-black text-sm tracking-[0.3em] uppercase transition-all shadow-2xl",
              isFormValid && !loading
                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 active:scale-[0.99] hover:shadow-indigo-500/40"
                : "bg-white/5 text-white/20 cursor-not-allowed"
            )}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-4">
                <Loader2 className="w-6 h-6 animate-spin" />
                {t("copywriter.action.button_loading")}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-4">
                <Send className="w-5 h-5" />
                {t("copywriter.action.button")}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
