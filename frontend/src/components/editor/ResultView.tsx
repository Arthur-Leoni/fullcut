"use client";

import { useState } from "react";
import type { Job } from "@/lib/api";
import { getDownloadUrl } from "@/lib/api";

interface ResultViewProps {
  job: Job;
  onReset: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ResultView({ job, onReset }: ResultViewProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(getDownloadUrl(job.job_id));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fullcut_${job.original_filename || "output.mp4"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Erro ao baixar. Tente novamente.");
    } finally {
      setDownloading(false);
    }
  };

  const saved =
    job.original_duration && job.result_duration
      ? job.original_duration - job.result_duration
      : 0;
  const savedPercent =
    job.original_duration && saved > 0
      ? Math.round((saved / job.original_duration) * 100)
      : 0;

  const silences = job.segments_removed?.filter((s) => s.type === "silence").length ?? 0;
  const fillers = job.segments_removed?.filter((s) => s.type === "filler").length ?? 0;
  const repetitions = job.segments_removed?.filter((s) => s.type === "repetition").length ?? 0;
  const noiseReduced = job.noise_reduced;
  const voiceIsolated = job.voice_isolated;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="text-5xl">✅</div>
        <h2 className="mt-4 text-2xl font-bold">Vídeo pronto!</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl bg-surface p-4 text-center ring-1 ring-foreground/5">
          <p className="text-2xl font-bold text-primary">
            {job.original_duration ? formatDuration(job.original_duration) : "--"}
          </p>
          <p className="mt-1 text-xs text-muted">Original</p>
        </div>
        <div className="rounded-xl bg-surface p-4 text-center ring-1 ring-foreground/5">
          <p className="text-2xl font-bold text-primary">
            {job.result_duration ? formatDuration(job.result_duration) : "--"}
          </p>
          <p className="mt-1 text-xs text-muted">Editado</p>
        </div>
        <div className="rounded-xl bg-surface p-4 text-center ring-1 ring-foreground/5">
          <p className="text-2xl font-bold text-primary">
            {saved > 0 ? formatDuration(saved) : "--"}
          </p>
          <p className="mt-1 text-xs text-muted">Tempo removido</p>
        </div>
        <div className="rounded-xl bg-surface p-4 text-center ring-1 ring-foreground/5">
          <p className="text-2xl font-bold text-primary">
            {savedPercent > 0 ? `${savedPercent}%` : "--"}
          </p>
          <p className="mt-1 text-xs text-muted">Redução</p>
        </div>
      </div>

      {/* Segments breakdown */}
      {(silences > 0 || fillers > 0 || repetitions > 0 || noiseReduced || voiceIsolated) && (
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted">
          {voiceIsolated && <span>🎤 Voz isolada</span>}
          {noiseReduced && <span>🔊 Ruído removido</span>}
          {silences > 0 && <span>🔇 {silences} silêncios</span>}
          {fillers > 0 && <span>🗣️ {fillers} fillers</span>}
          {repetitions > 0 && <span>🔄 {repetitions} repetições</span>}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {downloading ? "Baixando..." : "⬇️ Baixar vídeo"}
        </button>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-full border border-foreground/10 px-8 py-3 text-sm font-semibold hover:bg-surface transition-colors"
        >
          Editar outro vídeo
        </button>
      </div>
    </div>
  );
}
