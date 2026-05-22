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
    <div className="p-5 rounded-2xl bg-surface/95 backdrop-blur-xl border border-border space-y-4 max-w-xs shadow-2xl">
      <div className="flex items-center gap-2 text-primary">
        <Info className="w-4 h-4" />
        <h5 className="text-xs font-bold uppercase tracking-wider font-brand">{title}</h5>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-[10px] text-foreground-subtle uppercase font-bold tracking-widest mb-1 font-brand">
            {t("stress.tooltip.expectation")}
          </p>
          <p className="text-xs text-foreground-muted leading-relaxed font-body">{expectation}</p>
        </div>
        <div>
          <p className="text-[10px] text-foreground-subtle uppercase font-bold tracking-widest mb-1 font-brand">
            {t("stress.tooltip.mechanism")}
          </p>
          <p className="text-xs text-foreground-muted leading-relaxed font-body">{mechanism}</p>
        </div>
        <div>
          <p className="text-[10px] text-foreground-subtle uppercase font-bold tracking-widest mb-1 font-brand">
            {t("stress.tooltip.example")}
          </p>
          <ul className="space-y-1">
            {example.split('|').map((item, i) => (
              <li key={i} className="flex gap-2 text-xs text-primary/80 font-body italic leading-tight">
                <span className="shrink-0 text-primary font-bold">»</span>
                {item.trim()}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
