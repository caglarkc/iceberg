import type { PlaudProviderAdapter, PlaudRecordingRaw } from "@pip/plaud";
import type { PipStore, PlaudRecording, TranscriptMatch } from "./store.js";
export type AppConfig = {
    companyId: string;
    actorId: string;
};
export declare class IngestService {
    private readonly store;
    private readonly plaud;
    private readonly config;
    constructor(store: PipStore, plaud: PlaudProviderAdapter, config: AppConfig);
    ingestFromMock(): Promise<PlaudRecording[]>;
    ingestRecording(providerId: string): Promise<PlaudRecording>;
    ingestUpload(raw: PlaudRecordingRaw): PlaudRecording;
    private persistRaw;
}
export declare class MatchService {
    private readonly store;
    private readonly config;
    constructor(store: PipStore, config: AppConfig);
    runMatch(recordingId: string, manualPropertyId?: string): TranscriptMatch;
    confirmMatch(recordingId: string, propertyId: string, actorId: string): TranscriptMatch;
}
export declare class ExtractService {
    private readonly store;
    private readonly config;
    constructor(store: PipStore, config: AppConfig);
    extract(recordingId: string): Promise<{
        extraction: import("./store.js").ProposalExtraction;
        aiRun: import("./store.js").AiRun;
    }>;
}
export declare class ReviewService {
    private readonly store;
    constructor(store: PipStore);
    decide(extractionId: string, decisions: Record<string, "approved" | "rejected">, actorId: string): import("./store.js").ProposalExtraction;
    listReviewQueue(companyId: string): {
        recording: PlaudRecording;
        extraction: import("./store.js").ProposalExtraction | undefined;
        match: TranscriptMatch | undefined;
    }[];
}
export declare class ApplyService {
    private readonly store;
    constructor(store: PipStore);
    apply(recordingId: string, actorId: string): {
        draft: import("@pip/crm").ProposalDraft;
        property_id: string;
    };
}
