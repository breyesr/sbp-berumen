"use client";

import { User, Info } from "lucide-react";
import { useI18n } from "@/components/i18n/I18nProvider";

interface IntelligenceBarProps {
    personaName?: string;
    personaRole?: string;
    personaCluster?: string;
    personaPhotoUrl?: string;
    onViewDossier: () => void;
    onChangePersona: () => void;
    isVisible: boolean;
}

export function IntelligenceBar({
    personaName,
    personaRole,
    personaCluster,
    personaPhotoUrl,
    onViewDossier,
    onChangePersona,
    isVisible
}: IntelligenceBarProps) {
    const { t } = useI18n();

    if (!isVisible || !personaName) return null;

    return (
        <div className="sticky top-0 z-50 -mx-6 px-6 py-3 bg-background/80 backdrop-blur-md border-b border-border mb-8 flex items-center justify-between shadow-lg animate-fade-in">
            <div className="flex items-center gap-4">
                <div 
                    onClick={onViewDossier}
                    className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                >
                    {personaPhotoUrl ? (
                        <img src={personaPhotoUrl} alt={personaName} className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-5 h-5 text-foreground-subtle" />
                    )}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground tracking-tight font-brand">{personaName}</span>
                        {personaCluster && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-[0.2em] bg-primary/10 text-primary border border-primary/20">
                                {personaCluster.replace("-", " & ")}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-foreground-muted truncate max-w-[200px] md:max-w-md font-body">{personaRole}</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button 
                    onClick={onViewDossier}
                    className="p-2 rounded-lg bg-surface text-foreground-muted hover:text-primary hover:bg-primary/10 transition-colors hidden sm:block border border-border"
                    title="View Dossier"
                >
                    <Info className="w-4 h-4" />
                </button>
                <button
                    onClick={onChangePersona}
                    className="px-4 py-2 rounded-xl bg-surface border border-border text-[10px] font-bold text-foreground-muted uppercase tracking-widest hover:bg-surface-hover hover:text-foreground transition-colors font-brand"
                >
                    Change
                </button>
            </div>
        </div>
    );
}
