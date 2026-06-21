import type { PlaudProviderAdapter, PlaudRecordingRaw } from "./plaud-provider.interface.js";
export type ApiPlaudConfig = {
    baseUrl: string;
    clientId: string;
    apiKey: string;
};
export declare class ApiPlaudAdapter implements PlaudProviderAdapter {
    private readonly config;
    readonly source: "api";
    constructor(config: ApiPlaudConfig);
    private assertConfigured;
    private headers;
    listRecordings(since?: Date): Promise<PlaudRecordingRaw[]>;
    fetchRecording(providerId: string): Promise<PlaudRecordingRaw>;
    verifyWebhook(headers: Record<string, string>, _body: string): boolean;
}
