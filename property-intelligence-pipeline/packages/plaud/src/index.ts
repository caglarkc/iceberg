export type { PlaudProviderAdapter, PlaudRecordingRaw, PlaudFetchSource } from "./plaud-provider.interface.js";
export { MockPlaudAdapter } from "./mock-plaud.adapter.js";
export { ApiPlaudAdapter } from "./api-plaud.adapter.js";
export { UploadPlaudAdapter, getUploadAdapter } from "./upload-plaud.adapter.js";
export type { UploadInput } from "./upload-plaud.adapter.js";

import type { PlaudMode } from "./plaud-provider.interface.js";
import { MockPlaudAdapter } from "./mock-plaud.adapter.js";
import { ApiPlaudAdapter } from "./api-plaud.adapter.js";
import type { PlaudProviderAdapter } from "./plaud-provider.interface.js";

export function createPlaudAdapterFromEnv(env: NodeJS.ProcessEnv = process.env): PlaudProviderAdapter {
  const mode = (env.PLAUD_MODE ?? "mock") as PlaudMode;
  if (mode === "mock") return new MockPlaudAdapter();
  return new ApiPlaudAdapter({
    baseUrl: env.PLAUD_API_BASE_URL ?? "",
    clientId: env.PLAUD_CLIENT_ID ?? "",
    apiKey: env.PLAUD_CLIENT_API_KEY ?? ""
  });
}
