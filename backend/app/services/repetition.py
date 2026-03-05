from difflib import SequenceMatcher

from app.models import Segment


def detect_repetitions(
    word_segments: list[dict],
    max_window: int = 5,
    similarity_threshold: float = 0.8,
    max_gap_seconds: float = 2.0,
) -> list[Segment]:
    if len(word_segments) < 4:
        return []

    repetitions = []
    words = [ws["word"].strip().lower() for ws in word_segments]
    used = set()  # track indices already marked as repetition

    for n in range(2, max_window + 1):
        i = 0
        while i + 2 * n <= len(words):
            if any(idx in used for idx in range(i, i + n)):
                i += 1
                continue

            phrase_a = " ".join(words[i:i + n])
            phrase_b = " ".join(words[i + n:i + 2 * n])

            # Check time gap between the two phrases
            gap = word_segments[i + n]["start"] - word_segments[i + n - 1]["end"]
            if gap > max_gap_seconds:
                i += 1
                continue

            ratio = SequenceMatcher(None, phrase_a, phrase_b).ratio()
            if ratio >= similarity_threshold:
                # Mark the first occurrence for removal (keep the second)
                repetitions.append(Segment(
                    start=word_segments[i]["start"],
                    end=word_segments[i + n - 1]["end"],
                    type="repetition",
                    label=f"repetição: '{phrase_a}'",
                ))
                for idx in range(i, i + n):
                    used.add(idx)
                i += 2 * n
            else:
                i += 1

    return repetitions
