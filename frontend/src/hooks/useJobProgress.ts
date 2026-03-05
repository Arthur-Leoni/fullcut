"use client";

import { useState, useEffect } from "react";
import { getProgressUrl } from "@/lib/api";

export interface ProgressEvent {
  stage: string;
  percent: number;
  message: string;
}

export function useJobProgress(jobId: string | null) {
  const [progress, setProgress] = useState<ProgressEvent | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const eventSource = new EventSource(getProgressUrl(jobId));

    eventSource.addEventListener("progress", (event) => {
      const data: ProgressEvent = JSON.parse(event.data);
      setProgress(data);

      if (data.percent >= 100) {
        setIsComplete(true);
        eventSource.close();
      } else if (data.percent < 0) {
        setError(data.message || "Processing failed");
        eventSource.close();
      }
    });

    eventSource.onerror = () => {
      setError("Conexão perdida. Verifique o status do processamento.");
      eventSource.close();
    };

    return () => eventSource.close();
  }, [jobId]);

  return { progress, isComplete, error };
}
