export const MAX_FILE_SIZE_MB = 500;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-matroska",
];

export const ACCEPTED_EXTENSIONS = [".mp4", ".mov", ".webm", ".mkv"];

export const DEFAULT_SETTINGS = {
  processing_mode: "both" as const,
  noise_reduction_strength: 0.5,
  silence_threshold_db: -35,
  min_silence_duration: 0.5,
  detect_fillers: true,
  detect_repetitions: true,
  filler_words: ["euh", "hmm", "ann", "hum", "uh", "um", "eh"],
  padding_ms: 100,
};
