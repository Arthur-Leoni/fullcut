import whisper

_model_cache: dict[str, whisper.Whisper] = {}


def _get_model(model_name: str) -> whisper.Whisper:
    if model_name not in _model_cache:
        _model_cache[model_name] = whisper.load_model(model_name)
    return _model_cache[model_name]


def transcribe_audio(audio_path: str, model_name: str = "base") -> list[dict]:
    model = _get_model(model_name)
    result = model.transcribe(audio_path, word_timestamps=True)

    word_segments = []
    for segment in result["segments"]:
        for word_info in segment.get("words", []):
            word_segments.append({
                "word": word_info["word"],
                "start": word_info["start"],
                "end": word_info["end"],
                "probability": word_info.get("probability", 1.0),
            })

    return word_segments
