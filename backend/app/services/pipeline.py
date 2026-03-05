import asyncio
import os
import shutil
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

    # Independent feature toggles
    want_isolate = proc_settings.isolate_voice
    want_denoise = proc_settings.remove_noise
    want_cut = proc_settings.cut_silences
    audio_modified = False  # Track if we changed the audio

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

        # The "current best" audio — starts as raw, gets improved by each step
        current_audio = audio_path

        # Step 2: Voice isolation (Demucs) — if enabled
        if want_isolate:
            await progress("Isolando voz (IA)...", 12)
            isolate_vocals(current_audio, clean_audio_path)
            current_audio = clean_audio_path
            audio_modified = True
            job.voice_isolated = True
            await progress("Voz isolada", 40)

        # Step 3: Noise reduction (afftdn) — if enabled
        if want_denoise:
            denoise_input = current_audio
            denoise_output = clean_audio_path if not audio_modified else os.path.join(job_dir, "audio_denoised.wav")
            await progress("Removendo ruído de fundo...", 42 if want_isolate else 12)
            reduce_noise(
                denoise_input,
                denoise_output,
                strength=proc_settings.noise_reduction_strength,
            )
            current_audio = denoise_output
            audio_modified = True
            job.noise_reduced = True
            await progress("Ruído removido", 50 if want_isolate else 18)

        # Step 4: Cut silences — if enabled
        if want_cut:
            # Use the best available audio for analysis
            analysis_audio = current_audio

            await progress("Detectando silêncios...", 52 if audio_modified else 20)
            silences = detect_silences(
                analysis_audio,
                threshold_db=proc_settings.silence_threshold_db,
                min_duration=proc_settings.min_silence_duration,
            )
            await progress(f"{len(silences)} silêncios encontrados", 55 if audio_modified else 25)

            # Whisper transcription
            fillers: list[Segment] = []
            repetitions: list[Segment] = []
            word_segments: list[dict] = []

            if proc_settings.detect_fillers or proc_settings.detect_repetitions:
                await progress("Transcrevendo áudio (Whisper)...", 58 if audio_modified else 30)
                word_segments = transcribe_audio(analysis_audio, model_name=settings.whisper_model)
                await progress("Transcrição concluída", 75 if audio_modified else 70)

            # Filler detection
            if proc_settings.detect_fillers and word_segments:
                await progress("Detectando filler words...", 77 if audio_modified else 72)
                fillers = detect_fillers(word_segments, proc_settings.filler_words)
                await progress(f"{len(fillers)} fillers encontrados", 80)

            # Repetition detection
            if proc_settings.detect_repetitions and word_segments:
                await progress("Detectando repetições...", 82)
                repetitions = detect_repetitions(word_segments)
                await progress(f"{len(repetitions)} repetições encontradas", 85)

            # Merge
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

            # Cut video
            if keep_intervals and len(keep_intervals) < len(removed) + 1 + 10000:
                await progress("Cortando vídeo...", 92)

                if want_isolate:
                    # Voice isolation was done externally — we need to first
                    # put the processed audio into the video, then cut that.
                    # replace_audio uses -c:v copy so it's fast (no re-encode).
                    intermediate_path = os.path.join(job_dir, "intermediate.mp4")
                    replace_audio_in_video(input_path, current_audio, intermediate_path)
                    cut_video(intermediate_path, keep_intervals, output_path)
                else:
                    # No voice isolation — cut original video.
                    # If denoise is on, apply afftdn inline in FFmpeg (efficient, one pass).
                    denoise_in_cutter = proc_settings.noise_reduction_strength if want_denoise else None
                    cut_video(input_path, keep_intervals, output_path, denoise_strength=denoise_in_cutter)

                result_duration = get_duration(output_path)
                job.result_duration = result_duration
            else:
                # Nothing to cut
                if audio_modified:
                    replace_audio_in_video(input_path, current_audio, output_path)
                else:
                    shutil.copy2(input_path, output_path)
                job.result_duration = duration

            job.segments_removed = removed

        else:
            # No cutting — just audio processing
            if audio_modified:
                await progress("Gerando vídeo com áudio processado...", 85)
                replace_audio_in_video(input_path, current_audio, output_path)
                result_duration = get_duration(output_path)
                job.result_duration = result_duration
            else:
                # Nothing to do at all — just copy
                shutil.copy2(input_path, output_path)
                job.result_duration = duration
            job.segments_removed = []

        job.status = JobStatus.COMPLETED
        await progress("Concluído!", 100, "Vídeo pronto para download")

    except Exception as e:
        job.status = JobStatus.FAILED
        job.error = str(e)
        traceback.print_exc()
        await progress("Erro", -1, str(e))
