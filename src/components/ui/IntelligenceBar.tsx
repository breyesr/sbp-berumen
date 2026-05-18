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
        <div className="sticky top-0 z-50 -mx-6 px-6 py-3 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 mb-8 flex items-center justify-between shadow-2xl animate-fade-in">
            <div className="flex items-center gap-4">
                <div 
                    onClick={onViewDossier}
                    className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-500/50 transition-all"
                >
                    {personaPhotoUrl ? (
                        <img src={personaPhotoUrl} alt={personaName} className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-5 h-5 text-white/40" />
                    )}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white tracking-tight">{personaName}</span>
                        {personaCluster && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-[0.2em] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                {personaCluster.replace("-", " & ")}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-zinc-400 truncate max-w-[200px] md:max-w-md">{personaRole}</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button 
                    onClick={onViewDossier}
                    className="p-2 rounded-lg bg-white/5 text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors hidden sm:block"
                    title="View Dossier"
                >
                    <Info className="w-4 h-4" />
                </button>
                <button
                    onClick={onChangePersona}
                    className="px-4 py-2 rounded-xl bg-white/5 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:bg-white/10 hover:text-white transition-colors"
                >
                    Change
                </button>
            </div>
        </div>
    );
}
