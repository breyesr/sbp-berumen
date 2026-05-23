"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clsx } from "clsx";

interface KnowledgeDropzoneProps {
  personaId: string;
  onUploadSuccess?: () => void;
}

export function KnowledgeDropzone({ personaId, onUploadSuccess }: KnowledgeDropzoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
      setError(null);
      setSuccess(false);
      setProcessedCount(0);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);
    setSuccess(false);
    setProcessedCount(0);

    let successCount = 0;

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch(`/api/admin/personas/${encodeURIComponent(personaId)}/knowledge`, {
          method: "POST",
          body: formData,
        });

        // Check if the response is JSON before parsing
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const html = await response.text();
            // Simple check to see if the HTML contains a Postgres error
            if (html.includes("relation") && html.includes("does not exist")) {
                throw new Error("The 'documents' table is still missing in the database. Please verify the setup script ran on the correct URL.");
            }
            if (html.includes("OpenAI")) {
                throw new Error("There was an issue connecting to the AI embedding service.");
            }
            const statusText = response.statusText || `Status ${response.status}`;
            throw new Error(`Server returned an invalid response (${statusText}). Check Vercel logs for details.`);
        }

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || `Upload failed for ${file.name}`);
        
        successCount++;
        setProcessedCount(successCount);
      } catch (err: any) {
        setError(`Error subiendo ${file.name}: ${err.message}`);
        setUploading(false);
        return; // Stop on first error
      }
    }

    setSuccess(true);
    setFiles([]);
    if (onUploadSuccess) onUploadSuccess();
    setUploading(false);
  };

  return (
    <div className="space-y-4 font-body">
      <div 
        className={clsx(
          "relative border-2 border-dashed rounded-2xl p-8 transition-all text-center cursor-pointer group",
          files.length > 0 
            ? "border-primary/50 bg-primary/5" 
            : "border-border bg-background hover:border-primary/30 hover:bg-surface-hover"
        )}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          accept=".pdf,.txt,.docx,.md,.json"
          disabled={uploading}
          multiple
        />
        
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm text-foreground font-bold font-brand uppercase tracking-widest">Haz clic o arrastra archivos aquí</p>
          <p className="text-xs text-foreground-subtle font-medium">PDF, TXT, DOCX, MD o JSON (Máx. 10MB c/u)</p>
        </div>
      </div>

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="space-y-2 max-h-40 overflow-y-auto px-1 custom-scrollbar">
            {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border animate-in slide-in-from-left-2 duration-200 shadow-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-xs text-foreground font-medium truncate">{f.name}</span>
                        <span className="text-[10px] text-foreground-subtle flex-shrink-0">({(f.size / 1024).toFixed(0)} KB)</span>
                    </div>
                    {!uploading && (
                        <button onClick={() => removeFile(i)} className="p-1.5 hover:bg-foreground/5 rounded-lg transition-colors text-foreground-subtle hover:text-error">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            ))}
        </div>
      )}

      {files.length > 0 && (
        <Button 
          onClick={handleUpload} 
          disabled={uploading}
          className="w-full shadow-lg h-14 font-bold"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              Procesando ({processedCount}/{files.length})...
            </>
          ) : (
            `Subir ${files.length} archivo${files.length > 1 ? 's' : ''} y Entrenar`
          )}
        </Button>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm font-bold font-brand uppercase tracking-widest animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5" />
          Conocimiento integrado correctamente.
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm font-bold font-brand uppercase tracking-widest animate-fade-in shadow-sm">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
    </div>
  );
}
