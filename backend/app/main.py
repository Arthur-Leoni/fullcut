import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import jobs


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs(settings.upload_dir, exist_ok=True)
    # Add ffmpeg directory to PATH so Whisper and other libs can find it
    ffmpeg_dir = os.path.dirname(os.path.abspath(settings.ffmpeg_path))
    if ffmpeg_dir and ffmpeg_dir not in os.environ.get("PATH", ""):
        os.environ["PATH"] = ffmpeg_dir + os.pathsep + os.environ.get("PATH", "")
    yield


app = FastAPI(title="FullCut API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jobs.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
