import asyncio
import json
import os
import uuid
from datetime import datetime

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sse_starlette.sse import EventSourceResponse

from app.config import settings
from app.models import JobResponse, JobStatus, ProcessingSettings
from app.services.pipeline import run_pipeline
from app.store import store

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.post("")
async def create_job(
    file: UploadFile = File(...),
    settings_json: str = Form(default="{}"),
):
    if not file.filename:
        raise HTTPException(400, "No file provided")

    proc_settings = ProcessingSettings(**json.loads(settings_json))
    job_id = str(uuid.uuid4())
    job_dir = os.path.join(settings.upload_dir, job_id)
    os.makedirs(job_dir, exist_ok=True)

    input_path = os.path.join(job_dir, "input" + os.path.splitext(file.filename)[1])
    with open(input_path, "wb") as f:
        content = await file.read()
        if len(content) > settings.max_file_size_mb * 1024 * 1024:
            raise HTTPException(413, f"File too large. Max {settings.max_file_size_mb}MB")
        f.write(content)

    job = JobResponse(
        job_id=job_id,
        status=JobStatus.QUEUED,
        created_at=datetime.now(),
        settings=proc_settings,
        original_filename=file.filename,
    )
    store.add(job)

    loop = asyncio.get_event_loop()
    loop.run_in_executor(None, _run_pipeline_sync, job_id, input_path, proc_settings, loop)

    return {"job_id": job_id, "status": "queued"}


def _run_pipeline_sync(job_id: str, input_path: str, proc_settings: ProcessingSettings, loop):
    asyncio.run(run_pipeline(job_id, input_path, proc_settings, store, loop))


@router.get("/{job_id}")
async def get_job(job_id: str):
    job = store.get(job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    return job


@router.get("/{job_id}/progress")
async def job_progress(job_id: str):
    job = store.get(job_id)
    if not job:
        raise HTTPException(404, "Job not found")

    queue = store.progress_queues.get(job_id)
    if not queue:
        raise HTTPException(404, "Job not found")

    async def event_generator():
        while True:
            try:
                data = await asyncio.wait_for(queue.get(), timeout=30)
                yield {"event": "progress", "data": json.dumps(data)}
                if data.get("percent", 0) >= 100:
                    break
            except asyncio.TimeoutError:
                yield {"event": "ping", "data": ""}

    return EventSourceResponse(event_generator())


@router.get("/{job_id}/download")
async def download_result(job_id: str):
    job = store.get(job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    if job.status != JobStatus.COMPLETED:
        raise HTTPException(400, f"Job is {job.status.value}, not completed")

    output_path = os.path.join(settings.upload_dir, job_id, "output.mp4")
    if not os.path.exists(output_path):
        raise HTTPException(404, "Output file not found")

    return FileResponse(
        output_path,
        media_type="video/mp4",
        filename=f"fullcut_{job.original_filename or 'output.mp4'}",
    )
