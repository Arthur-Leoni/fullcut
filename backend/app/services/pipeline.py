import asyncio
import os
import traceback

from app.config import settings
from app.models import JobStatus, ProcessingSettings, Segment
from app.services.audio import extract_audio
from app.services.noise_reduction import reduce_noise, replace_audio_in_video
from app.services.voice_isolation import isolate_vocals
from app.services.silence import detect_silences
from app.services.transcription import transcribe_audio
from app.services.filler import detect_fillers
from app.services.repetition import detect_repetitions
from app.services.merger import merge_segments
from app.services.cutter import cut_video
from app.store import JobStore
from app.utils.ffmpeg import get_duration


async def run_pipeline(
    job_id: str,
    input_path: str,
    proc_settings: ProcessingSettings,
    store: JobStore,
    loop: asyncio.AbstractEventLoop | None = None,
):
    job = store.get(job_id)
    if not job:
        return

    job.status = JobStatus.PROCESSING
    job_dir = os.path.dirname(input_path)
    audio_path = os.path.join(job_dir, "audio.wav")
    clean_audio_path = os.path.join(job_dir, "audio_clean.wav")
    output_path = os.path.join(job_dir, "output.mp4")

    mode = proc_settings.processing_mode  # "cut_only" | "denoise_only" | "both" | "voice_isolation"
    should_denoise = mode in ("denoise_only", "both")
    should_cut = mode in ("cut_only", "both")
    should_isolate = mode == "voice_isolation"

    async def progress(stage: str, percent: int, message: str = ""):
        await store.send_progress(job_id, stage, percent, message)

    try:
        # Get original duration
        duration = get_duration(input_path)
        job.original_duration = duration

        # Step 1: Extract audio
        await progress("Extraindo áudio...", 5)
        extract_audio(input_path, audio_path)
        await progress("Áudio extraído", 10)

        # Step 2: Noise reduction (if enabled)
        analysis_audio = audio_path  # audio used for analysis (silence/whisper)
        if should_denoise:
            await progress("Removendo ruído de fundo...", 12)
            reduce_noise(
                audio_path,
                clean_audio_path,
                strength=proc_settings.noise_reduction_strength,
            )
            analysis_audio = clean_audio_path
            await progress("Ruído removido", 18)

        # If denoise-only mode, just replace audio and finish
        if mode == "denoise_only":
            await progress("Gerando vídeo com áudio limpo...", 85)
            replace_audio_in_video(input_path, clean_audio_path, output_path)
            result_duration = get_duration(output_path)
            job.result_duration = result_duration
            job.segments_removed = []
            job.noise_reduced = True
            job.status = JobStatus.COMPLETED
            await progress("Concluído!", 100, "Vídeo pronto para download")
            return

        # If voice isolation mode, use Demucs to extract vocals
        if should_isolate:
            await progress("Isolando voz (IA)...", 15)
            isolate_vocals(audio_path, clean_audio_path)
            await progress("Voz isolada, gerando vídeo...", 80)
            replace_audio_in_video(input_path, clean_audio_path, output_path)
            result_duration = get_duration(output_path)
            job.result_duration = result_duration
            job.segments_removed = []
            job.voice_isolated = True
            job.status = JobStatus.COMPLETED
            await progress("Concluído!", 100, "Vídeo pronto para download")
            return

        # --- From here: cut_only or both ---

        # Step 3: Silence detection (use clean audio if denoised for better detection)
        await progress("Detectando silêncios...", 20)
        silences = detect_silences(
            analysis_audio,
            threshold_db=proc_settings.silence_threshold_db,
            min_duration=proc_settings.min_silence_duration,
        )
        await progress(f"{len(silences)} silêncios encontrados", 25)

        # Step 4: Whisper transcription
        fillers: list[Segment] = []
        repetitions: list[Segment] = []
        word_segments: list[dict] = []

        if proc_settings.detect_fillers or proc_settings.detect_repetitions:
            await progress("Transcrevendo áudio (Whisper)...", 30)
            word_segments = transcribe_audio(analysis_audio, model_name=settings.whisper_model)
            await progress("Transcrição concluída", 70)

        # Step 5: Filler detection
        if proc_settings.detect_fillers and word_segments:
            await progress("Detectando filler words...", 72)
            fillers = detect_fillers(word_segments, proc_settings.filler_words)
            await progress(f"{len(fillers)} fillers encontrados", 80)

        # Step 6: Repetition detection
        if proc_settings.detect_repetitions and word_segments:
            await progress("Detectando repetições...", 82)
            repetitions = detect_repetitions(word_segments)
            await progress(f"{len(repetitions)} repetições encontradas", 85)

        # Step 7: Merge
        await progress("Calculando cortes...", 87)
        removed, keep_intervals = merge_segments(
            silences, fillers, repetitions,
            padding_s=proc_settings.padding_ms / 1000.0,
            total_duration=duration,
        )

        # Debug logging
        total_remove = sum(s.end - s.start for s in removed)
        total_keep = sum(e - s for s, e in keep_intervals)
        print(f"[PIPELINE] Original duration: {duration:.2f}s")
        print(f"[PIPELINE] Segments to remove: {len(removed)}, total: {total_remove:.2f}s")
        print(f"[PIPELINE] Keep intervals: {len(keep_intervals)}, total: {total_keep:.2f}s")
        print(f"[PIPELINE] Expected result: {total_keep:.2f}s ({total_keep/duration*100:.1f}% of original)")

        await progress(f"{len(removed)} trechos para remover", 90)

        # Step 8: Cut video (with denoise filter if mode == "both")
        if keep_intervals and len(keep_intervals) < len(removed) + 1 + 10000:
            await progress("Cortando vídeo...", 92)
            denoise_strength = proc_settings.noise_reduction_strength if should_denoise else None
            cut_video(input_path, keep_intervals, output_path, denoise_strength=denoise_strength)
            result_duration = get_duration(output_path)
            job.result_duration = result_duration
        else:
            # Nothing to cut or video is all silence
            import shutil
            shutil.copy2(input_path, output_path)
            job.result_duration = duration

        job.segments_removed = removed
        job.noise_reduced = should_denoise
        job.status = JobStatus.COMPLETED
        await progress("Concluído!", 100, "Vídeo pronto para download")

    except Exception as e:
        job.status = JobStatus.FAILED
        job.error = str(e)
        traceback.print_exc()
        await progress("Erro", -1, str(e))
