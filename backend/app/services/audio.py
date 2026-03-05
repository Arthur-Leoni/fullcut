from app.utils.ffmpeg import run_ffmpeg


def extract_audio(input_path: str, output_path: str) -> None:
    run_ffmpeg([
        "-y",
        "-i", input_path,
        "-vn",
        "-ar", "16000",
        "-ac", "1",
        "-c:a", "pcm_s16le",
        output_path,
    ])
