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
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div 
          className="relative w-24 h-24 rounded-2xl bg-[#1c1c1c] border border-[#27272a] overflow-hidden group cursor-pointer"
          onClick={triggerUpload}
        >
          {preview ? (
            <img 
              src={preview} 
              alt="Persona Avatar" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#71717a]">
              <Camera className="w-8 h-8 mb-1" />
              <span className="text-[10px] font-medium uppercase tracking-wider">Photo</span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {uploading ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-white" />
            )}
          </div>
        </div>

        <div className="flex-1 space-y-1">
          <h4 className="text-sm font-medium text-[#f4f4f5]">Persona Avatar</h4>
          <p className="text-xs text-[#a1a1aa]">
            Recommended: Square image, min 400x400px.
          </p>
          
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={triggerUpload}
              disabled={uploading}
              className="text-xs px-3 py-1.5 bg-[#27272a] hover:bg-[#3f3f46] text-[#f4f4f5] rounded-lg transition-colors disabled:opacity-50"
            >
              Change Photo
            </button>
            
            {success && (
              <div className="flex items-center gap-1 text-[#22c55e] text-[10px] font-medium uppercase">
                <CheckCircle2 className="w-3 h-3" />
                Updated
              </div>
            )}
            
            {error && (
              <div className="flex items-center gap-1 text-[#ef4444] text-[10px] font-medium uppercase">
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
