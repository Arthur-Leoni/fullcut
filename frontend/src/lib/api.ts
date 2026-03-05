const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ProcessingSettings {
  processing_mode: "cut_only" | "denoise_only" | "both" | "voice_isolation";
  noise_reduction_strength: number;
  silence_threshold_db: number;
  min_silence_duration: number;
  detect_fillers: boolean;
  detect_repetitions: boolean;
  filler_words: string[];
  padding_ms: number;
}

export interface Segment {
  start: number;
  end: number;
  type: string;
  label: string;
}

export interface Job {
  job_id: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  stage: string;
  created_at: string;
  settings: ProcessingSettings;
  original_filename: string | null;
  original_duration: number | null;
  result_duration: number | null;
  segments_removed: Segment[] | null;
  noise_reduced: boolean;
  voice_isolated: boolean;
  error: string | null;
}

export async function createJob(
  file: File,
  settings: ProcessingSettings
): Promise<{ job_id: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("settings_json", JSON.stringify(settings));

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/jobs`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 8000."
    );
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Upload falhou (${res.status})`);
  }

  return res.json();
}

export async function getJob(jobId: string): Promise<Job> {
  const res = await fetch(`${API_URL}/api/jobs/${jobId}`);
  if (!res.ok) throw new Error("Failed to fetch job");
  return res.json();
}

export function getDownloadUrl(jobId: string): string {
  return `${API_URL}/api/jobs/${jobId}/download`;
}

export function getProgressUrl(jobId: string): string {
  return `${API_URL}/api/jobs/${jobId}/progress`;
}
