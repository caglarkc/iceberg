import type { PlaudProviderAdapter, PlaudRecordingRaw } from "./plaud-provider.interface.js";
export declare class MockPlaudAdapter implements PlaudProviderAdapter {
    readonly source: "mock";
    private readonly recordings;
    constructor(fixturesDir?: string);
    listRecordings(since?: Date): Promise<PlaudRecordingRaw[]>;
    fetchRecording(providerId: string): Promise<PlaudRecordingRaw>;
}
