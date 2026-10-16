"""Chord recognition via madmom CNN + CRF."""

from __future__ import annotations

from functools import lru_cache
from typing import Any

from madmom.features.chords import (
    CNNChordFeatureProcessor,
    CRFChordRecognitionProcessor,
)
from madmom.processors import SequentialProcessor


QUALITY_MAP = {
    "maj": "",
    "min": "m",
}


def normalize_madmom_label(label: str) -> str | None:
    """Convert madmom labels like 'C:maj' / 'A:min' to UI names like 'C' / 'Am'.

    Returns None for no-chord ('N') or unrecognized labels.
    """
    if not label or label == "N":
        return None

    parts = label.split(":")
    if len(parts) == 1:
        return parts[0]

    root, quality = parts[0], parts[1]
    # madmom uses sharp spellings (Bb -> A#)
    suffix = QUALITY_MAP.get(quality)
    if suffix is None:
        # Keep dominant7 etc. as root + abbreviated quality when possible
        if quality == "7":
            return f"{root}7"
        if quality == "maj7":
            return f"{root}maj7"
        if quality == "min7":
            return f"{root}m7"
        return root

    return f"{root}{suffix}"


@lru_cache(maxsize=1)
def _get_processor() -> SequentialProcessor:
    return SequentialProcessor(
        [
            CNNChordFeatureProcessor(),
            CRFChordRecognitionProcessor(),
        ]
    )


def recognize_chords(audio_path: str) -> list[dict[str, Any]]:
    """Run chord recognition on an audio file path.

    Returns a list of dicts matching the frontend ChordSection shape:
    {id, startTime, endTime, chord}
    """
    processor = _get_processor()
    raw = processor(audio_path)

    sections: list[dict[str, Any]] = []
    next_id = 1

    for row in raw:
        start = float(row[0])
        end = float(row[1])
        label = str(row[2])
        chord = normalize_madmom_label(label)
        if chord is None:
            continue
        if end <= start:
            continue

        # Merge consecutive identical chords
        if sections and sections[-1]["chord"] == chord:
            sections[-1]["endTime"] = round(end, 3)
            continue

        sections.append(
            {
                "id": next_id,
                "startTime": round(start, 3),
                "endTime": round(end, 3),
                "chord": chord,
            }
        )
        next_id += 1

    return sections
