export type { PlaudProviderAdapter, PlaudRecordingRaw, PlaudFetchSource } from "./plaud-provider.interface.js";
export { MockPlaudAdapter } from "./mock-plaud.adapter.js";
export { ApiPlaudAdapter } from "./api-plaud.adapter.js";
export { UploadPlaudAdapter, getUploadAdapter } from "./upload-plaud.adapter.js";
export type { UploadInput } from "./upload-plaud.adapter.js";
import type { PlaudProviderAdapter } from "./plaud-provider.interface.js";
export declare function createPlaudAdapterFromEnv(env?: NodeJS.ProcessEnv): PlaudProviderAdapter;
