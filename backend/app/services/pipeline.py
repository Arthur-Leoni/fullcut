import asyncio
import os
import traceback

from app.config import settings
from app.models import JobStatus, ProcessingSettings, Segment
from app.services.audio import extract_audio
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
    output_path = os.path.join(job_dir, "output.mp4")

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

        # Step 2: Silence detection
        await progress("Detectando silêncios...", 15)
        silences = detect_silences(
            audio_path,
            threshold_db=proc_settings.silence_threshold_db,
            min_duration=proc_settings.min_silence_duration,
        )
        await progress(f"{len(silences)} silêncios encontrados", 25)

        # Step 3: Whisper transcription
        fillers: list[Segment] = []
        repetitions: list[Segment] = []
        word_segments: list[dict] = []

        if proc_settings.detect_fillers or proc_settings.detect_repetitions:
            await progress("Transcrevendo áudio (Whisper)...", 30)
            word_segments = transcribe_audio(audio_path, model_name=settings.whisper_model)
            await progress("Transcrição concluída", 70)

        # Step 4: Filler detection
        if proc_settings.detect_fillers and word_segments:
            await progress("Detectando filler words...", 72)
            fillers = detect_fillers(word_segments, proc_settings.filler_words)
            await progress(f"{len(fillers)} fillers encontrados", 80)

        # Step 5: Repetition detection
        if proc_settings.detect_repetitions and word_segments:
            await progress("Detectando repetições...", 82)
            repetitions = detect_repetitions(word_segments)
            await progress(f"{len(repetitions)} repetições encontradas", 85)

        # Step 6: Merge
        await progress("Calculando cortes...", 87)
        removed, keep_intervals = merge_segments(
            silences, fillers, repetitions,
            padding_s=proc_settings.padding_ms / 1000.0,
            total_duration=duration,
        )
        await progress(f"{len(removed)} trechos para remover", 90)

        # Step 7: Cut video
        if keep_intervals and len(keep_intervals) < len(removed) + 1 + 10000:
            await progress("Cortando vídeo...", 92)
            cut_video(input_path, keep_intervals, output_path)
            result_duration = get_duration(output_path)
            job.result_duration = result_duration
        else:
            # Nothing to cut or video is all silence
            import shutil
            shutil.copy2(input_path, output_path)
            job.result_duration = duration

        job.segments_removed = removed
        job.status = JobStatus.COMPLETED
        await progress("Concluído!", 100, "Vídeo pronto para download")

    except Exception as e:
        job.status = JobStatus.FAILED
        job.error = str(e)
        traceback.print_exc()
        await progress("Erro", -1, str(e))
