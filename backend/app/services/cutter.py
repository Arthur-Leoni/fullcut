import os
import subprocess

from app.config import settings


def cut_video(
    input_path: str,
    keep_intervals: list[tuple[float, float]],
    output_path: str,
) -> None:
    if not keep_intervals:
        raise ValueError("No intervals to keep")

    job_dir = os.path.dirname(output_path)
    segment_files: list[str] = []

    try:
        # Create segment clips
        for i, (start, end) in enumerate(keep_intervals):
            seg_path = os.path.join(job_dir, f"seg_{i:04d}.mp4")
            segment_files.append(seg_path)

            cmd = [
                settings.ffmpeg_path, "-y",
                "-ss", f"{start:.3f}",
                "-to", f"{end:.3f}",
                "-i", input_path,
                "-c:v", "libx264", "-preset", "fast", "-crf", "18",
                "-c:a", "aac", "-b:a", "192k",
                "-avoid_negative_ts", "make_zero",
                seg_path,
            ]
            subprocess.run(cmd, capture_output=True, text=True, check=True)

        # Create concat file
        concat_path = os.path.join(job_dir, "concat.txt")
        with open(concat_path, "w") as f:
            for seg in segment_files:
                f.write(f"file '{os.path.basename(seg)}'\n")

        # Concatenate segments
        cmd = [
            settings.ffmpeg_path, "-y",
            "-f", "concat", "-safe", "0",
            "-i", concat_path,
            "-c", "copy",
            output_path,
        ]
        subprocess.run(cmd, capture_output=True, text=True, check=True)

    finally:
        # Cleanup temp segments
        for seg in segment_files:
            if os.path.exists(seg):
                os.unlink(seg)
        concat_path = os.path.join(job_dir, "concat.txt")
        if os.path.exists(concat_path):
            os.unlink(concat_path)
