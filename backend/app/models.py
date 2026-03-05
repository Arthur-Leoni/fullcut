from pydantic import BaseModel
from enum import Enum
from datetime import datetime


class JobStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class ProcessingSettings(BaseModel):
    silence_threshold_db: float = -35.0
    min_silence_duration: float = 0.5
    detect_fillers: bool = True
    detect_repetitions: bool = True
    filler_words: list[str] = ["euh", "hmm", "ann", "hum", "uh", "um", "eh"]
    padding_ms: int = 100


class Segment(BaseModel):
    start: float
    end: float
    type: str  # "silence" | "filler" | "repetition"
    label: str


class JobResponse(BaseModel):
    job_id: str
    status: JobStatus
    progress: int = 0
    stage: str = ""
    created_at: datetime
    settings: ProcessingSettings
    original_filename: str | None = None
    original_duration: float | None = None
    result_duration: float | None = None
    segments_removed: list[Segment] | None = None
    error: str | None = None
