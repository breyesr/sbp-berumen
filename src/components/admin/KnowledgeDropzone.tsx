"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KnowledgeDropzoneProps {
  personaId: string;
  onUploadSuccess?: () => void;
}

export function KnowledgeDropzone({ personaId, onUploadSuccess }: KnowledgeDropzoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`/api/admin/personas/${personaId}/knowledge`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");

      setSuccess(true);
      setFile(null);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className={`relative border-2 border-dashed rounded-xl p-8 transition-colors text-center
          ${file ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}
        `}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          accept=".pdf,.txt,.docx,.md,.json"
          disabled={uploading}
        />
        
        <div className="flex flex-col items-center justify-center space-y-2">
          {file ? (
            <>
              <FileText className="w-10 h-10 text-indigo-400" />
              <p className="text-sm text-[#ededed] font-medium">{file.name}</p>
              <p className="text-xs text-[#a1a1aa]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 text-[#71717a]" />
              <p className="text-sm text-[#ededed]">Haz clic o arrastra un archivo aquí</p>
              <p className="text-xs text-[#a1a1aa]">PDF, TXT, DOCX, MD o JSON (Máx. 10MB)</p>
            </>
          )}
        </div>
      </div>

      {file && (
        <Button 
          onClick={handleUpload} 
          disabled={uploading}
          className="w-full shadow-lg"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando conocimiento...
            </>
          ) : (
            'Subir y Entrenar Persona'
          )}
        </Button>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          Conocimiento integrado correctamente.
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4" />
          Error: {error}
        </div>
      )}
    </div>
  );
}
