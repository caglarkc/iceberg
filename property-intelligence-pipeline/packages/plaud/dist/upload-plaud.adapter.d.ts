import type { PlaudProviderAdapter, PlaudRecordingRaw } from "./plaud-provider.interface.js";
export type UploadInput = {
    transcript_text: string;
    title?: string;
    recorded_at?: string;
    owner_hint?: string;
    summary_text?: string;
};
export declare class UploadPlaudAdapter implements PlaudProviderAdapter {
    readonly source: "upload";
    private readonly uploads;
    listRecordings(): Promise<PlaudRecordingRaw[]>;
    fetchRecording(providerId: string): Promise<PlaudRecordingRaw>;
    ingestUpload(input: UploadInput): PlaudRecordingRaw;
    parseTextFile(content: string, filename?: string): UploadInput;
}
export declare function getUploadAdapter(): UploadPlaudAdapter;
