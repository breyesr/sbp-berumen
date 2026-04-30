"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { clsx } from "clsx";

interface CollapsibleStepProps {
  stepNumber: number;
  title: string;
  isExpanded: boolean;
  isCompleted: boolean;
  summary?: string;
  onToggle: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export function CollapsibleStep({
  stepNumber,
  title,
  isExpanded,
  isCompleted,
  summary,
  onToggle,
  children,
  disabled = false,
}: CollapsibleStepProps) {
  return (
    <div className={clsx(
      "relative pl-12 transition-opacity",
      disabled && !isExpanded && "opacity-30 grayscale pointer-events-none"
    )}>
      {/* The Thread (Connecting Line) */}
      <div className="absolute left-[19px] top-0 bottom-0 w-px bg-white/5 z-0" />

      {/* Step Indicator (Circle on Thread) */}
      <div className={clsx(
        "absolute left-0 top-8 w-10 h-10 rounded-full flex items-center justify-center text-xs font-black z-10 transition-all",
        isExpanded ? "bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] scale-110" : 
        isCompleted ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
        "bg-[#0a0a0a] text-white/20 border border-white/5"
      )}>
        {isCompleted && !isExpanded ? <Check className="w-4 h-4 stroke-[3px]" /> : stepNumber}
      </div>

      <button
        onClick={onToggle}
        disabled={disabled}
        className="w-full py-8 text-left group transition-all"
      >
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className={clsx(
              "text-lg font-black tracking-tight transition-colors",
              isExpanded ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
            )}>
              {title}
            </h3>
            <ChevronDown className={clsx(

              "w-5 h-5 text-white/5 transition-transform duration-500",
              isExpanded && "rotate-180 text-indigo-400/50"
            )} />
          </div>
          
          <AnimatePresence>
            {!isExpanded && summary && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-[10px] uppercase font-black tracking-[0.2em] text-indigo-400/40"
              >
                {summary}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-visible"
          >
            <div className="pb-16 pt-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
