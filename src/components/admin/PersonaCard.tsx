"use client";

import { Brain, FileText, Pencil, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n/I18nProvider";

interface PersonaCardProps {
  persona: {
    id: string;
    name: string;
    role: string;
    cluster: string;
    updated_at: string;
  };
  onEdit: () => void;
  onTrain: () => void;
  onViewDossier: () => void;
  onDelete: () => void;
}

export function PersonaCard({ persona, onEdit, onTrain, onViewDossier, onDelete }: PersonaCardProps) {
  const { formatDate } = useI18n();

  return (
    <div className="group/admincard relative bg-surface hover:bg-surface-hover border border-border hover:border-primary/30 rounded-2xl p-5 transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col justify-between overflow-hidden font-body">
      {/* Decorative Gradient Background */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 blur-3xl group-hover/admincard:bg-primary/10 transition-colors" />

      <div className="space-y-4 relative z-10">
        {/* Cluster Badge */}
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-widest font-brand">
            {persona.cluster}
          </span>
          <div className="flex gap-1 opacity-0 group-hover/admincard:opacity-100 transition-opacity">
            <button 
              onClick={onDelete} 
              className="p-1.5 text-foreground-subtle hover:text-error hover:bg-error/10 rounded-md transition-colors"
              title="Eliminar"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div>
          <h3 className="text-lg font-bold text-foreground group-hover/admincard:text-primary transition-colors truncate font-brand">
            {persona.name}
          </h3>
          <p className="text-sm text-foreground-muted line-clamp-1 mt-1 font-medium italic">
            {persona.role || "Sin rol definido"}
          </p>
        </div>

        {/* Knowledge Indicator Placeholder */}
        <div className="flex items-center gap-2 pt-2">
            <div className="h-1 flex-1 bg-background border border-border/50 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-primary/60 rounded-full" />
            </div>
            <span className="text-[10px] text-foreground-subtle font-bold uppercase font-brand">Health: 60%</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center gap-2 pt-4 border-t border-border relative z-10">
        <Button 
          className="flex-1 h-8 bg-background border border-border hover:border-primary/30 text-foreground-muted hover:text-primary transition-all shadow-none"
          onClick={onTrain}
        >
          <Brain className="w-3.5 h-3.5 mr-2" />
          <span className="text-[9px]">Entrenar</span>
        </Button>
        <button 
          onClick={onViewDossier}
          className="p-2 bg-background border border-border hover:border-primary/30 text-foreground-subtle hover:text-primary rounded-lg transition-all"
          title="Ver Dossier"
        >
          <FileText className="w-4 h-4" />
        </button>
        <button 
          onClick={onEdit}
          className="p-2 bg-background border border-border hover:border-primary/30 text-foreground-subtle hover:text-foreground rounded-lg transition-all"
          title="Editar Metadata"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>
      
      <div className="mt-4 flex items-center gap-1.5 text-[9px] text-foreground-subtle font-bold font-brand uppercase tracking-wider">
        <Calendar className="w-3 h-3" />
        {formatDate(persona.updated_at)}
      </div>
    </div>
  );
}
