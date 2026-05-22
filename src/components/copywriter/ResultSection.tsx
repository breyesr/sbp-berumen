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
        isPrimary ? "bg-surface border border-border/50 p-4 -mx-1 shadow-sm" : "p-1"
    )}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            {isPrimary && <Sparkles className="w-3 h-3 text-primary/50" />}
            <p className="text-[9px] font-bold uppercase tracking-widest text-foreground-subtle font-brand">
            {formatLabel(label)}
            </p>
        </div>
        <button 
          onClick={handleCopy}
          className="opacity-0 group-hover/field:opacity-100 p-1.5 rounded-md bg-surface-hover text-foreground-muted hover:text-foreground transition-all shadow-sm"
          title="Copy field"
        >
          {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
      <div className="relative">
        <p className={clsx(
          "leading-relaxed whitespace-pre-line transition-all duration-300",
          isPrimary ? "text-sm font-bold text-foreground tracking-tight font-brand" : "text-[13px] text-foreground-muted font-medium font-body",
          isLong && !isExpanded && "line-clamp-4"
        )}>
          {value}
        </p>
        {isLong && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[9px] font-bold uppercase tracking-widest text-primary hover:text-primary-hover mt-2 block font-brand"
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
      className="group bg-surface border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all flex flex-col h-full shadow-sm hover:shadow-lg relative break-inside-avoid mb-6"
      style={{ borderTop: `2px solid ${brandColor}` }}
    >
      {/* Brand Background Wash */}
      <div 
        className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none"
        style={{ backgroundColor: brandColor }}
      />

      <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-surface/50 relative z-10">
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 pr-3 border-r border-border">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: brandColor }} />
                <span className="text-[9px] font-bold uppercase tracking-tighter text-foreground-subtle font-brand">{output.platformName}</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground font-brand">{output.formatName}</span>
            {hasStrategy && (
                <div title="Estrategia Activada" className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
            )}
        </div>
        <button 
          onClick={handleCopyAll}
          className="p-1.5 rounded-lg bg-surface-hover text-foreground-muted hover:text-foreground transition-all group/copy border border-border"
          title="Copiar todo"
        >
          {copiedAll ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="p-5 flex-1 space-y-6 relative z-10">
        {mainFields.map(([key, val]) => (
            <CopyField key={key} label={key} value={val} />
        ))}

        {(ctaField || hashtagField) && (
            <div className="grid grid-cols-1 gap-4 pt-4 border-t border-border">
                {ctaField && (
                    <div className="flex items-start gap-2">
                        <ExternalLink className="w-3 h-3 text-primary/60 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-[9px] font-bold uppercase text-foreground-subtle mb-0.5 font-brand">CTA</p>
                            <p className="text-xs font-bold text-primary leading-relaxed font-body">{ctaField[1]}</p>
                        </div>
                    </div>
                )}
                {hashtagField && (
                    <div className="flex items-start gap-2">
                        <Hash className="w-3 h-3 text-foreground-subtle mt-0.5" />
                        <div className="flex-1">
                            <p className="text-[9px] font-bold uppercase text-foreground-subtle mb-0.5 font-brand">{t("copywriter.output.hashtags")}</p>
                            <p className="text-[10px] text-foreground-subtle font-medium leading-relaxed italic font-body">{hashtagField[1]}</p>
                        </div>
                    </div>
                )}
            </div>
        )}

        {noteField && (
             <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                    <ListTodo className="w-3 h-3 text-foreground-subtle" />
                    <p className="text-[9px] font-bold uppercase text-foreground-subtle font-brand">{t("copywriter.output.notes")}</p>
                </div>
                <div className="text-[10px] text-foreground-subtle leading-relaxed italic font-body">
                    {noteField[1]}
                </div>
           </div>
        )}

        {output.strategicAlignment?.reasoning && (
             <div className="space-y-2 pt-4 border-t border-border">
                <button 
                    onClick={() => setShowLogic(!showLogic)}
                    className="flex items-center gap-2 text-primary/60 hover:text-primary transition-colors"
                >
                    <Sparkles className="w-2.5 h-2.5" />
                    <p className="text-[8px] font-bold uppercase tracking-widest font-brand">{showLogic ? 'Ocultar Lógica' : 'Ver Lógica'}</p>
                </button>
                {showLogic && (
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-[10px] text-foreground-muted leading-relaxed font-medium font-body">
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
  // This map follows the natural order of platforms and formats defined in the data
  const intentMap = useMemo(() => {
    const allFormatsInDataOrder = platforms.flatMap(p => 
      p.formats.map(f => ({
        id: f.id,
        name: f.name,
        platformId: p.id,
        platformName: p.name
      }))
    );

    // Only include formats that the user actually selected, preserving their data-defined order
    return allFormatsInDataOrder.filter(f => selectedFormats.includes(f.id));
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
        <div key={intent.id} className="group bg-surface/30 border border-border rounded-2xl p-5 mb-6 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6 opacity-40">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground-subtle" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground-muted font-brand">{intent.platformName}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground-subtle font-brand">{intent.name}</span>
            </div>
            <div className="space-y-4">
                <div className="h-3 w-3/4 bg-foreground/5 rounded-full animate-pulse" />
                <div className="h-20 w-full bg-foreground/5 rounded-2xl animate-pulse" />
                <div className="h-10 w-1/2 bg-primary/10 rounded-2xl animate-pulse ml-auto opacity-30" />
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
