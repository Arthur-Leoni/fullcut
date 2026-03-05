from app.models import Segment


def merge_segments(
    silences: list[Segment],
    fillers: list[Segment],
    repetitions: list[Segment],
    padding_s: float = 0.1,
    total_duration: float = 0.0,
) -> tuple[list[Segment], list[tuple[float, float]]]:
    all_segments = silences + fillers + repetitions
    if not all_segments:
        return [], [(0.0, total_duration)] if total_duration > 0 else []

    all_segments.sort(key=lambda s: s.start)

    # Merge overlapping intervals
    merged: list[Segment] = []
    for seg in all_segments:
        if merged and seg.start <= merged[-1].end:
            if seg.end > merged[-1].end:
                merged[-1].end = seg.end
                merged[-1].label += f" + {seg.type}"
        else:
            merged.append(seg.model_copy())

    # Apply padding (shrink removal segments)
    for seg in merged:
        seg.start = max(0, seg.start + padding_s)
        seg.end = max(seg.start, seg.end - padding_s)

    # Remove segments that became too small after padding
    merged = [s for s in merged if s.end - s.start > 0.05]

    # Invert to "keep" intervals
    keep: list[tuple[float, float]] = []
    cursor = 0.0
    for seg in merged:
        if seg.start > cursor:
            keep.append((cursor, seg.start))
        cursor = seg.end
    if cursor < total_duration:
        keep.append((cursor, total_duration))

    return merged, keep
