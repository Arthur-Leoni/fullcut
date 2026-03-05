import re
import subprocess

from app.config import settings
from app.models import Segment


def detect_silences(
    audio_path: str,
    threshold_db: float = -35.0,
    min_duration: float = 0.5,
) -> list[Segment]:
    cmd = [
        settings.ffmpeg_path,
        "-i", audio_path,
        "-af", f"silencedetect=noise={threshold_db}dB:d={min_duration}",
        "-f", "null", "-",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)

    starts = re.findall(r"silence_start:\s*([\d.]+)", result.stderr)
    ends = re.findall(r"silence_end:\s*([\d.]+)", result.stderr)

    silences = []
    for s, e in zip(starts, ends):
        start_f = float(s)
        end_f = float(e)
        silences.append(Segment(
            start=start_f,
            end=end_f,
            type="silence",
            label=f"silêncio {end_f - start_f:.1f}s",
        ))

    return silences
