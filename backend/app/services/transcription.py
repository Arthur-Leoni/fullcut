import warnings

import whisper

_model_cache: dict[str, whisper.Whisper] = {}


def _get_model(model_name: str) -> whisper.Whisper:
    if model_name not in _model_cache:
        _model_cache[model_name] = whisper.load_model(model_name)
    return _model_cache[model_name]


def transcribe_audio(audio_path: str, model_name: str = "base") -> list[dict]:
    model = _get_model(model_name)

    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        try:
            result = model.transcribe(
                audio_path,
                word_timestamps=True,
                condition_on_previous_text=False,
                no_speech_threshold=0.6,
                compression_ratio_threshold=2.4,
            )
        except RuntimeError as e:
            if "reshape" in str(e) or "0 elements" in str(e):
                # Whisper bug with certain audio segments — retry without word timestamps
                # then fall back to empty if that also fails
                try:
                    result = model.transcribe(audio_path, word_timestamps=False)
                    # Convert segment-level to pseudo word-level
                    word_segments = []
                    for segment in result.get("segments", []):
                        text = segment.get("text", "").strip()
                        if text:
                            word_segments.append({
                                "word": text,
                                "start": segment["start"],
                                "end": segment["end"],
                                "probability": segment.get("avg_logprob", 0.5),
                            })
                    return word_segments
                except Exception:
                    return []
            raise

    word_segments = []
    for segment in result.get("segments", []):
        for word_info in segment.get("words", []):
            word_segments.append({
                "word": word_info["word"],
                "start": word_info["start"],
                "end": word_info["end"],
                "probability": word_info.get("probability", 1.0),
            })

    return word_segments
