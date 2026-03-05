"use client";

import type { ProgressEvent } from "@/hooks/useJobProgress";

interface ProcessingViewProps {
  progress: ProgressEvent | null;
  error: string | null;
}

export function ProcessingView({ progress, error }: ProcessingViewProps) {
  const percent = Math.max(0, Math.min(100, progress?.percent ?? 0));

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-full max-w-md">
        {error ? (
          <div className="text-center">
            <div className="text-4xl">❌</div>
            <p className="mt-4 text-lg font-medium text-red-500">
              Erro no processamento
            </p>
            <p className="mt-2 text-sm text-muted">{error}</p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <div className="text-4xl animate-pulse">⚙️</div>
              <p className="mt-4 text-lg font-medium">
                {progress?.stage || "Iniciando..."}
              </p>
              {progress?.message && (
                <p className="mt-1 text-sm text-muted">{progress.message}</p>
              )}
            </div>

            <div className="mt-8">
              <div className="flex justify-between text-sm text-muted">
                <span>Progresso</span>
                <span>{percent}%</span>
              </div>
              <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-foreground/5">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
