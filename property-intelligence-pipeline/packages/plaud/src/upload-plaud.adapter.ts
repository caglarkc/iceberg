import type { PlaudProviderAdapter, PlaudRecordingRaw } from "./plaud-provider.interface.js";

export type UploadInput = {
  transcript_text: string;
  title?: string;
  recorded_at?: string;
  owner_hint?: string;
  summary_text?: string;
};

export class UploadPlaudAdapter implements PlaudProviderAdapter {
  readonly source = "upload" as const;
  private readonly uploads = new Map<string, PlaudRecordingRaw>();

  async listRecordings(): Promise<PlaudRecordingRaw[]> {
    return [...this.uploads.values()].sort((a, b) => b.recorded_at.localeCompare(a.recorded_at));
  }

  async fetchRecording(providerId: string): Promise<PlaudRecordingRaw> {
    const recording = this.uploads.get(providerId);
    if (!recording) throw new Error(`Upload recording not found: ${providerId}`);
    return recording;
  }

  ingestUpload(input: UploadInput): PlaudRecordingRaw {
    const id = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const recording: PlaudRecordingRaw = {
      provider_recording_id: id,
      title: input.title ?? "Manual upload",
      recorded_at: input.recorded_at ?? new Date().toISOString(),
      transcript_text: input.transcript_text,
      summary_text: input.summary_text,
      owner_hint: input.owner_hint,
      metadata: { source: "manual_upload" },
      fetched_via: "upload"
    };
    this.uploads.set(id, recording);
    return recording;
  }

  parseTextFile(content: string, filename?: string): UploadInput {
    const title = filename?.replace(/\.(txt|md)$/i, "") ?? "Uploaded transcript";
    const dateMatch = content.match(/Recorded:\s*(\d{4}-\d{2}-\d{2}[^\n]*)/i);
    return {
      transcript_text: content.trim(),
      title,
      recorded_at: dateMatch ? new Date(dateMatch[1]).toISOString() : undefined
    };
  }
}

/** Singleton for API layer — uploads persist in process memory */
let uploadAdapter: UploadPlaudAdapter | undefined;

export function getUploadAdapter(): UploadPlaudAdapter {
  if (!uploadAdapter) uploadAdapter = new UploadPlaudAdapter();
  return uploadAdapter;
}
