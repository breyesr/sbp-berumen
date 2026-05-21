"use client";

import React from "react";
import { Info } from 'lucide-react';
import { useI18n } from "@/components/i18n/I18nProvider";

interface FieldTooltipProps {
  title: string;
  expectation: string;
  mechanism: string;
  example: string;
}

/**
 * Standard interactive tooltip for form fields, providing high-fidelity instructions and examples.
 */
export function FieldTooltip({ title, expectation, mechanism, example }: FieldTooltipProps) {
  const { t } = useI18n();
  return (
    <div className="p-5 rounded-2xl bg-[#171717]/95 backdrop-blur-xl border border-white/10 space-y-4 max-w-xs shadow-2xl">
      <div className="flex items-center gap-2 text-indigo-400">
        <Info className="w-4 h-4" />
        <h5 className="text-xs font-bold uppercase tracking-wider">{title}</h5>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">
            {t("stress.tooltip.expectation")}
          </p>
          <p className="text-xs text-white/80 leading-relaxed">{expectation}</p>
        </div>
        <div>
          <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">
            {t("stress.tooltip.mechanism")}
          </p>
          <p className="text-xs text-white/80 leading-relaxed">{mechanism}</p>
        </div>
        <div>
          <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">
            {t("stress.tooltip.example")}
          </p>
          <ul className="list-disc pl-4 text-xs text-indigo-300/90 space-y-1">
            {example.split('|').map((item, i) => <li key={i}>{item.trim()}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
