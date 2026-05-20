"use client";

import { CopyOutput, Platform } from "./types";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Copy, Check, ExternalLink, Hash, MessageSquare, ListTodo, Sparkles } from 'lucide-react';
import { useState, useMemo } from "react";
import { clsx } from "clsx";

interface ResultSectionProps {
  outputs: CopyOutput[];
  loading: boolean;
  selectedFormats: string[];
  platforms: Platform[];
}

const platformColors: Record<string, string> = {
  Instagram: "#E1306C",
  Facebook: "#1877F2",
  LinkedIn: "#0A66C2",
  TikTok: "#0f0f0f",
  YouTube: "#FF0000",
  default: "#4F46E5",
};

const fieldTranslations: Record<string, string> = {
  TITLE: "Título",
  VIDEO_TITLE: "Título del Video",
  DESCRIPTION: "Descripción",
  SEO_DESCRIPTION: "Descripción SEO",
  BODY: "Cuerpo del Mensaje",
  TIMESTAMPS: "Marcas de Tiempo",
  PINNED_COMMENT_CTA: "CTA Comentario Fijado",
  THUMBNAIL_CONCEPT_TEXT: "Idea para Miniatura",
  CAPTION: "Caption / Texto",
  HOOK: "Gancho / Hook",
  CTA: "Llamado a la Acción (CTA)",
  VISUAL: "Sugerencia Visual",
  ONSCREEN_TEXT: "Texto en Pantalla",
  ONSCREEN_HOOK_TEXT: "Gancho en Pantalla",
  SPOKEN_HOOK_SCRIPT: "Guion de Gancho (Hablado)",
  STICKER_TYPE: "Tipo de Sticker",
  LINK_OPTIONAL: "Enlace (Opcional)",
  TAGGED_ACCOUNTS: "Cuentas Etiquetadas",
  PRIMARY_COPY: "Copy Principal",
  ALTERNATE_COPY: "Copy Alterno",
};

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (typeof value !== 'string' || value.trim().length === 0 || value === "[Insert Link]") return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatLabel = (key: string) => {
    const upperKey = key.replace(/ /g, "_").toUpperCase();
    return fieldTranslations[upperKey] || key.replace(/_/g, " ").toUpperCase();
  };

  const isPrimary = /title|hook|subject|caption/i.test(label);
  const isLong = value.length > 500;
  
  return (
    <div className={clsx(
        "space-y-2 group/field relative transition-all duration-300 rounded-2xl",
        isPrimary ? "bg-white/[0.02] border border-white/5 p-4 -mx-1 shadow-sm" : "p-1"
    )}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            {isPrimary && <Sparkles className="w-3 h-3 text-indigo-400/50" />}
            <p className="text-[9px] font-black uppercase tracking-widest text-white/20">
            {formatLabel(label)}
            </p>
        </div>
        <button 
          onClick={handleCopy}
          className="opacity-0 group-hover/field:opacity-100 p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all shadow-sm"
          title="Copy field"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
      <div className="relative">
        <p className={clsx(
          "leading-relaxed whitespace-pre-line transition-all duration-300",
          isPrimary ? "text-sm font-bold text-white tracking-tight" : "text-[13px] text-white/70 font-medium",
          isLong && !isExpanded && "line-clamp-4"
        )}>
          {value}
        </p>
        {isLong && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 mt-2 block"
          >
            {isExpanded ? "Ver menos" : "Ver más"}
          </button>
        )}
      </div>
    </div>
  );
}

