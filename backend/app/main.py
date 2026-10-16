"""FastAPI server for audio chord analysis."""

from __future__ import annotations

import logging
import os
import tempfile
import time
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.chords import recognize_chords

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger("chordsify")

MAX_UPLOAD_BYTES = 30 * 1024 * 1024  # 30 MB
ALLOWED_EXTENSIONS = {".mp3", ".wav", ".flac", ".ogg", ".m4a"}

app = FastAPI(title="Chordsify API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://[::1]:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChordSection(BaseModel):
    id: int
    startTime: float
    endTime: float
    chord: str


class AnalyzeResponse(BaseModel):
    chords: list[ChordSection]


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze(file: UploadFile = File(...)) -> AnalyzeResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename")

    suffix = Path(file.filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format '{suffix}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large (max {MAX_UPLOAD_BYTES // (1024 * 1024)} MB)",
        )

    size_mb = len(content) / (1024 * 1024)
    logger.info("Analyze request: %s (%.2f MB)", file.filename, size_mb)

    tmp_path: str | None = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        started = time.perf_counter()
        try:
            logger.info("Running madmom chord recognition...")
            chords = recognize_chords(tmp_path)
        except Exception as exc:  # madmom / IO errors
            logger.exception("Chord recognition failed")
            raise HTTPException(
                status_code=500,
                detail=f"Chord recognition failed: {exc}",
            ) from exc

        elapsed = time.perf_counter() - started
        logger.info(
            "Done: %d chord sections in %.1fs",
            len(chords),
            elapsed,
        )
        return AnalyzeResponse(chords=chords)
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)
