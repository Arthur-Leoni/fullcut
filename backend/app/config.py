from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    whisper_model: str = "base"
    upload_dir: str = "./uploads"
    max_file_size_mb: int = 500
    max_duration_minutes: int = 30
    file_ttl_hours: int = 1
    ffmpeg_path: str = "ffmpeg"
    ffprobe_path: str = "ffprobe"
    cors_origins: list[str] = ["http://localhost:3000"]
    host: str = "0.0.0.0"
    port: int = 8000

    model_config = {"env_file": ".env"}


settings = Settings()
