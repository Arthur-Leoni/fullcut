import os
import subprocess

from app.config import settings


def cut_video(
    input_path: str,
    keep_intervals: list[tuple[float, float]],
    output_path: str,
) -> None:
    """Cut video keeping only the specified intervals using filter_complex."""
    if not keep_intervals:
        raise ValueError("No intervals to keep")

    n = len(keep_intervals)
    total_keep = sum(end - start for start, end in keep_intervals)
    print(f"[CUTTER] {n} keep intervals, total keep time: {total_keep:.2f}s")
    for i, (s, e) in enumerate(keep_intervals):
        print(f"[CUTTER]   #{i}: {s:.3f} -> {e:.3f} ({e-s:.3f}s)")

    # Use filter_complex with trim/atrim + concat for reliable timestamp handling
    filter_parts = []
    concat_inputs = ""

    for i, (start, end) in enumerate(keep_intervals):
        filter_parts.append(
            f"[0:v]trim=start={start:.3f}:end={end:.3f},setpts=PTS-STARTPTS[v{i}]"
        )
        filter_parts.append(
            f"[0:a]atrim=start={start:.3f}:end={end:.3f},asetpts=PTS-STARTPTS[a{i}]"
        )
        concat_inputs += f"[v{i}][a{i}]"

    filter_parts.append(f"{concat_inputs}concat=n={n}:v=1:a=1[outv][outa]")
    filter_complex = ";".join(filter_parts)

    cmd = [
        settings.ffmpeg_path, "-y",
        "-i", input_path,
        "-filter_complex", filter_complex,
        "-map", "[outv]", "-map", "[outa]",
        "-c:v", "libx264", "-preset", "fast", "-crf", "18",
        "-c:a", "aac", "-b:a", "192k",
        "-movflags", "+faststart",
        output_path,
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"[CUTTER] FFmpeg error: {result.stderr[-1000:]}")
        result.check_returncode()

    print(f"[CUTTER] Output created: {output_path}")
