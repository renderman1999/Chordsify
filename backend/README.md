# Chordsify API

Python FastAPI service that recognizes guitar chords from audio using madmom (CNN + CRF).

**License note:** madmom pretrained models are CC BY-NC-SA (non-commercial).

## Setup

Requires Python 3.11+ (3.12 recommended), ffmpeg, and a C compiler for Cython.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

Health check: `GET http://127.0.0.1:8001/api/health`

Analyze: `POST http://127.0.0.1:8001/api/analyze` with multipart field `file`.

> Note: default port is **8001** because many Linux desktops already use 8000 (e.g. HPLIP printer service).
