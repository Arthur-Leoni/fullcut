"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { UploadZone } from "@/components/editor/UploadZone";
import { SettingsPanel } from "@/components/editor/SettingsPanel";
import { ProcessingView } from "@/components/editor/ProcessingView";
import { ResultView } from "@/components/editor/ResultView";
import { useJobProgress } from "@/hooks/useJobProgress";
import { createJob, getJob } from "@/lib/api";
import type { ProcessingSettings, Job } from "@/lib/api";
import { DEFAULT_SETTINGS } from "@/lib/constants";

type EditorState = "upload" | "processing" | "result";

export default function EditorPage() {
  const [state, setState] = useState<EditorState>("upload");
  const [settings, setSettings] = useState<ProcessingSettings>(DEFAULT_SETTINGS);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { progress, isComplete, error: progressError } = useJobProgress(jobId);

  const handleFileSelected = useCallback((file: File) => {
    setSelectedFile(file);
    setUploadError(null);
  }, []);

  const handleProcess = useCallback(async () => {
    if (!selectedFile) return;

    try {
      setUploadError(null);
      setState("processing");
      const result = await createJob(selectedFile, settings);
      setJobId(result.job_id);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erro ao enviar vídeo");
      setState("upload");
    }
  }, [selectedFile, settings]);

  const handleReset = useCallback(() => {
    setState("upload");
    setSelectedFile(null);
    setJobId(null);
    setJob(null);
    setUploadError(null);
  }, []);

  // When processing completes, fetch final job data
  if (isComplete && jobId && state === "processing") {
    getJob(jobId).then((j) => {
      setJob(j);
      setState("result");
    });
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-foreground/5 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            FullCut
          </Link>
          {state !== "upload" && (
            <button
              onClick={handleReset}
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              Novo vídeo
            </button>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-12">
        {state === "upload" && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold">Envie seu vídeo</h1>
              <p className="mt-2 text-muted">
                Selecione um vídeo e escolha o que deseja fazer
              </p>
            </div>

            <UploadZone onFileSelected={handleFileSelected} />

            {selectedFile && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 rounded-xl bg-surface p-4 ring-1 ring-foreground/5">
                  <span className="text-2xl">🎬</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted">
                      {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                </div>

                <SettingsPanel settings={settings} onChange={setSettings} />

                {uploadError && (
                  <p className="text-center text-sm text-red-500">{uploadError}</p>
                )}

                <div className="text-center">
                  <button
                    onClick={handleProcess}
                    disabled={
                      !settings.cut_silences &&
                      !settings.remove_noise &&
                      !settings.isolate_voice
                    }
                    className="rounded-full bg-primary px-10 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Processar vídeo
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {state === "processing" && (
          <ProcessingView progress={progress} error={progressError} />
        )}

        {state === "result" && job && (
          <ResultView job={job} onReset={handleReset} />
        )}
      </div>
    </main>
  );
}
