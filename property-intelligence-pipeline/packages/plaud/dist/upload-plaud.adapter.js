export class UploadPlaudAdapter {
    source = "upload";
    uploads = new Map();
    async listRecordings() {
        return [...this.uploads.values()].sort((a, b) => b.recorded_at.localeCompare(a.recorded_at));
    }
    async fetchRecording(providerId) {
        const recording = this.uploads.get(providerId);
        if (!recording)
            throw new Error(`Upload recording not found: ${providerId}`);
        return recording;
    }
    ingestUpload(input) {
        const id = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const recording = {
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
    parseTextFile(content, filename) {
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
let uploadAdapter;
export function getUploadAdapter() {
    if (!uploadAdapter)
        uploadAdapter = new UploadPlaudAdapter();
    return uploadAdapter;
}
