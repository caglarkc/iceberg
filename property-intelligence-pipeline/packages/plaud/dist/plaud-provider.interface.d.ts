export type PlaudFetchSource = "mock" | "upload" | "mcp" | "api_poll" | "webhook" | "cli" | "api";
export interface PlaudRecordingRaw {
    provider_recording_id: string;
    title?: string;
    recorded_at: string;
    duration_sec?: number;
    owner_hint?: string;
    transcript_text: string;
    summary_text?: string;
    template_type?: string;
    metadata: Record<string, unknown>;
    fetched_via: PlaudFetchSource;
}
export interface PlaudProviderAdapter {
    readonly source: "mock" | "api" | "upload";
    listRecordings(since?: Date): Promise<PlaudRecordingRaw[]>;
    fetchRecording(providerId: string): Promise<PlaudRecordingRaw>;
    verifyWebhook?(headers: Record<string, string>, body: string): boolean;
}
export type PlaudMode = "mock" | "live";
