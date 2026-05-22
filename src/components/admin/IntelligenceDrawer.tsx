"use client";

import { X, Brain, Pencil, Save, Loader2, Sparkles, ChevronDown, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KnowledgeDropzone } from "./KnowledgeDropzone";
import { PersonaPhotoUpload } from "./PersonaPhotoUpload";
import React, { useState } from "react";
import { clsx } from "clsx";

interface IntelligenceDrawerProps {
  persona: any;
  clusters: any[];
  mode: 'train' | 'edit';
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  onUploadSuccess?: () => void;
  submitting: boolean;
}

export function IntelligenceDrawer({ persona, clusters, mode, onClose, onSave, onUploadSuccess, submitting }: IntelligenceDrawerProps) {
  const [form, setForm] = useState(persona);

  if (!persona) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-md animate-fade-in font-body">
      {/* Backdrop Area (Click to close) */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer */}
      <div className="w-full max-w-xl bg-background border-l border-border shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-gradient-to-br from-primary/5 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                {mode === 'train' ? <Brain className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground tracking-tight font-brand uppercase">
                {mode === 'train' ? `Entrenar: ${persona.name}` : `Editar Persona`}
              </h2>
              <p className="text-[10px] text-foreground-subtle font-bold uppercase tracking-[0.2em] mt-0.5 font-brand">Intelligence Studio v1.0</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-hover rounded-full transition-colors group">
            <X className="w-6 h-6 text-foreground-subtle group-hover:text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {mode === 'train' ? (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-primary">
                    <Sparkles className="w-4 h-4" />
                    <h3 className="text-sm font-bold uppercase tracking-wider font-brand">Inyección de Conocimiento</h3>
                </div>
                <p className="text-sm text-foreground-muted leading-relaxed font-medium">
                  Sube documentos estratégicos para que la persona aprenda nuevos comportamientos, sesgos y conocimientos técnicos.
                </p>
                <KnowledgeDropzone personaId={persona.id} onUploadSuccess={onUploadSuccess} />
              </div>
              
              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                 <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-4 font-brand">Health Status</h4>
                 <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <span className="text-xs text-foreground-muted font-medium">Contextual Depth</span>
                        <span className="text-xs font-bold text-foreground uppercase tracking-widest font-brand">Advanced</span>
                    </div>
                    <div className="h-1.5 w-full bg-background rounded-full overflow-hidden border border-border/50 shadow-inner">
                        <div className="h-full w-4/5 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
                    </div>
                 </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <PersonaPhotoUpload 
                personaId={persona.id} 
                currentPhotoUrl={form.photo_url} 
                onUploadSuccess={(url) => setForm({ ...form, photo_url: url })}
              />

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-bold text-foreground-subtle uppercase tracking-widest font-brand">Nombre de la Persona</label>
                    <span className="text-[9px] text-foreground-subtle font-bold">{(form.name || '').length}/40</span>
                </div>
                <input
                  type="text"
                  value={form.name}
                  maxLength={40}
                  onChange={(e) => setForm({ ...form, name: e.target.value.slice(0, 40) })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 transition-colors shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-foreground-subtle uppercase tracking-widest px-1 font-brand">Cluster Organizacional</label>
                <div className="relative">
                    <select
                        value={form.cluster}
                        onChange={(e) => setForm({ ...form, cluster: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 transition-colors appearance-none cursor-pointer shadow-sm font-medium"
                    >
                        {clusters.map(c => <option key={c.id} value={c.name} className="bg-background">{c.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-foreground-subtle uppercase tracking-widest px-1 font-brand">Rol / Profesión</label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 transition-colors shadow-sm italic"
                />
              </div>

              <div className="flex items-center justify-between p-5 rounded-2xl bg-surface border border-border group shadow-sm">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-foreground uppercase tracking-widest font-brand">Estado del Agente</label>
                    <p className="text-[10px] text-foreground-subtle font-medium tracking-tight">Los agentes desactivados no aparecerán en los selectores.</p>
                </div>
                <button 
                    type="button"
                    onClick={() => setForm({ ...form, is_active: !form.is_active })}
                    className={clsx(
                        "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-brand",
                        form.is_active 
                            ? "bg-success/10 text-success border-success/20 shadow-sm" 
                            : "bg-foreground/5 text-foreground-subtle border-border"
                    )}
                >
                    {form.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span className="text-[10px] font-bold uppercase tracking-wider">{form.is_active ? "Activo" : "Desactivado"}</span>
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-bold text-foreground-subtle uppercase tracking-widest font-brand">Profundidad Estratégica</label>
                    <span className="text-[9px] text-foreground-subtle font-bold">{(form.context || '').length} chars</span>
                </div>
                <textarea
                  value={form.context || ''}
                  onChange={(e) => setForm({ ...form, context: e.target.value })}
                  rows={10}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/40 transition-colors text-sm leading-relaxed resize-none font-mono shadow-inner"
                  placeholder="Aquí aparecerá el núcleo de la IA una vez sintetizado. También puedes escribirlo manualmente..."
                />
              </div>
              
              <div className="pt-4">
                <Button 
                    onClick={() => onSave(form)} 
                    disabled={submitting} 
                    className="w-full h-14 font-bold shadow-lg"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> Guardar Cambios</>}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-surface">
            <p className="text-[10px] text-foreground-subtle text-center uppercase tracking-widest font-bold font-brand">
                IntelAgent Systems • Access Restricted to Administrator
            </p>
        </div>
      </div>
    </div>
  );
}
