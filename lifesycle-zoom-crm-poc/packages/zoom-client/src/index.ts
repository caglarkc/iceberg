import { HttpZoomClient, createZoomClient } from "./client.js";
import { MockZoomServiceAdapter } from "./mock-adapter.js";
import type { ZoomIntegrationClient } from "./types.js";

export * from "./types.js";
export * from "./client.js";
export * from "./mock-adapter.js";

export interface ZoomClientFactoryConfig {
  mode?: string;
  baseUrl?: string;
  apiKey?: string;
}

export function createZoomIntegrationClient(
  config: ZoomClientFactoryConfig = {}
): ZoomIntegrationClient {
  const mode = config.mode ?? process.env.ZOOM_MODE ?? "mock";
  const baseUrl = config.baseUrl ?? process.env.ZOOM_SERVICE_URL ?? "http://localhost:4010/api/v1";
  const apiKey = config.apiKey ?? process.env.ZOOM_SERVICE_API_KEY ?? "local-zoom-service-key";

  if (mode === "mock" && !process.env.ZOOM_SERVICE_URL) {
    return new MockZoomServiceAdapter();
  }

  if (mode === "mock") {
    return new HttpZoomClient({ baseUrl, apiKey });
  }

  return createZoomClient({ baseUrl, apiKey });
}
