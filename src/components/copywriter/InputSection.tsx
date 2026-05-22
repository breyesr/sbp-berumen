"use client";

import { Info, Loader2, Send, CheckSquare, AlignLeft, Target, AlignJustify, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { useI18n } from "@/components/i18n/I18nProvider";
import { Platform, Format, FIELD_LIMITS } from "./types";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { FieldTooltip } from "@/components/ui/FieldTooltip";

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
            <Target className="w-4 h-4 text-primary/50" />
            <label className="block text-xs font-bold uppercase tracking-[0.4em] text-foreground-subtle font-brand">
              Phase 1: Strategic Briefing
            </label>
          </div>

          <div className="space-y-10">
            {/* Context Field */}
            <div className="relative">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <label className="block text-xs font-bold uppercase tracking-[0.2em] text-foreground-muted font-brand">
                    {t("copywriter.field.context")}
                  </label>
                  <button 
                    onClick={() => setActiveTooltip(activeTooltip === 'context' ? null : 'context')}
                    className="p-1 hover:text-primary text-foreground-subtle transition-colors"
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
                className="w-full bg-surface border border-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all resize-none leading-relaxed text-foreground font-body shadow-sm"
              />
              <span className={clsx(
                "block text-[10px] font-bold text-right mt-2 tracking-widest font-brand",
                context.length < FIELD_LIMITS.context.min || context.length > FIELD_LIMITS.context.max ? "text-error" : "text-foreground-subtle"
              )}>
                {context.length}/{FIELD_LIMITS.context.max}
              </span>
            </div>

            {/* Message Field */}
            <div className="relative">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <label className="block text-xs font-bold uppercase tracking-[0.2em] text-foreground-muted font-brand">
                    {t("copywriter.field.message")}
                  </label>
                  <button 
                    onClick={() => setActiveTooltip(activeTooltip === 'message' ? null : 'message')}
                    className="p-1 hover:text-primary text-foreground-subtle transition-colors"
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
                className="w-full bg-surface border border-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all resize-none leading-relaxed text-foreground font-body shadow-sm"
              />
              <span className={clsx(
                "block text-[10px] font-bold text-right mt-2 tracking-widest font-brand",
                message.length < FIELD_LIMITS.message.min || message.length > FIELD_LIMITS.message.max ? "text-error" : "text-foreground-subtle"
              )}>
                {message.length}/{FIELD_LIMITS.message.max}
              </span>
            </div>

            {/* Goal Field */}
            <div className="relative">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <label className="block text-xs font-bold uppercase tracking-[0.2em] text-foreground-muted font-brand">
                    {t("copywriter.field.goal")}
                  </label>
                  <button 
                    onClick={() => setActiveTooltip(activeTooltip === 'goal' ? null : 'goal')}
                    className="p-1 hover:text-primary text-foreground-subtle transition-colors"
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
                className="w-full bg-surface border border-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all resize-none leading-relaxed text-foreground font-body shadow-sm"
              />
              <span className={clsx(
                "block text-[10px] font-bold text-right mt-2 tracking-widest font-brand",
                goal.length < FIELD_LIMITS.goal.min || goal.length > FIELD_LIMITS.goal.max ? "text-error" : "text-foreground-subtle"
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
          <CheckSquare className="w-4 h-4 text-primary/50" />
          <label className="block text-xs font-bold uppercase tracking-[0.4em] text-foreground-subtle font-brand">
            Phase 2: Network Propagation
          </label>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => togglePlatform(platform.id)}
              className={clsx(
                "flex flex-col gap-3 p-5 rounded-2xl border transition-all text-left group relative overflow-hidden shadow-sm",
                selectedPlatforms.includes(platform.id)
                  ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20"
                  : "bg-surface border-border hover:bg-surface-hover hover:border-primary/20"
              )}
            >
              <div className="flex items-center justify-between relative z-10">
                <span className={clsx(
                    "text-[10px] font-bold uppercase tracking-widest font-brand",
                    selectedPlatforms.includes(platform.id) ? "text-primary" : "text-foreground-subtle group-hover:text-foreground-muted"
                )}>
                    {platform.name}
                </span>
                {selectedPlatforms.includes(platform.id) && (
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-full border border-primary/30 font-brand">
                         {selectedFormats.filter(fid => platform.formats.some(f => f.id === fid)).length}/{platform.formats.length}
                       </span>
                       <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    </div>
                )}
              </div>
              <p className="text-[10px] text-foreground-muted leading-tight line-clamp-2 font-medium relative z-10 font-body italic">
                {platform.copy_guidelines_summary || platform.platform_purpose || t("copywriter.platform.guidance_fallback")}
              </p>
              
              {/* Decorative background wash */}
              <div 
                className="absolute inset-0 opacity-[0.03] transition-opacity group-hover:opacity-[0.06]"
                style={{ backgroundColor: platformColors[platform.id] || platformColors.default }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* 3. Format Matrix (Full Width below Grid) */}
      <div className="space-y-10">
        <div className="flex items-center gap-3 px-1">
          <AlignJustify className="w-4 h-4 text-primary/50" />
          <label className="block text-xs font-bold uppercase tracking-[0.4em] text-foreground-subtle font-brand">
            Phase 3: Intelligence Matrix
          </label>
        </div>

        {selectedPlatforms.length === 0 ? (
          <div className="p-12 rounded-3xl border border-border bg-surface/50 border-dashed text-center">
            <p className="text-sm text-foreground-subtle font-bold italic font-brand">
                {t("copywriter.formats.select_platform_first")}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Task 15.2: Platform Tab System */}
            <div className="flex items-center gap-1.5 p-1.5 bg-surface border border-border rounded-2xl overflow-x-auto custom-scrollbar no-scrollbar shadow-inner">
              {platforms
                .filter(p => selectedPlatforms.includes(p.id))
                .map((plat) => {
                  const pid = plat.id;
                  const isActive = activeTab === pid;
                  const color = platformColors[plat.id] || platformColors.default;
                  const selCount = selectedFormats.filter(fid => plat.formats.some(f => f.id === fid)).length;

                  return (
                    <button
                      key={pid}
                      onClick={() => setActiveTab(pid)}
                      className={clsx(
                        "flex items-center gap-2.5 px-5 py-3 rounded-xl transition-all whitespace-nowrap",
                        isActive ? "bg-primary text-white shadow-md" : "text-foreground-muted hover:text-foreground hover:bg-surface-hover"
                      )}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: isActive ? 'white' : color, border: !isActive ? `1px solid ${color}40` : 'none' }} />
                      <span className="text-[11px] font-bold uppercase tracking-widest font-brand">{plat.name}</span>
                      {selCount > 0 && (
                        <span className="text-[10px] font-bold opacity-70">({selCount})</span>
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
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground-subtle font-brand">
                      {plat.name} Distribution Channels
                    </span>
                    <button 
                      onClick={toggleAll}
                      className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:text-primary-hover transition-colors font-brand"
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
                            "flex items-center justify-between p-5 rounded-2xl border transition-all text-left shadow-sm",
                            isSelected
                              ? "bg-primary/10 border-primary/30"
                              : "bg-surface border-border hover:bg-surface-hover"
                          )}
                        >
                          <span className={clsx(
                              "text-xs font-bold font-brand",
                              isSelected ? "text-primary" : "text-foreground-muted"
                          )}>
                              {format.name}
                          </span>
                          <div 
                            className={clsx(
                                "w-4.5 h-4.5 rounded-lg border flex items-center justify-center transition-all",
                                isSelected ? "border-transparent" : "border-border"
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
        <div className="mt-12 pt-10 border-t border-border">
          <div className="flex items-center justify-between px-6 py-4 rounded-3xl bg-surface border border-border shadow-lg pl-10 pr-4">
             <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-5 h-5 text-primary/60" />
                  <span className="text-xs font-bold uppercase tracking-widest text-foreground-muted font-brand">
                    {selectedPlatforms.length} Networks
                  </span>
                </div>
                <div className="w-px h-6 bg-border" />
                <div className="flex items-center gap-3">
                  <AlignJustify className="w-5 h-5 text-primary/60" />
                  <span className="text-xs font-bold uppercase tracking-widest text-foreground-muted font-brand">
                    {selectedFormats.length} Formats
                  </span>
                </div>
             </div>

             {hideStrategicInputs && (
               <button
                 onClick={onSubmit}
                 disabled={selectedFormats.length === 0 || loading}
                 className={clsx(
                   "py-3.5 px-10 rounded-2xl font-bold text-[10px] tracking-[0.3em] uppercase transition-all shadow-xl active:scale-95 font-brand",
                   selectedFormats.length > 0 && !loading
                     ? "bg-primary hover:bg-primary-hover text-white shadow-primary/20"
                     : "bg-surface-hover text-foreground-subtle cursor-not-allowed border border-border"
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
        <div className="pt-12 border-t border-border">
          <button
            onClick={onSubmit}
            disabled={!isFormValid || loading}
            className={clsx(
              "w-full py-6 px-10 rounded-3xl font-bold text-sm tracking-[0.3em] uppercase transition-all shadow-xl active:scale-[0.99] font-brand",
              isFormValid && !loading
                ? "bg-primary hover:bg-primary-hover text-white shadow-primary/30"
                : "bg-surface-hover text-foreground-subtle cursor-not-allowed border border-border"
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
