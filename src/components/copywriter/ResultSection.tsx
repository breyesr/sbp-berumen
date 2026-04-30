"use client";

import { CopyOutput } from "./types";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Copy, Check, ExternalLink, Hash, MessageSquare, ListTodo } from 'lucide-react';
import { useState } from "react";
import { clsx } from "clsx";

interface ResultSectionProps {
  outputs: CopyOutput[];
  loading: boolean;
}

function CopyCard({ output }: { output: CopyOutput }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(output.primaryCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all flex flex-col h-full shadow-sm hover:shadow-indigo-500/5">
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
        <div className="flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400/50" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{output.formatName}</span>
        </div>
        <button 
          onClick={handleCopy}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all group/copy"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="p-5 flex-1 space-y-4">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-tighter text-white/20">{t("copywriter.output.primary")}</p>
          <p className="text-sm text-white/90 leading-relaxed whitespace-pre-line font-medium">
            {output.primaryCopy}
          </p>
        </div>

        {output.alternateCopy && (
           <div className="space-y-2 pt-4 border-t border-white/5">
                <p className="text-[10px] font-black uppercase tracking-tighter text-white/20">{t("copywriter.output.alternate")}</p>
                <p className="text-xs text-white/40 italic leading-relaxed whitespace-pre-line">
                    {output.alternateCopy}
                </p>
           </div>
        )}

        {(output.cta || (output.hashtags && output.hashtags.length > 0)) && (
            <div className="grid grid-cols-1 gap-3 pt-4 border-t border-white/5">
                {output.cta && (
                    <div className="flex items-start gap-2">
                        <ExternalLink className="w-3 h-3 text-indigo-400 mt-0.5" />
                        <div>
                            <p className="text-[9px] font-black uppercase text-white/20 mb-0.5">CTA</p>
                            <p className="text-xs font-bold text-indigo-400">{output.cta}</p>
                        </div>
                    </div>
                )}
                {output.hashtags && output.hashtags.length > 0 && (
                    <div className="flex items-start gap-2">
                        <Hash className="w-3 h-3 text-white/30 mt-0.5" />
                        <div>
                            <p className="text-[9px] font-black uppercase text-white/20 mb-0.5">{t("copywriter.output.hashtags")}</p>
                            <p className="text-[10px] text-white/40 font-medium">{output.hashtags.join(" ")}</p>
                        </div>
                    </div>
                )}
            </div>
        )}

        {output.notes && output.notes.length > 0 && (
             <div className="space-y-2 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                    <ListTodo className="w-3 h-3 text-white/20" />
                    <p className="text-[9px] font-black uppercase text-white/20">{t("copywriter.output.notes")}</p>
                </div>
                <ul className="space-y-1">
                    {output.notes.map((n, i) => (
                        <li key={i} className="text-[10px] text-white/30 flex gap-2 leading-normal">
                            <span className="text-indigo-500/50">•</span> {n}
                        </li>
                    ))}
                </ul>
           </div>
        )}
      </div>
    </div>
  );
}

export function ResultSection({ outputs, loading }: ResultSectionProps) {
  const { t } = useI18n();

  // Group by platform
  const grouped = outputs.reduce((acc, o) => {
    if (!o) return acc;
    const p = o.platformName || "Other";
    if (!acc[p]) acc[p] = [];
    acc[p].push(o);
    return acc;
  }, {} as Record<string, CopyOutput[]>);

  const platformColors: Record<string, string> = {
    Instagram: "#E1306C",
    Facebook: "#1877F2",
    LinkedIn: "#0A66C2",
    TikTok: "#0f0f0f",
    YouTube: "#FF0000",
    default: "#4F46E5",
  };

  return (
    <div className="space-y-16 animate-fade-in pb-12">
      {Object.entries(grouped).map(([platform, items]) => (
        <div key={platform} className="space-y-8">
            <div className="flex items-center gap-4 px-1">
              <div className="flex items-center gap-2">
                <div 
                    className="w-2 h-2 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]" 
                    style={{ backgroundColor: platformColors[platform] || platformColors.default }} 
                />
                <span className="text-xs font-black uppercase tracking-[0.4em] text-white/80 whitespace-nowrap">
                    {platform}
                </span>
              </div>
              <div className="h-px w-full bg-white/5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {items.map((o, idx) => (
                    <CopyCard key={`${platform}-${idx}`} output={o} />
                ))}
            </div>
        </div>
      ))}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-50">
            <div className="h-64 rounded-2xl border border-white/5 bg-white/[0.02] animate-pulse" />
            <div className="h-64 rounded-2xl border border-white/5 bg-white/[0.02] animate-pulse" />
        </div>
      )}
    </div>
  );
}
