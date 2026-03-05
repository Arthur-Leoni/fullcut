import difflib

from app.models import Segment


def detect_fillers(
    word_segments: list[dict],
    filler_words: list[str],
    similarity_threshold: float = 0.7,
) -> list[Segment]:
    fillers = []

    for ws in word_segments:
        word = ws["word"].strip().lower()
        if not word:
            continue

        # Low probability words from Whisper are often fillers
        is_low_confidence = ws.get("probability", 1.0) < 0.5

        for filler in filler_words:
            ratio = difflib.SequenceMatcher(None, word, filler).ratio()
            threshold = similarity_threshold - (0.15 if is_low_confidence else 0)

            if ratio >= threshold:
                fillers.append(Segment(
                    start=ws["start"],
                    end=ws["end"],
                    type="filler",
                    label=f"filler: '{ws['word'].strip()}'",
                ))
                break

    return fillers
