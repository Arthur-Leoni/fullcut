import asyncio
from collections import OrderedDict

from app.models import JobResponse


class JobStore:
    def __init__(self, max_jobs: int = 100):
        self.jobs: OrderedDict[str, JobResponse] = OrderedDict()
        self.progress_queues: dict[str, asyncio.Queue] = {}
        self.max_jobs = max_jobs

    def add(self, job: JobResponse):
        if len(self.jobs) >= self.max_jobs:
            oldest_id, _ = self.jobs.popitem(last=False)
            self.progress_queues.pop(oldest_id, None)
        self.jobs[job.job_id] = job
        self.progress_queues[job.job_id] = asyncio.Queue()

    def get(self, job_id: str) -> JobResponse | None:
        return self.jobs.get(job_id)

    async def send_progress(self, job_id: str, stage: str, percent: int, message: str):
        job = self.jobs.get(job_id)
        if job:
            job.progress = percent
            job.stage = stage
        queue = self.progress_queues.get(job_id)
        if queue:
            await queue.put({"stage": stage, "percent": percent, "message": message})


store = JobStore()
