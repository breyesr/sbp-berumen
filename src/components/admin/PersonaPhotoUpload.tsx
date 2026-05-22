"use client";

import { useState, useRef } from "react";
import { Camera, Upload, Loader2, X, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";

interface PersonaPhotoUploadProps {
  personaId: string | number;
  currentPhotoUrl?: string;
  onUploadSuccess?: (newUrl: string) => void;
}

export function PersonaPhotoUpload({ personaId, currentPhotoUrl, onUploadSuccess }: PersonaPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`/api/admin/personas/${personaId}/photo`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setSuccess(true);
      if (onUploadSuccess) {
        onUploadSuccess(data.photo_url);
      }
    } catch (err: any) {
      setError(err.message);
      setPreview(currentPhotoUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4 font-body">
      <div className="flex items-center gap-6">
        <div 
          className="relative w-28 h-28 rounded-2xl bg-surface border border-border overflow-hidden group cursor-pointer shadow-sm hover:ring-2 hover:ring-primary/50 transition-all"
          onClick={triggerUpload}
        >
          {preview ? (
            <img 
              src={preview} 
              alt="Persona Avatar" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-foreground-subtle">
              <Camera className="w-8 h-8 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-widest font-brand">Photo</span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
            {uploading ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-primary" />
            )}
          </div>
        </div>

        <div className="flex-1 space-y-1">
          <h4 className="text-sm font-bold text-foreground font-brand uppercase tracking-wider">Persona Avatar</h4>
          <p className="text-xs text-foreground-subtle font-medium">
            Recommended: Square image, min 400x400px.
          </p>
          
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={triggerUpload}
              disabled={uploading}
              className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 bg-surface hover:bg-surface-hover text-foreground border border-border rounded-xl transition-all shadow-sm disabled:opacity-50 font-brand"
            >
              Change Photo
            </button>
            
            {success && (
              <div className="flex items-center gap-1.5 text-success text-[10px] font-bold uppercase tracking-widest font-brand bg-success/10 px-2 py-1 rounded-lg">
                <CheckCircle2 className="w-3 h-3" />
                Updated
              </div>
            )}
            
            {error && (
              <div className="flex items-center gap-1.5 text-error text-[10px] font-bold uppercase tracking-widest font-brand bg-error/10 px-2 py-1 rounded-lg">
                <AlertCircle className="w-3 h-3" />
                Error
              </div>
            )}
          </div>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
