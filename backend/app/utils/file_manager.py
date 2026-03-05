import os
import shutil
import time

from app.config import settings


def cleanup_expired_jobs():
    upload_dir = settings.upload_dir
    if not os.path.exists(upload_dir):
        return

    ttl_seconds = settings.file_ttl_hours * 3600
    now = time.time()

    for job_id in os.listdir(upload_dir):
        job_dir = os.path.join(upload_dir, job_id)
        if not os.path.isdir(job_dir):
            continue
        mtime = os.path.getmtime(job_dir)
        if now - mtime > ttl_seconds:
            shutil.rmtree(job_dir, ignore_errors=True)