function CopyCard({ output }: { output: CopyOutput }) {
  const { t } = useI18n();
  const [copiedAll, setCopiedAll] = useState(false);
  const [showLogic, setShowLogic] = useState(false);
  const brandColor = platformColors[output.platformName] || platformColors.default;

  const handleCopyAll = () => {
    const allText = Object.entries(output.fields || {})
        .filter(([_, v]) => typeof v === 'string' && v.trim().length > 0 && v !== "[Insert Link]")
        .map(([k, v]) => `${k.toUpperCase()}:\n${v}`)
        .join("\n\n");
    navigator.clipboard.writeText(allText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const fields = output.fields || {};
  const entries = Object.entries(fields);
  
  // Separate specialized fields, filtering out empty ones with safe string checks
  const mainFields = entries.filter(([k, v]) => !/cta|hashtag|note/i.test(k) && typeof v === 'string' && v.trim().length > 0);
  const ctaField = entries.find(([k, v]) => /cta/i.test(k) && typeof v === 'string' && v.trim().length > 0);
  const hashtagField = entries.find(([k, v]) => /hashtag/i.test(k) && typeof v === 'string' && v.trim().length > 0);
  const noteField = entries.find(([k, v]) => /note/i.test(k) && typeof v === 'string' && v.trim().length > 0);

  const hasStrategy = output.strategicAlignment && (output.strategicAlignment.anchorsUsed?.length || output.strategicAlignment.triggersAddressed?.length);

  return (
    <div 
      className="group bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all flex flex-col h-full shadow-sm hover:shadow-indigo-500/5 relative break-inside-avoid mb-6"
      style={{ borderTop: `2px solid ${brandColor}60` }}
    >
      {/* Brand Background Wash */}
      <div 
        className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity pointer-events-none"
        style={{ backgroundColor: brandColor }}
      />

      <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.01] relative z-10">
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 pr-3 border-r border-white/5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: brandColor }} />
                <span className="text-[9px] font-black uppercase tracking-tighter text-white/40">{output.platformName}</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{output.formatName}</span>
            {hasStrategy && (
                <div title="Estrategia Activada" className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
            )}
        </div>
        <button 
          onClick={handleCopyAll}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all group/copy"
          title="Copiar todo"
        >
          {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="p-5 flex-1 space-y-6 relative z-10">
        {mainFields.map(([key, val]) => (
            <CopyField key={key} label={key} value={val} />
        ))}

        {(ctaField || hashtagField) && (
            <div className="grid grid-cols-1 gap-4 pt-4 border-t border-white/5">
                {ctaField && (
                    <div className="flex items-start gap-2">
                        <ExternalLink className="w-3 h-3 text-indigo-400/60 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-[9px] font-black uppercase text-white/20 mb-0.5">CTA</p>
                            <p className="text-xs font-bold text-indigo-400/80 leading-relaxed">{ctaField[1]}</p>
                        </div>
                    </div>
                )}
                {hashtagField && (
                    <div className="flex items-start gap-2">
                        <Hash className="w-3 h-3 text-white/20 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-[9px] font-black uppercase text-white/20 mb-0.5">{t("copywriter.output.hashtags")}</p>
                            <p className="text-[10px] text-white/30 font-medium leading-relaxed italic">{hashtagField[1]}</p>
                        </div>
                    </div>
                )}
            </div>
        )}

        {noteField && (
             <div className="space-y-2 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                    <ListTodo className="w-3 h-3 text-white/10" />
                    <p className="text-[9px] font-black uppercase text-white/20">{t("copywriter.output.notes")}</p>
                </div>
                <div className="text-[10px] text-white/20 leading-relaxed italic">
                    {noteField[1]}
                </div>
           </div>
        )}

        {output.strategicAlignment?.reasoning && (
             <div className="space-y-2 pt-4 border-t border-white/5">
                <button 
                    onClick={() => setShowLogic(!showLogic)}
                    className="flex items-center gap-2 text-indigo-400/40 hover:text-indigo-400/60 transition-colors"
                >
                    <Sparkles className="w-2.5 h-2.5" />
                    <p className="text-[8px] font-black uppercase tracking-widest">{showLogic ? 'Ocultar Lógica' : 'Ver Lógica'}</p>
                </button>
                {showLogic && (
                    <div className="p-3 rounded-xl bg-indigo-500/[0.02] border border-indigo-500/5 text-[10px] text-zinc-500 leading-relaxed font-medium">
                        {output.strategicAlignment.reasoning}
                    </div>
                )}
           </div>
        )}
      </div>
    </div>
  );
}

export function ResultSection({ outputs, loading, selectedFormats, platforms }: ResultSectionProps) {
  const { t } = useI18n();

  // STABILIZATION: Create a fixed map of all variants the user EXPECTS to see
  const intentMap = useMemo(() => {
    const allPossibleFormats = platforms.flatMap(p => p.formats.map(f => ({ ...f, platformName: p.name })));
    return selectedFormats.map(fid => {
        const details = allPossibleFormats.find(f => f.id === fid);
        return {
            id: fid,
            name: details?.name || fid,
            platformId: details?.platform_id || "",
            platformName: details?.platformName || ""
        };
    }).sort((a, b) => {
        const pComp = (a.platformName || "").localeCompare(b.platformName || "");
        if (pComp !== 0) return pComp;
        return (a.name || "").localeCompare(b.name || "");
    });
  }, [selectedFormats, platforms]);

  // COLUMN ALLOCATION: Assign each INTENDED slot to a fixed column
  const colLeft = intentMap.filter((_, i) => i % 2 === 0);
  const colRight = intentMap.filter((_, i) => i % 2 !== 0);

  const renderSlot = (intent: any) => {
    // Find if we have real data for this slot yet
    const realData = outputs.find(o => o.formatId === intent.id);
    
    if (realData) {
        return <CopyCard key={intent.id} output={realData} />;
    }

    // Otherwise render a skeleton in the same fixed position
    return (
        <div key={intent.id} className="group bg-white/[0.01] border border-white/5 rounded-2xl p-5 mb-6 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6 opacity-20">
                <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{intent.platformName}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{intent.name}</span>
            </div>
            <div className="space-y-4">
                <div className="h-3 w-3/4 bg-white/5 rounded-full animate-pulse" />
                <div className="h-20 w-full bg-white/5 rounded-2xl animate-pulse" />
                <div className="h-10 w-1/2 bg-white/5 rounded-2xl animate-pulse ml-auto opacity-30" />
            </div>
        </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in pb-12 items-start">
      <div className="flex flex-col">
        {colLeft.map(intent => renderSlot(intent))}
      </div>
      <div className="flex flex-col">
        {colRight.map(intent => renderSlot(intent))}
      </div>
    </div>
  );
}
