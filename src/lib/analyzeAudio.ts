import type { ChordSection } from "@/components/ChordDisplay";

export interface AnalyzeResponse {
  chords: ChordSection[];
}

export async function analyzeAudio(file: File): Promise<ChordSection[]> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/analyze", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let detail = `Analysis failed (${response.status})`;
    try {
      const body = await response.json();
      if (typeof body?.detail === "string") {
        detail = body.detail;
      }
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(detail);
  }

  const data = (await response.json()) as AnalyzeResponse;
  return data.chords ?? [];
}
