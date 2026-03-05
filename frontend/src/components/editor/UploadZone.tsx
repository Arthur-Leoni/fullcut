"use client";

import { useCallback, useState, useRef } from "react";
import {
  ACCEPTED_VIDEO_TYPES,
  ACCEPTED_EXTENSIONS,
  MAX_FILE_SIZE_MB,
  MAX_FILE_SIZE_BYTES,
} from "@/lib/constants";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export function UploadZone({ onFileSelected, disabled }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ext || !ACCEPTED_EXTENSIONS.includes(`.${ext}`)) {
        return `Formato não suportado. Use: ${ACCEPTED_EXTENSIONS.join(", ")}`;
      }
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `Arquivo muito grande. Máximo: ${MAX_FILE_SIZE_MB}MB`;
    }
    return null;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      const err = validateFile(file);
      if (err) {
        setError(err);
        return;
      }
      setError(null);
      onFileSelected(file);
    },
    [validateFile, onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`
        relative flex cursor-pointer flex-col items-center justify-center
        rounded-2xl border-2 border-dashed p-12 transition-colors
        ${isDragging ? "border-primary bg-primary/5" : "border-foreground/10 hover:border-primary/50 hover:bg-surface"}
        ${disabled ? "pointer-events-none opacity-50" : ""}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_VIDEO_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <div className="text-5xl">📹</div>
      <p className="mt-4 text-lg font-medium">
        Arraste seu vídeo aqui ou clique para selecionar
      </p>
      <p className="mt-2 text-sm text-muted">
        MP4, MOV, WebM, MKV &mdash; até {MAX_FILE_SIZE_MB}MB
      </p>

      {error && (
        <p className="mt-4 text-sm font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}
