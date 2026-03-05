import json
import subprocess

from app.config import settings


def get_duration(file_path: str) -> float:
    cmd = [
        settings.ffprobe_path, "-v", "quiet",
        "-print_format", "json",
        "-show_format",
        file_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    info = json.loads(result.stdout)
    return float(info["format"]["duration"])


def run_ffmpeg(args: list[str], check: bool = True) -> subprocess.CompletedProcess:
    cmd = [settings.ffmpeg_path] + args
    return subprocess.run(cmd, capture_output=True, text=True, check=check)
