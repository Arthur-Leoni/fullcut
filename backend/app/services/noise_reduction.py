import subprocess

from app.config import settings


def reduce_noise(audio_path: str, output_path: str, strength: float = 0.5) -> None:
    """Apply FFmpeg afftdn filter to reduce background noise.

    Args:
        audio_path: Path to input WAV audio.
        output_path: Path for cleaned WAV output.
        strength: 0.0 (light) to 1.0 (aggressive). Maps to afftdn noise floor.
    """
    # Map strength (0-1) to noise floor in dB
    # 0.0 -> -20 dB (light), 1.0 -> -80 dB (aggressive)
    noise_floor = -20 - (strength * 60)  # range: -20 to -80

    cmd = [
        settings.ffmpeg_path, "-y",
        "-i", audio_path,
        "-af", f"afftdn=nf={noise_floor:.0f}:tn=1",
        "-ar", "16000",
        "-ac", "1",
        "-c:a", "pcm_s16le",
        output_path,
    ]

    print(f"[DENOISE] Applying noise reduction (strength={strength:.1f}, nf={noise_floor:.0f}dB)")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"[DENOISE] FFmpeg error: {result.stderr[-500:]}")
        result.check_returncode()
    print(f"[DENOISE] Audio cleaned: {output_path}")


def replace_audio_in_video(
    video_path: str,
    clean_audio_path: str,
    output_path: str,
) -> None:
    """Replace audio track in video with cleaned audio (denoise-only mode).

    Copies video stream as-is and re-encodes audio from clean WAV.
    """
    cmd = [
        settings.ffmpeg_path, "-y",
        "-i", video_path,
        "-i", clean_audio_path,
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-c:v", "copy",
        "-c:a", "aac", "-b:a", "192k",
        "-movflags", "+faststart",
        "-shortest",
        output_path,
    ]

    print(f"[DENOISE] Replacing audio in video")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"[DENOISE] FFmpeg error: {result.stderr[-500:]}")
        result.check_returncode()
    print(f"[DENOISE] Video with clean audio: {output_path}")
