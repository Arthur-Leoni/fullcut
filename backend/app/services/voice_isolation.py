"""
Voice isolation using Meta's Demucs (htdemucs model).
Separates audio into stems (drums, bass, other, vocals) and keeps only vocals.
"""

import torch
import torchaudio

_model_cache = None


def _get_model():
    """Load and cache the htdemucs model."""
    global _model_cache
    if _model_cache is None:
        from demucs.pretrained import get_model

        print("[VOICE_ISOLATION] Loading htdemucs model...")
        _model_cache = get_model("htdemucs")
        _model_cache.eval()
        print(f"[VOICE_ISOLATION] Model loaded (sources: {_model_cache.sources}, sr: {_model_cache.samplerate})")
    return _model_cache


def isolate_vocals(audio_path: str, output_path: str) -> None:
    """
    Isolate vocals from an audio file using Demucs htdemucs model.

    Args:
        audio_path: Path to input audio file (WAV)
        output_path: Path to save isolated vocals (WAV)
    """
    from demucs.apply import apply_model

    model = _get_model()

    # Load audio
    print(f"[VOICE_ISOLATION] Loading audio: {audio_path}")
    wav, sr = torchaudio.load(audio_path)

    # Resample to model's sample rate if needed (htdemucs expects 44100)
    if sr != model.samplerate:
        print(f"[VOICE_ISOLATION] Resampling {sr} -> {model.samplerate}")
        wav = torchaudio.functional.resample(wav, sr, model.samplerate)

    # Ensure stereo (Demucs expects 2 channels)
    if wav.shape[0] == 1:
        wav = wav.repeat(2, 1)

    # Add batch dimension: (channels, samples) -> (1, channels, samples)
    ref = wav.mean(0)
    wav = (wav - ref.mean()) / ref.std()
    wav_input = wav.unsqueeze(0)

    # Apply model
    print("[VOICE_ISOLATION] Running Demucs separation (this may take a while)...")
    with torch.no_grad():
        sources = apply_model(model, wav_input, device="cpu")

    # sources shape: (1, num_sources, channels, samples)
    # Find vocals index
    vocals_idx = model.sources.index("vocals")
    vocals = sources[0, vocals_idx]  # (channels, samples)

    # Denormalize
    vocals = vocals * ref.std() + ref.mean()

    # Convert back to mono for consistency with our pipeline (16kHz mono WAV)
    vocals_mono = vocals.mean(0, keepdim=True)  # (1, samples)

    # Resample back to 16kHz for pipeline compatibility
    vocals_mono = torchaudio.functional.resample(vocals_mono, model.samplerate, 16000)

    # Save
    torchaudio.save(output_path, vocals_mono, 16000)
    print(f"[VOICE_ISOLATION] Vocals saved to: {output_path}")
