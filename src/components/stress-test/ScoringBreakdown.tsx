"use client";

import { ShieldCheck, Zap, Eye, Info } from 'lucide-react';
import { clsx } from 'clsx';

interface ScoringBreakdownProps {
  confidenceScore: number;
  breakdown: {
    problemValidity: number;
    solutionLogic: number;
    pitchClarity: number;
  };
  rationale?: {
    value: string;
    feasibility: string;
    lens: string;
  };
  hideScore?: boolean;
}

export function ScoringBreakdown({ confidenceScore, breakdown, rationale, hideScore }: ScoringBreakdownProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getBarColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const metrics = [
    {
      label: 'Validez del Problema',
      weight: '50%',
      score: breakdown.problemValidity,
      icon: ShieldCheck,
      desc: rationale?.value || 'Evaluación del dolor y urgencia para la persona.',
      color: 'indigo'
    },
    {
      label: 'Lógica de Solución',
      weight: '30%',
      score: breakdown.solutionLogic,
      icon: Zap,
      desc: rationale?.feasibility || 'Evaluación de factibilidad y recursos.',
      color: 'blue'
    },
    {
      label: 'Claridad del Pitch',
      weight: '20%',
      score: breakdown.pitchClarity,
      icon: Eye,
      desc: rationale?.lens || 'Evaluación bajo el lente específico solicitado.',
      color: 'purple'
    }
  ];

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-lg">
      <div className="p-5 border-b border-border bg-gradient-to-r from-surface-elevated to-transparent flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground font-brand">
            Desglose de Confianza (DSE)
          </h3>
        </div>
        {!hideScore && (
            <div className={clsx("text-lg font-black font-brand", getScoreColor(confidenceScore))}>
            {confidenceScore}%
            </div>
        )}
      </div>
      
      <div className="p-6 space-y-6">
        {metrics.map((m, idx) => (
          <div key={idx} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <m.icon className="w-4 h-4 text-foreground-muted" />
                <span className="text-sm font-bold text-foreground font-brand">{m.label}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-background text-foreground-subtle font-bold uppercase tracking-tighter border border-border">
                  W: {m.weight}
                </span>
              </div>
              <span className={clsx("text-sm font-bold font-brand", getScoreColor(m.score))}>
                {m.score}/100
              </span>
            </div>
            
            <div className="h-2 w-full bg-background rounded-full overflow-hidden border border-border/50">
              <div 
                className={clsx("h-full transition-all duration-1000 ease-out rounded-full", getBarColor(m.score))}
                style={{ width: `${m.score}%` }}
              />
            </div>
            
            <p className="text-xs text-foreground-muted leading-relaxed italic bg-background/50 p-4 rounded-xl border border-border font-body shadow-inner">
              “{m.desc}”
            </p>
          </div>
        ))}
      </div>
      
      <div className="px-6 py-4 bg-surface-elevated/30 border-t border-border">
        <p className="text-[10px] text-foreground-subtle font-bold uppercase tracking-widest text-center font-brand">
          Motor de Puntuación Determinista v1.0
        </p>
      </div>
    </div>
  );
}
